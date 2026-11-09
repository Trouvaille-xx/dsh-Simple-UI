# 分发指南（面向插件作者）

本文件是给你自己看的：怎么把 `dsh-simple-ui` 发出去、怎么让别人装、怎么发下一版。
别人只需要看 [README.zh-CN.md](README.zh-CN.md) 的「安装」一节。

## 别人可用的四种安装方式

### 1. 对话里让 Agent 装（推荐，零门槛）

对方把下面一句发给自己的 DSH：

```text
用 plugin_manager 的 install_bundle 安装 dsh-simple-ui，target 用
git+https://github.com/Trouvaille-xx/dsh-Simple-UI.git#v1.2.0
```

`#v1.2.0` 是 tag，钉死版本，避免别人装到半成品。也可以钉 commit：
`git+https://github.com/Trouvaille-xx/dsh-Simple-UI.git#4e7d6f4781c12032e90dd9f3d8eb99edc2d23e82`。

已实测：干净目录里 `pnpm add` 该 spec 可以拉到 1.2.0，`lib/client.js` 身份正确。

### 2. 插件市场索引（UI 里点一下）

仓库里的 `market/index.json` 就是一份 DSH `plugin-market` 索引（`format: 1`）。对方在
**设置 → 插件 → 发现** 添加索引 URL：

```text
https://raw.githubusercontent.com/Trouvaille-xx/dsh-Simple-UI/main/market/index.json
```

然后搜「Simple UI」直接安装。GitHub 直连不通的网络里可以用镜像：

```text
https://gh-proxy.com/https://raw.githubusercontent.com/Trouvaille-xx/dsh-Simple-UI/main/market/index.json
```

想换更稳的托管（GitHub Pages / jsDelivr / 自己的 CDN）时，只需要把 `market/index.json`
放到新地址，索引内容不用改。注意市场是「每个用户自己添加索引源」，所以**发一个 URL 给别人**
比自己建市场更现实。

索引格式已用 DSH 自带的解析器（`@deepseek-ai/dsh-plugin-market` 的 `worker.cjs`）校验通过，
不是猜的。

### 3. GitHub Release 离线包（网络最差的兜底）

<https://github.com/Trouvaille-xx/dsh-Simple-UI/releases/tag/v1.2.0> 挂着两个文件：

- `dsh-simple-ui-1.2.0.zip`：解压得到 `dsh-simple-ui/` 目录 → 让对方把**目录绝对路径**
  交给 `plugin_manager` 的 `install_bundle`。
- `dsh-simple-ui-1.2.0.tgz`：pnpm 包，对方可 `pnpm add file:<路径>/dsh-simple-ui-1.2.0.tgz`。

### 4. npm（可选，要你先登录）

包名 `dsh-simple-ui` 在 npm 上**当前未被占用**，但本机 npm 未登录，需要你自己来：

```powershell
npm login
cd D:\A-AgentWorkspace\09\dsh-simple-ui
npm publish            # 已配好 files，发布内容 10 个文件 / 约 18KB
```

发出去之后，对方就能用最短的 spec 安装（`install_bundle` 的 target 直接写包名）：

```text
用 plugin_manager 的 install_bundle 安装 dsh-simple-ui
```

注意：npm 上发出去就不好撤回（72 小时后基本不能 unpublish），建议先确认版本内容。
`package.json` 里没有声明 `engines.dsh`，所以不会因为 DSH 预发布版本号把安装挡掉。

## 发下一版的最小流程

```powershell
cd D:\A-AgentWorkspace\09\dsh-simple-ui

# 1. 改代码后先自测
node --check lib/client.js
node D:\A-AgentWorkspace\09\dsh-simple-ui-tests\client.test.mjs

# 2. 改版本号
#    package.json 里的 version（例如 1.2.0 -> 1.1.1）

# 3. 提交并打 tag
git add -A
git commit -m "feat: ..."
git tag -a v1.1.1 -m "v1.1.1: ..."

# 4. 重新生成市场索引（会固定到当前 HEAD）
node tools/make-market-index.mjs
git add market/index.json
git commit -m "chore(market): index 1.1.1"

# 5. 推送
git push origin main
git push origin v1.1.1

# 6. 打离线包 + 发 Release
$rel = "dist"; New-Item -ItemType Directory $rel -Force | Out-Null
npm pack --pack-destination $rel
gh release create v1.1.1 --repo Trouvaille-xx/dsh-Simple-UI `
  --title "Simple UI 1.1.1" --notes-file "$rel\RELEASE_NOTES.md" `
  "$rel\dsh-simple-ui-1.1.1.tgz"
```

索引里的 `source.commit` 必须指向**包含该版本代码的提交**；`tools/make-market-index.mjs`
会自动取 `git rev-parse HEAD`，所以顺序是「先提交代码 → 再生成索引」。

## 校验清单（发版前）

- [ ] `node --check lib/client.js` 通过
- [ ] 无头测试全绿（25 项）
- [ ] `node tools/make-market-index.mjs` 生成后，用 DSH 自带解析器校验：
      `node D:\A-AgentWorkspace\09\dsh-simple-ui-tests\market-index.test.mjs <...>/dsh-plugin-market/lib/worker.cjs market/index.json`
- [ ] `npm pack --dry-run` 文件列表正确（lib / locale / icon.svg / cordis.patch.yml / README / LICENSE）
- [ ] 干净目录实测 `pnpm add git+https://github.com/Trouvaille-xx/dsh-Simple-UI.git#<tag>`
- [ ] 装到真实 DSH 后：设置里出现「外观皮肤」，8 个预设可点，刷新后设置仍在

## 几个容易踩的坑

1. **包名 = 浏览器模块身份**。`lib/client.js` 里 `window.__ModuleLoader__.load({ id })` 的 `id`
   必须等于 `package.json` 的 `name`，否则宿主报 `bundle ... loaded without registering`，
   插件看起来装了但界面里没有。
2. **`cordis.patch.yml` 的插入行 `name` 必须是包名**，`id` 可以自定义但别和别的插件撞。
3. **不要改别人的 profile 文件**。安装一律走 `plugin_manager install_bundle`；手改
   `package.json` / `cordis.patch.yml` 容易和别的插件互相覆盖。
4. **改了 `package.json` 要重启进程**才生效（宿主只在插件条目启动时读 manifest）；
   只改 `lib/client.js` 会热载。
5. **别用网络字体**：`@import` 会阻塞首屏，而且 `fonts.googleapis.com`、`jsdelivr` 在很多
   网络里不可达，中文字体子集还经常缺字。本地字体栈最稳。
6. **别写死宿主的哈希类名**：`.pI_x6G_*`、`.uV2eYG_*` 这类是构建产物，DSH 一升级就变。
