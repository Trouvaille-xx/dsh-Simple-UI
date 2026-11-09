# DSH Simple UI

面向 DeepSeek Harness（dsh）Web 客户端的外观皮肤插件：8 套工业风预设，加上主色 / 辅助色 / 中性色 / 字体色、中英文字体、背景图的独立定制。所有设置保存在浏览器本地，刷新与重启后仍在；不加载任何网络字体，离线可用。

仓库：<https://github.com/Trouvaille-xx/dsh-Simple-UI>

## 功能

- 8 套预设：`[CC]`、Apple 银灰、深空蓝终端、霓虹黑紫、夜之城 2077、红白页、报纸版面、素描线稿。
- 主色、辅助色、中性色、字体颜色四行独立配置；每行第一个色块是自由取色面板，其余为预设色板。
- 中文字体与英文字体分别配置；全部走本地字体栈，缺失时用同风格本地近似兜底，中文不会缺字。
- 上传背景图，可单独开关；只作用于侧栏与会话区，设置页与弹窗保持隔离；图片超过约 1.5MB 时自动等比压缩。
- 「清除背景图」「恢复默认」一键还原。
- 设置持久化在 `localStorage`（键 `dsh-simple-ui.preset.v1` / `dsh-simple-ui.bg.v1`），刷新和重启后自动恢复。
- 不引用任何 CDN 或网络字体：首屏零网络阻塞，断网也能正常显示。
- 皮肤针对宿主的选择器集中在 `HOST_SELECTORS` 表里（哈希 + 语义兜底）：DSH 升级导致哈希类名变化时，样式降级为宿主默认外观，不会破版。
- 通过 DSH 真实 API 下发主题 token（`theme.overrideTokens`），不改写宿主 DOM，不替换会话渲染器。

## 安装

本插件是 DSH profile 的本地 bundle。推荐用 DSH 自带的插件安装能力，不要手改 profile 的 `package.json` / `cordis.patch.yml`。

方式一，设置页安装：

1. 打开 **设置 → 插件 → 安装本地插件**，选择本仓库目录（含 `package.json`）。
2. 安装完成后打开 **设置 → 外观皮肤**。

方式二，对话里让 Agent 安装：

```text
用 plugin_manager 的 install_bundle，target 传 D:\A-AgentWorkspace\09\dsh-simple-ui
```

方式三，手动 link（仅调试用）：

```powershell
cd $env:USERPROFILE\.dsh\profiles\<profile>
pnpm add link:D:\A-AgentWorkspace\09\dsh-simple-ui
```

把 `dsh-simple-ui` 加进该 profile `package.json` 的 `dsh.profile.bundles` 后重启 DSH。

说明：`lib/client.js` 这类实现文件的改动会被宿主热载；`package.json`（含展示名、图标、exports）的改动要重启进程才生效，因为宿主只在插件条目启动时读 manifest。

## 数据与隐私

- 不保存、不渲染 API Key。
- 皮肤设置与背景图只存在本机浏览器的 `localStorage`，不发送给模型，也不写入会话。
- 不序列化宿主内部对象。

## 开发

纯 JavaScript 双面插件（无构建步骤）：

- `lib/index.js`：Host 半侧（仅声明，`apply` 为空）
- `lib/client.js`：浏览器 Client 半侧，`window.__ModuleLoader__.load({ id: "dsh-simple-ui", factory })`
- `cordis.patch.yml`：bundle patch，把插件行插进宿主组合
- `locale/zh.json`、`locale/en.json`、`icon.svg`：插件列表里的展示名、描述与图标

语法自查：

```powershell
node --check lib/client.js
```

行为回归（在 Node 沙箱里真实执行 `lib/client.js` 的工厂，注入假的 theme / slots / React / DOM）：

```powershell
node D:\A-AgentWorkspace\09\dsh-simple-ui-tests\client.test.mjs
```

该用例覆盖：工厂身份、设置分区注册、8 个预设逐个应用、颜色图层不泄漏、设置跨重载恢复、卸载清理、无网络字体引用、宿主选择器占位符可解析、CSS 结构合法。

## 已知限制

- 背景图受浏览器 `localStorage` 配额限制；压缩后仍存不下时只在本次会话生效，界面会给出提示。
- 宿主大改版后，`aside` / `header` / `main` 这类语义兜底选择器范围比原哈希宽，可能出现轻微样式串扰；无兜底的卡片装饰则会直接降级为宿主默认样式。

## 许可证

MIT
