# DSH Simple UI

一个面向 DeepSeek Harness 的持久化 Web Profile 插件，为 DSH 增加工业风外观皮肤，以及少量基于真实运行时的 UI 增强。

仓库地址：<https://github.com/Trouvaille-xx/Dsh-Simple-UI>

## 功能

- 工业风视觉预设：
  - `[CC]`
  - Apple 银灰
  - 深空蓝终端
  - 霓虹黑紫
  - 夜之城 2077
  - 红白页
  - 报纸版面
  - 素描线稿
- 主色、辅助色、中性色、字体颜色独立配置。
- 四个颜色配置行的第一个色块都是自由取色面板。
- 每行保留预设色板和额外的自定义取色入口。
- 中文字体和英文字体分别配置。
- 支持上传背景图片，并可以单独关闭图片背景。
- 图片背景只作用于侧边栏和会话区域，设置页与弹窗保持隔离。
- 主色会同步到会话发送按钮。
- 通过 DSH 真实 API 读取模型目录并切换当前会话模型。
- 支持只读探查 OpenAI-compatible Base URL 的模型列表。
- 使用 DSH 原生会话、流式输出、工具调用和图片附件流程，不使用演示假回复替代真实运行时。

## 安装到 DSH Web Profile

本插件设计为 DSH Web Profile 的本地 bundle。

在 DSH Web Profile 目录执行：

```powershell
pnpm add dsh-simple-ui
```

如果安装器没有自动添加 bundle，请将 `dsh-simple-ui` 加入 profile 的 `dsh.profile.bundles` 列表。

插件包中的 `dsh.bundle.patch` 会自动把插件行插入宿主组合。修改 profile bundle 后需要重启 DSH。

## 手动安装

1. 将插件放到：

   ```text
   %USERPROFILE%\.dsh\profiles\web\node_modules\dsh-simple-ui\
   ```

2. 在 Web Profile 的 `package.json` 中，将 `dsh-simple-ui` 加入 `dsh.profile.bundles`。
3. 重启 DSH。
4. 打开 **设置 → 外观皮肤**。

## 运行要求

- 已安装 Web Profile 的 DeepSeek Harness。
- DSH 客户端 Slot 系统可用。
- 浏览器客户端连接提供标准 DSH API。
- 模型选择使用：
  - `llm.models`
  - `sessions.models`
  - `sessions.selectModel`
- Base URL 探查使用：
  - `llm.discoverModels`
  - `openai-completions` 协议

## 安全与隐私

- 插件不会保存或渲染 API Key。
- Base URL 探查是只读操作。
- 插件不会序列化或暴露 Host 内部对象。
- 用户上传的背景图片只用于客户端界面状态，不会发送给模型。

## 开发结构

本插件使用 DSH 双面插件格式，并且只使用原生 JavaScript：

- `lib/index.js`：Host 半部
- `lib/client.js`：浏览器 Client 半部
- `cordis.patch.yml`：Web Profile bundle patch

检查浏览器 bundle 语法：

```powershell
node --check lib/client.js
```

## 许可证

MIT
