# DSH Simple UI

An appearance plugin for the DeepSeek Harness (dsh) web client: eight industrial-style skin presets plus independent controls for brand, accent, neutral, and text colours, Chinese/English fonts, and a background image. Everything is stored in the browser, survives reload and restart, and loads no web fonts, so it works fully offline.

Repository: <https://github.com/Trouvaille-xx/Dsh-Simple-UI>

## Features

- Eight presets: `[CC]`, Apple silver, deep-space terminal, neon purple, Night City 2077, red-and-white, newspaper, sketch.
- Independent brand / accent / neutral / text-colour rows; the first cell of each row is a free colour picker, the rest are palette swatches.
- Separate Chinese and English font controls. All stacks are local-first with same-style fallbacks, so Chinese text never falls back to tofu.
- Uploadable background image with its own on/off switch. It applies only to the sidebar and conversation area; settings and dialogs stay isolated. Images above ~1.5 MB are downscaled automatically.
- One-click **Clear background** and **Restore defaults**.
- Settings persist in `localStorage` (`dsh-simple-ui.preset.v1` / `dsh-simple-ui.bg.v1`) and are restored on the next load.
- No CDN or web-font requests: nothing blocks first paint, and the UI renders correctly offline.
- Host selectors live in one `HOST_SELECTORS` table (build hash plus semantic fallbacks). When a DSH upgrade changes the hashed class names, skins degrade to the host's default look instead of breaking the layout.
- Applies colours through the real DSH theme API (`theme.overrideTokens`); it does not rewrite host DOM or replace the conversation renderer.

## Install

The plugin is a bundle for a DSH profile; after installing it lives at **Settings → 外观皮肤 (Appearance)**. Any one of the four options below uses DSH's built-in installer — do not edit the profile's `package.json` or `cordis.patch.yml` by hand.

**Option 1: ask the agent (fastest)**

```text
Install dsh-simple-ui with plugin_manager install_bundle, target =
git+https://github.com/Trouvaille-xx/dsh-Simple-UI.git#v1.1.0
```

**Option 2: plugin market**

In **Settings → Plugins → Discover**, add this index source:

```text
https://raw.githubusercontent.com/Trouvaille-xx/dsh-Simple-UI/main/market/index.json
```

Then search for "Simple UI" and install with one click. Where GitHub is blocked, prefix the same URL with `https://gh-proxy.com/`.

**Option 3: offline package**

Download `dsh-simple-ui-<version>.zip` from the [releases](https://github.com/Trouvaille-xx/dsh-Simple-UI/releases), unzip it, and pass the folder's absolute path to `plugin_manager` `install_bundle` (or use the `.tgz` with `pnpm add file:<path>`).

**Option 4: from a local checkout**

```text
plugin_manager install_bundle, target = <absolute path to this directory>
```

Restart DSH so the manifest metadata (icon, display name) is picked up, then open **Settings → 外观皮肤**.

Note: implementation files such as `lib/client.js` are hot-loaded by the host; changes to `package.json` (display name, icon, exports) only take effect after a process restart, because the host reads the manifest when the plugin entry starts.

## Data and privacy

- No API key is stored or rendered.
- Skins and background images stay in the local browser `localStorage`; they are never sent to a model or written into a session.
- The plugin never serializes live Host objects.

## Development

Plain JavaScript, dual-face package, no build step:

- `lib/index.js`: Host half (declaration only, empty `apply`)
- `lib/client.js`: browser Client half, `window.__ModuleLoader__.load({ id: "dsh-simple-ui", factory })`
- `cordis.patch.yml`: bundle patch that inserts the plugin row into the host composition
- `locale/zh.json`, `locale/en.json`, `icon.svg`: display name, description, and icon in the plugin list

Syntax check:

```powershell
node --check lib/client.js
```

Behavioural regression run (executes the real `lib/client.js` factory inside a Node sandbox with fake theme / slots / React / DOM):

```powershell
node D:\A-AgentWorkspace\09\dsh-simple-ui-tests\client.test.mjs
```

Covered: factory identity, settings-section registration, all eight presets applied one by one, colour layers not leaking, settings restored across reload, cleanup on unload, no web-font references, host-selector placeholders resolvable, and valid CSS structure.

## Known limitations

- Background images are bounded by the browser's `localStorage` quota; if the compressed image still cannot be stored, it applies to the current session only and the page says so.
- After a large host redesign, the semantic fallbacks (`aside` / `header` / `main`) are broader than the original hashes and may cause minor style bleed; decorations without a fallback simply fall back to the host's default look.

## License

MIT
