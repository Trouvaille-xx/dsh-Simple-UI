# DSH Simple UI

A persistent DeepSeek Harness web-profile plugin that adds an industrial UI skin and small real-runtime UI enhancements.

Repository: https://github.com/Trouvaille-xx/Dsh-Simple-UI

## Features

- Industrial visual presets:
  - `[CC]`
  - Apple 银灰
  - 深空蓝终端
  - 霓虹黑紫
  - 夜之城 2077
  - 红白页
  - 报纸版面
  - 素描线稿
- Independent main, accent, neutral, and text-color controls.
- The first color cell in each color row is a free color picker.
- Ten-cell palette rows with an additional custom color picker.
- Font controls for Chinese and English fonts.
- Uploadable background image with an enable/disable switch.
- Background image is scoped to the sidebar/conversation regions; settings and dialogs remain isolated.
- Main color is applied to the conversation send button.
- Real DSH model catalog and live-session model selection through the Harness client API.
- Read-only OpenAI-compatible Base URL model discovery.
- Real session-aware status slots without replacing the native DSH conversation renderer.

The plugin does not replace DSH's real conversation, streaming, tool-call, or attachment pipeline.

## Install in a DSH web profile

This package is designed to be installed as a local DSH web-profile bundle.

From the DSH profile directory:

```powershell
pnpm add dsh-simple-ui
```

Then add `dsh-simple-ui` to the profile's `dsh.profile.bundles` list if the installer does not do so automatically.

The package's `dsh.bundle.patch` inserts the plugin row into the host composition. Restart DSH after changing the profile bundle list.

## Manual local installation

1. Place this package under:

   ```text
   %USERPROFILE%\.dsh\profiles\web\node_modules\dsh-simple-ui\
   ```

2. Add `dsh-simple-ui` to `dsh.profile.bundles` in the web profile `package.json`.
3. Restart DSH.
4. Open **Settings → 外观皮肤**.

## Runtime requirements

- DeepSeek Harness with the web profile and client slot system.
- A web client connection exposing the standard DSH API.
- The model selector uses `llm.models`, `sessions.models`, and `sessions.selectModel`.
- Base URL discovery uses `llm.discoverModels` with the OpenAI-compatible protocol.

## Security and privacy

- API keys are not stored or rendered by this plugin.
- Base URL discovery is read-only.
- The plugin does not serialize live Host objects.
- User-uploaded backgrounds remain client-side UI state and are not sent to a model.

## Development

The package uses plain JavaScript and the DSH dual-face package format:

- `lib/index.js`: Host half
- `lib/client.js`: browser Client half
- `cordis.patch.yml`: web-profile bundle patch

Validate the browser bundle with:

```powershell
node --check lib/client.js
```

## License

MIT
