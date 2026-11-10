# DSH Simple UI

An appearance plugin for the DeepSeek Harness (dsh) web client: six industrial-style skin presets, corner-radius styles, background media (still images, animated images, video), and independent brand / accent / neutral / text colours plus Chinese and English fonts. Everything is stored in the browser, survives reload and restart, and loads no web fonts, so it works fully offline.

Repository: <https://github.com/Trouvaille-xx/dsh-Simple-UI>

## Features

The settings page has six tabs: **Style / Header / Composer / Background / Colour / Font**.

- **Style**: 6 presets (`[CC]`, Apple Silver, Night City 2077, Red & White, Newspaper, Sketch) plus corner radius (0–240% slider).
- **Header**: 13 conversation-header styles in three groups — static (6): minimal, brand bar, dark bar, floating card, grid paper, left accent; dynamic (6): aurora, holographic, blueprint, neon cyber, liquid metal, starfield; custom (1): upload an image, cropped at 16:1 with an automatic scrim.
- **Composer**: 17 input-box styles in three groups — static (7): flat, outline, float, inset, terminal, paper, glass; dynamic (9): flowing border, breathing glow, aurora gradient, neon scan, snow, peach petals, maple leaves, rain, caret pulse; custom (1): upload an image, cropped at 6:1 with an automatic scrim.
- **Background**: static images, animated images (GIF / APNG) and video (MP4 / WebM), stored in IndexedDB.
- **Colour**: primary, neutral and text colours, each with a free picker plus presets.
- **Font**: separate Chinese and English font stacks, all local.
- **Dark mode**: every preset and style ships light and dark values and follows the DSH theme automatically.
- **Reduced motion**: all CSS animations sit inside `prefers-reduced-motion: no-preference`.
- Host-upgrade safe: targets host-owned semantic attributes (`header[data-window-drag]`, `[data-conversation-tabs]`, `[data-composer-card]`, `[aria-selected]`) and CSS-module name suffixes instead of build hashes.

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
