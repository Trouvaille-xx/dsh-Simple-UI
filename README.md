# DSH Simple UI

An appearance plugin for the DeepSeek Harness (dsh) web client: eight industrial-style skin presets, corner-radius styles, background media (still images, animated images, video), and independent brand / accent / neutral / text colours plus Chinese and English fonts. Everything is stored in the browser, survives reload and restart, and loads no web fonts, so it works fully offline.

Repository: <https://github.com/Trouvaille-xx/dsh-Simple-UI>

## Features

The settings page is split into four tabs: **Style / Background / Colors / Fonts**.

- **Style**: eight presets (`[CC]`, Apple silver, deep-space terminal, neon purple, Night City 2077, red-and-white, newspaper, sketch) and a corner-radius control (sharp / small / standard / large / extra-large, plus a 0–240% slider; 100% is the host's native scale, applied proportionally across `--dsw-radius-*` and the window content radius).
- **Background**: still images, animated images (GIF / APNG) and video (MP4 / WebM). Media is stored in IndexedDB, so it is not bound by the localStorage quota; there is a switch, a clear action and a restore-defaults action. Video is muted, looping and autoplaying by default and pauses when the tab is hidden.
- **Readability** (Background tab): a **scrim** slider (0–100%) controls the film laid over the picture, a **panel opacity** slider (0–100%) controls how much of the host surface colour covers the sidebar and conversation area (0% fully transparent, 100% hides the background), and **scrim tone** follows the theme or is forced light/dark. The veil is applied once per layout cell, so nesting cannot bury the image. Dialogs and the settings panel always stay fully opaque.
- **Colors**: independent brand / accent / neutral / text-colour rows; the first cell of each row is a free colour picker, the rest are palette swatches.
- **Fonts**: separate Chinese and English font controls. All stacks are local-first with same-style fallbacks, so Chinese text never falls back to tofu.
- Settings persist in `localStorage` (key `dsh-simple-ui.preset.v1`, including the last tab) and background media in IndexedDB (database `dsh-simple-ui`), and are restored on the next load. Backgrounds saved by older versions in localStorage are migrated automatically.
- No CDN or web-font requests: nothing blocks first paint, and the UI renders correctly offline.
- **Survives host rebuilds**: no build hashes are hardcoded. Selectors match CSS Module local-name suffixes (`[class*="_centerCol"]`, `[class*="_sidebarCol"]`, `[class*="_frame"]` …) with container-scoped token overrides, so a DSH rebuild does not break the skin. If a background still does not show, the **Check** button in the Background tab reports how many host containers matched, the host surface colour, and whether the media layer and html background are ready.
- Applies colours through the real DSH theme API (`theme.overrideTokens`); it does not rewrite host components or replace the conversation renderer.

## Install

The plugin is a bundle for a DSH profile; after installing it lives at **Settings → 外观皮肤 (Appearance)**. Any one of the four options below uses DSH's built-in installer — do not edit the profile's `package.json` or `cordis.patch.yml` by hand.

**Option 1: ask the agent (fastest)**

```text
Install dsh-simple-ui with plugin_manager install_bundle, target =
git+https://github.com/Trouvaille-xx/dsh-Simple-UI.git#v1.2.0
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

## Data and privacy

- No API key is stored or rendered.
- Skins and background media stay in the local browser (`localStorage` + IndexedDB); they are never sent to a model or written into a session.
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

Behavioural regression (executes the real `lib/client.js` factory inside a Node sandbox):

```powershell
node D:\A-AgentWorkspace\09\dsh-simple-ui-tests\client.test.mjs
node D:\A-AgentWorkspace\09\dsh-simple-ui-tests\bg-engine.check.mjs
```

The first suite covers factory identity, section registration, all eight presets, colour-layer leakage, persistence, cleanup and CSS validity. The second covers the background engine end to end: upload, reveal selectors, IndexedDB persistence, toggle, clear, video, corner radius, unload cleanup and restore.

## Choosing a background image (important)

The plugin can only tune the scrim and the panel veil; the wrong picture stays unreadable no matter what. **A good UI background is dark, soft and empty**; a bright, busy, high-detail photo (blossoms, bamboo, snow, bright sky) will swallow the text.

Ask for a 16:9 image of 2560x1440 or larger with low contrast, a dark palette (#0b0d12 – #1a1f2b), heavy depth of field, vignetting, and an empty area towards the centre-left where the sidebar and message text sit. No bright sky, snow, white walls or water highlights; no text or watermark.

Prompt that works:

```text
A 16:9 realistic wuxia-style wallpaper for a dark UI.
Low contrast, dark palette (deep blue-black to ink blue, #0b0d12 to #1a1f2b), brightness no higher than mid-grey.
Heavy depth of field, distant mountains, mist and bamboo only as soft silhouettes; avoid dense high-frequency texture.
No bright sky, snow, white walls or specular water highlights.
Subtle vignette; keep an emptier area towards the centre-left for overlaying text.
Unified tones, ink blue with muted gold accents, no close-up faces.
No text, watermark or logo; film grain. At least 2560x1440.
```

Tuning: a dark host theme plus a dark scrim is the most reliable. Typical values are panel 65–80% and scrim 35–55%. To show the picture more, lower the panel **and** raise the scrim to keep contrast — lowering the panel alone brings the readability problem back.

## Known limitations

- Background media uses IndexedDB and is bounded by the browser quota (normally far larger than localStorage). Where IndexedDB is unavailable (private mode), the background still applies but only for the current session, and the page says so.
- A video background keeps decoding and can raise GPU/CPU use on low-end machines; it pauses when the tab is hidden.
- Background reveal depends on the host CSS Module local names (`_centerCol` / `_sidebarCol` / `_frame` …). If DSH renames them, the **Check** button reports 0 matched containers and the plugin needs updating.
- Decorative preset selectors (newspaper, sketch) use the same suffix matching; a large host restructure may drop the decoration but will not break the layout.

## License

MIT
