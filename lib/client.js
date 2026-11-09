window.__ModuleLoader__.load({
	id: "dsh-simple-ui",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		var React = require("react");

		// ---------------------------------------------------------------------------
		// 宿主选择器：只用「CSS Module 局部名后缀」做语义匹配，不写死构建哈希。
		// 依据（DSH 0.2.2-rc.1 构建产物）：
		//   layout:        <hash>_frame / _sidebarCol / _centerCol / _rightbarCol / _bottomRow / _mainPanel
		//                  ← 这些容器画的是 background: var(--dsw-alias-bg-base) / var(--dsw-specific-sidebar-fill)
		//   ui-chat:       <hash>_frame 等；ui-sidebar-browser: <hash>_frame / _root
		// 哈希（如 mP3x-q_）随每次构建变化，局部名（_centerCol 等）稳定得多，所以用 [class*="_xxx"] 匹配。
		// 背景要露出来，需要把这些容器及其内部「用 bg-base / sidebar-fill 铺底」的元素变透明。
		// 注意作用域：只在布局容器内把 token 置透明，弹窗/设置面板挂在 body 下，不受影响。
		// ---------------------------------------------------------------------------
		var SURFACES = ["_frame", "_sidebarCol", "_centerCol", "_rightbarCol", "_bottomRow", "_mainPanel"];
		var SURFACE_SEL = SURFACES.map(function (s) { return "[class*=\"" + s + "\"]"; }).join(",");
		// 四个网格单元：每个窗口恰好一个，纱罩只上在这一层，避免嵌套叠加。
		var COLS = ["_sidebarCol", "_centerCol", "_rightbarCol", "_bottomRow"];
		var COL_SEL = COLS.map(function (s) { return "[class*=\"" + s + "\"]"; }).join(",");

		// 圆角 token 的宿主默认值（DSH 0.2.2-rc.1 :root）；百分比配置按此等比缩放。
		var RADIUS_DEFAULTS = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, panel: 28, windows: 16 };
		var MAX_MEDIA_BYTES = 80 * 1024 * 1024;

		function insertCss(css) {
			var tag = document.createElement("style");
			if (typeof tag.setAttribute === "function") tag.setAttribute("data-plugin", "dsh-simple-ui");
			tag.textContent = css;
			(document.head || document.documentElement).appendChild(tag);
			return function () { if (tag.parentNode) tag.parentNode.removeChild(tag); };
		}

		// 离线字体栈：全部本地优先，不引用任何网络字体。
		var FONT_CN = "\"Microsoft YaHei\",\"PingFang SC\",\"Noto Sans SC\",\"Source Han Sans SC\",\"Hiragino Sans GB\",\"Heiti SC\",SimHei,SimSun";
		var FONT_EN = "\"Segoe UI\",\"Helvetica Neue\",Arial,Roboto,sans-serif";
		var FONT_MONO = "Consolas,\"Cascadia Mono\",\"Courier New\",monospace";

		var BASE_CSS = ".skc-page{display:flex;flex-direction:column;gap:12px;padding:16px 4px;color:var(--dsw-alias-label-primary)}" +
			".skc-title{font-size:16px;font-weight:700}" +
			".skc-tabs{display:flex;gap:2px;padding:3px;border-radius:10px;background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-layer-1));align-self:flex-start}" +
			".skc-tab{height:30px;padding:0 16px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:13px;font-weight:600;cursor:pointer;transition:background .12s ease,color .12s ease}" +
			".skc-tab:hover{color:var(--dsw-alias-label-primary)}" +
			".skc-tab.skc-on{background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.08)}" +
			".skc-panel{display:flex;flex-direction:column;gap:10px}" +
			".skc-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}" +
			".skc-square{position:relative;width:44px;height:44px;min-width:44px;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;cursor:pointer;overflow:hidden}" +
			".skc-square.skc-on,.skc-preset.skc-on,.skc-font.skc-on,.skc-radius.skc-on{outline:3px solid var(--dsw-alias-state-warn-primary);outline-offset:2px}" +
			".skc-mark{position:absolute;right:-5px;top:-8px;width:16px;height:16px;border-radius:8px;background:var(--dsw-alias-state-success-primary);color:#fff;text-align:center}" +
			".skc-preset{position:relative;width:118px;height:54px;border:1px solid rgba(255,255,255,.25);border-radius:8px;font-weight:600;cursor:pointer}" +
			".skc-radius{position:relative;min-width:74px;height:36px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;font-weight:600;cursor:pointer}" +
			".skc-section{font-size:12px;color:var(--dsw-alias-label-secondary);margin-top:6px}" +
			".skc-upload{display:flex;align-items:center;justify-content:center}" +
			".skc-upload input{display:none}" +
			".skc-bgtoggle{display:flex;align-items:center;gap:6px;height:36px;padding:0 2px;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer}.skc-bgtoggle input{accent-color:var(--dsw-alias-brand-primary);width:15px;height:15px;margin:0;cursor:pointer}" +
			".skc-font{position:relative;width:118px;height:42px;padding:0 6px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;cursor:pointer}" +
			".skc-custom{background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red)!important;display:flex;align-items:center;justify-content:center}" +
			".skc-custom .skc-plus{color:#fff;font-size:22px;font-weight:700;line-height:1;text-shadow:0 1px 2px rgba(0,0,0,.6);pointer-events:none}" +
			".skc-custom input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:0;padding:0}" +
			".skc-first-picker{position:relative;width:44px;height:44px;min-width:44px;display:flex;align-items:center;justify-content:center;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;cursor:pointer;overflow:hidden;box-shadow:inset 0 0 0 2px rgba(255,255,255,.22)}.skc-first-picker::after{content:'\u2197';position:absolute;right:2px;bottom:0;color:#fff;font-size:11px;font-weight:700;text-shadow:0 1px 2px #000;pointer-events:none}.skc-first-picker input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:0;padding:0}" +
			".skc-btn{height:32px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;cursor:pointer}" +
			".skc-btn:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2)}" +
			".skc-btn:disabled{opacity:.45;cursor:not-allowed}" +
			".skc-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px}" +
			".skc-hint{font-size:11px;line-height:1.6;color:var(--dsw-alias-label-secondary)}" +
			".skc-warn{font-size:11px;line-height:1.6;color:var(--dsw-alias-state-warn-primary)}" +
			".skc-range{width:200px;accent-color:var(--dsw-alias-brand-primary);cursor:pointer}" +
			".skc-bgname{font-size:12px;color:var(--dsw-alias-label-primary);max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
			".skc-square:focus-visible,.skc-preset:focus-visible,.skc-font:focus-visible,.skc-radius:focus-visible,.skc-tab:focus-visible,.skc-first-picker:focus-visible,.skc-bgtoggle input:focus-visible,.skc-btn:focus-visible,.skc-range:focus-visible,.skc-custom input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}" +
			// 视频背景层：固定铺满、不拦事件、在内容之下。
			"#dsh-simple-ui-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;background-color:transparent}" +
			"#dsh-simple-ui-bg>img,#dsh-simple-ui-bg>video{display:block;width:100%;height:100%;object-fit:cover;object-position:center}" +
			// ::after 的遮罩颜色在 applyBg 里按「遮罩强度 / 色调」动态注入
			"";

		var inject = ["theme", "slots"];

		function apply(ctx) {
			var theme = ctx.theme || ctx.get("theme");
			var slotsSvc = ctx.slots || ctx.get("slots");
			if (!theme || !slotsSvc) return;

			var STORE_PREFS = "dsh-simple-ui.preset.v1";
			var STORE_BG_OLD = "dsh-simple-ui.bg.v1";
			var IDB_NAME = "dsh-simple-ui";
			var IDB_STORE = "media";

			var state = {
				tab: "style",
				preset: null, main: null, accent: null, neutral: null, label: null,
				cn: null, en: null,
				radius: 100,
				bgOn: true,
				scrim: 40,          // 背景遮罩强度 0-100
				panel: 70,          // 面板纱罩不透明度 0-100（0=全透明，图最清楚但字最难认）
				scrimTone: "auto",  // auto | light | dark
				bgKind: null,      // "image" | "video"
				bgName: "",
				bgUrl: null,       // 本次会话的 object URL
				notice: "",
				diag: null
			};

			// ---------------- 存储 ----------------
			var ls = function () {
				try { if (typeof window !== "undefined" && window.localStorage) return window.localStorage; } catch (e) {}
				try { if (typeof localStorage !== "undefined" && localStorage) return localStorage; } catch (e) {}
				return null;
			};
			var storageGet = function (k) { var s = ls(); if (!s) return null; try { return s.getItem(k); } catch (e) { return null; } };
			var storageSet = function (k, v) { var s = ls(); if (!s) return false; try { s.setItem(k, v); return true; } catch (e) { return false; } };
			var storageDel = function (k) { var s = ls(); if (!s) return; try { s.removeItem(k); } catch (e) {} };

			// IndexedDB：背景媒体（图片/动图/视频）体积远超 localStorage 配额，放这里。
			var idbOpen = function () {
				return new Promise(function (resolve, reject) {
					try {
						var g = typeof indexedDB !== "undefined" ? indexedDB : (typeof window !== "undefined" ? window.indexedDB : undefined);
						if (!g) { reject(new Error("no-indexeddb")); return; }
						var req = g.open(IDB_NAME, 1);
						req.onupgradeneeded = function () {
							var db = req.result;
							if (db.objectStoreNames && !db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
						};
						req.onsuccess = function () { resolve(req.result); };
						req.onerror = function () { reject(req.error || new Error("idb-open-failed")); };
					} catch (e) { reject(e); }
				});
			};
			var idbPut = function (key, value) {
				return idbOpen().then(function (db) {
					return new Promise(function (resolve, reject) {
						try {
							var tx = db.transaction(IDB_STORE, "readwrite");
							tx.objectStore(IDB_STORE).put(value, key);
							tx.oncomplete = function () { try { db.close(); } catch (e) {} resolve(true); };
							tx.onerror = function () { try { db.close(); } catch (e) {} reject(tx.error || new Error("idb-put-failed")); };
							tx.onabort = function () { try { db.close(); } catch (e) {} reject(tx.error || new Error("idb-abort")); };
						} catch (e) { reject(e); }
					});
				});
			};
			var idbGet = function (key) {
				return idbOpen().then(function (db) {
					return new Promise(function (resolve, reject) {
						try {
							var tx = db.transaction(IDB_STORE, "readonly");
							var req = tx.objectStore(IDB_STORE).get(key);
							req.onsuccess = function () { try { db.close(); } catch (e) {} resolve(req.result || null); };
							req.onerror = function () { try { db.close(); } catch (e) {} reject(req.error || new Error("idb-get-failed")); };
						} catch (e) { reject(e); }
					});
				});
			};
			var idbDel = function (key) {
				return idbOpen().then(function (db) {
					return new Promise(function (resolve) {
						try {
							var tx = db.transaction(IDB_STORE, "readwrite");
							tx.objectStore(IDB_STORE).delete(key);
							tx.oncomplete = function () { try { db.close(); } catch (e) {} resolve(true); };
							tx.onerror = function () { try { db.close(); } catch (e) {} resolve(false); };
						} catch (e) { resolve(false); }
					});
				}).catch(function () { return false; });
			};

			// ---------------- 图层 ----------------
			var css = insertCss(BASE_CSS);
			var layer = { tokens: null, root: null, style: null, font: null, bg: null, radius: null };
			var quiet = false;
			var rerender = null;

			var drop = function (name) {
				if (layer[name]) { try { layer[name](); } catch (e) {} layer[name] = null; }
			};
			var clearStyleLayers = function () { drop("root"); drop("style"); };

			var tok = function (v) { return { light: v, dark: v }; };
			var tokens = {};
			var setTokens = function (k, v) { tokens[k] = v; };
			var applyTokens = function () {
				drop("tokens");
				var y = {};
				Object.keys(tokens).forEach(function (k) { y[k] = tok(tokens[k]); });
				if (Object.keys(y).length) layer.tokens = theme.overrideTokens("dsh-simple-ui", y);
			};

			var savePrefs = function () {
				if (quiet) return;
				var snap = {};
				Object.keys(tokens).forEach(function (k) { snap[k] = tokens[k]; });
				storageSet(STORE_PREFS, JSON.stringify({
					v: 3, tab: state.tab, preset: state.preset, main: state.main, accent: state.accent,
					neutral: state.neutral, label: state.label, cn: state.cn, en: state.en,
					radius: state.radius, bgOn: state.bgOn !== false,
					scrim: state.scrim, panel: state.panel, scrimTone: state.scrimTone,
					bgKind: state.bgKind, bgName: state.bgName, tokens: snap
				}));
			};
			var notify = function () { if (typeof rerender === "function") { try { rerender(); } catch (e) {} } };

			// ---------------- 预设 / 配色 ----------------
			var STYLE_GOV = "body::after{content:\"\";position:fixed;left:0;right:0;top:0;height:5px;background:linear-gradient(90deg,#A00810,#D93A3F);z-index:2147483000;pointer-events:none}[class*=\"_sidebarCol\"]{border-right:1px solid rgba(190,10,16,.16)!important}[class*=\"_mainPanel\"]{border-top:3px solid #BE0A10!important;border-radius:6px!important}h1,h2,h3,h4{font-family:\"Noto Serif SC\",\"SimSun\",serif!important;letter-spacing:.02em}button{transition:transform .12s ease,box-shadow .12s ease!important}button:active{transform:translateY(1px)!important}";
			var STYLE_NIGHTCITY = "html{background:#080808!important}[class*=\"_frame\"]{background:linear-gradient(135deg,#080808 0%,#17120b 52%,#120616 100%)!important}[class*=\"_sidebarCol\"]{background:linear-gradient(180deg,#080808,#181007)!important;border-right:3px solid #FCEE0A!important;position:relative}[class*=\"_sidebarCol\"]::before{content:\"NIGHT CITY // 2077\";display:block;margin:12px 10px 7px;padding:7px 8px;background:#FCEE0A;color:#080808;font-family:monospace;font-size:11px;font-weight:900;letter-spacing:.13em;clip-path:polygon(0 0,100% 0,94% 100%,0 100%)}[class*=\"_sidebarCol\"]::after{content:\"NET.STATUS : ONLINE\";display:block;margin:auto 10px 12px;padding-top:8px;border-top:1px solid rgba(252,238,10,.65);color:#FCEE0A;font-family:monospace;font-size:9px;letter-spacing:.18em}[class*=\"_sidebarCol\"] button,[class*=\"_sidebarCol\"] a{border-left:3px solid transparent!important;transition:transform .16s ease,background .16s ease,border-color .16s ease!important}[class*=\"_sidebarCol\"] button:hover,[class*=\"_sidebarCol\"] a:hover{background:#FCEE0A!important;color:#080808!important;border-left-color:#FF2A86!important;transform:translateX(5px) skewX(-4deg)}[class*=\"_mainPanel\"]{background:linear-gradient(110deg,#11110d,#1a100d 70%,#170817)!important;border:1px solid #FCEE0A!important;border-left:5px solid #FCEE0A!important;box-shadow:7px 7px 0 #FF2A86,0 0 24px rgba(252,238,10,.18)!important}";
			var STYLE_NEWS = "*,*::before,*::after{border-radius:0!important}[class*=\"_mainPanel\"]{border:1px solid #1A1A1A!important;box-shadow:5px 5px 0 rgba(26,26,26,.85)!important}[class*=\"_sidebarCol\"]{border-right:1px solid #1A1A1A!important;background:#F5F0E3!important}[class*=\"_sidebarCol\"] button,[class*=\"_sidebarCol\"] a{font-family:\"Noto Serif SC\",\"SimSun\",serif!important}h1,h2,h3,h4{font-family:\"Noto Serif SC\",\"SimSun\",serif!important;letter-spacing:.02em}p{text-align:justify}";
			var STYLE_SKETCH = "html{background:#EEE9DF!important}body{background-image:repeating-linear-gradient(24deg,rgba(55,52,46,.035) 0 1px,transparent 1px 8px),repeating-linear-gradient(-29deg,rgba(55,52,46,.025) 0 1px,transparent 1px 11px)!important}[class*=\"_frame\"]{background:rgba(247,244,237,.9)!important}[class*=\"_sidebarCol\"]{background:repeating-linear-gradient(-35deg,rgba(45,43,39,.045) 0 1px,transparent 1px 8px),#E8E2D7!important;border-right:2px solid #3D3933!important;box-shadow:3px 0 0 rgba(61,57,51,.18),7px 0 0 rgba(61,57,51,.06)!important;position:relative}[class*=\"_sidebarCol\"]::before{content:\"SKETCHBOOK\";display:block;margin:13px 12px 8px;padding:5px 2px;border-bottom:2px solid #3D3933;color:#3D3933;font-family:\"LXGW WenKai\",KaiTi,serif;font-size:16px;font-weight:700;letter-spacing:.08em;transform:rotate(-1.2deg)}[class*=\"_sidebarCol\"] button,[class*=\"_sidebarCol\"] a{font-family:\"LXGW WenKai\",KaiTi,\"Noto Serif SC\",serif!important;transition:transform .14s ease,background .14s ease!important}[class*=\"_mainPanel\"]{background:rgba(252,250,245,.96)!important;border:1px solid #3D3933!important;border-radius:2px!important;box-shadow:2px 2px 0 rgba(61,57,51,.75)!important}";

			var presets = [
				["claude", "[CC]", "#FAF9F5", "#FFFFFF", "#3D3929", "#C96442", "\"Noto Sans SC\",\"Source Han Sans SC\",\"Microsoft YaHei\"", "Inter,\"Segoe UI\""],
				["apple", "Apple 银灰", "#F5F5F7", "#FFFFFF", "#1D1D1F", "#007AFF", "\"PingFang SC\",\"Microsoft YaHei\"", "\"SF Pro Display\",\"Segoe UI\""],
				["deep", "深空蓝终端", "#0B1E33", "#122840", "#E8EFF7", "#4D6BFE", "system-ui", "\"JetBrains Mono\",Consolas,\"Cascadia Mono\""],
				["neon", "霓虹黑紫", "#120B24", "#231443", "#F4EAFE", "#EC4899", "system-ui", "Silkscreen,\"MS Gothic\",Consolas"],
				["nightcity", "夜之城 2077", "#080808", "#15110B", "#F5F1D8", "#FCEE0A", "\"Noto Sans SC\",\"Source Han Sans SC\",\"Microsoft YaHei\"", "\"JetBrains Mono\",Consolas,\"Cascadia Mono\"", STYLE_NIGHTCITY],
				["gov", "红白页", "#F5F6F8", "#FFFFFF", "#262626", "#BE0A10", "\"Noto Serif SC\",\"Source Han Serif SC\",\"Songti SC\",SimSun", "\"Source Sans 3\",\"Segoe UI\"", STYLE_GOV],
				["news", "报纸版面", "#F7F3E9", "#FDFBF3", "#1A1A1A", "#1A1A1A", "\"Noto Serif SC\",\"Source Han Serif SC\",\"Songti SC\",SimSun", "Georgia,\"Times New Roman\",serif", STYLE_NEWS],
				["sketch", "素描线稿", "#EEE9DF", "#F7F4ED", "#3D3933", "#3D3933", "\"LXGW WenKai\",KaiTi,\"Kaiti SC\",STKaiti", "\"IBM Plex Mono\",Consolas,\"Cascadia Mono\"", STYLE_SKETCH],
			];
			var main = ["#4D6BFE", "#2F5AF3", "#14B8A6", "#10B981", "#F97316", "#F43F5E", "#8B5CF6", "#EC4899", "#F59E0B", "#6366F1"];
			var accent = ["#38BDF8", "#34D399", "#2DD4BF", "#F9A8D4", "#A78BFA", "#FDBA74", "#FDE047", "#FB7185", "#22D3EE", "#94A3B8"];
			var neutral = ["#FFFFFF", "#F8F9FA", "#F1F3F5", "#E9ECEF", "#DEE2E6", "#E7F0F8", "#E8F3EE", "#F3EDF8", "#FBEDEF", "#F4F1EA"];
			var label = ["#1D1D1F", "#333333", "#3D3929", "#4A3B2A", "#2B3442", "#5A6B7E", "#E8EFF7", "#F4EAFE", "#FFFFFF", "#94A3B8"];
			var fontsCn = [
				["系统默认", "system-ui"], ["微软雅黑", "\"Microsoft YaHei\""], ["苹方", "\"PingFang SC\""],
				["思源黑体", "\"Noto Sans SC\",\"Source Han Sans SC\""], ["思源宋体", "\"Noto Serif SC\",\"Source Han Serif SC\",\"Songti SC\",SimSun"],
				["霞鹜文楷", "\"LXGW WenKai\",KaiTi,\"Kaiti SC\",STKaiti"], ["鸿蒙黑体", "\"HarmonyOS Sans SC\",\"Noto Sans SC\""],
				["星露谷像素", "\"Fusion Pixel SC\",\"Zpix\",\"MS Gothic\",SimSun"]
			];
			var fontsEn = [
				["Inter", "Inter"], ["SF Pro", "\"SF Pro Display\""], ["Segoe UI", "\"Segoe UI\""],
				["Noto Sans", "\"Noto Sans\""], ["Source Sans", "\"Source Sans 3\",\"Source Sans Pro\""], ["IBM Plex", "\"IBM Plex Sans\""],
				["JetBrains Mono", "\"JetBrains Mono\""], ["星露谷像素", "Silkscreen,\"MS Gothic\""]
			];
			var radiusPresets = [
				[0, "直角"], [50, "小圆"], [100, "标准"], [150, "大圆"], [220, "超大"]
			];

			var presetById = function (id) {
				for (var i = 0; i < presets.length; i++) if (presets[i][0] === id) return presets[i];
				return null;
			};

			var rootCssFor = function (v) {
				return ":root{--dsw-alias-brand-primary:" + v + "!important;--dsw-alias-brand-text:" + v + "!important;--dsw-alias-button-primary-fill:" + v + "!important;--dsw-alias-button-primary-hover:" + v + "!important;--dsw-alias-button-info-fill:" + v + "!important;--dsw-alias-button-info-hover:" + v + "!important;--dsw-alias-state-business-primary:" + v + "!important;--dsw-specific-sidebar-nav-item-active-accent:" + v + "!important}";
			};

			var applyColor = function (v) {
				state.preset = null; state.main = v;
				["--dsw-alias-brand-primary", "--dsw-alias-brand-text", "--dsw-alias-button-primary-fill", "--dsw-alias-button-primary-hover", "--dsw-alias-button-info-fill", "--dsw-alias-button-info-hover", "--dsw-alias-state-business-primary", "--dsw-specific-sidebar-nav-item-active-accent"].forEach(function (k) { setTokens(k, v); });
				clearStyleLayers();
				applyTokens();
				layer.root = insertCss(rootCssFor(v));
				savePrefs();
			};

			var applyAccent = function (v) {
				state.preset = null; state.accent = v;
				setTokens("--dsw-specific-sidebar-nav-item-active", v);
				clearStyleLayers(); applyTokens(); savePrefs();
			};
			var applyNeutral = function (v) {
				state.preset = null; state.neutral = v;
				setTokens("--dsw-alias-bg-base", v);
				setTokens("--dsw-alias-bg-layer-1", v);
				setTokens("--dsw-alias-bg-layer-2", v);
				setTokens("--dsw-specific-sidebar-fill", v);
				clearStyleLayers(); applyTokens(); savePrefs();
			};
			var applyLabel = function (v) {
				state.preset = null; state.label = v;
				setTokens("--dsw-alias-label-primary", v);
				setTokens("--dsw-alias-label-secondary", v);
				setTokens("--dsw-alias-label-tertiary", v);
				clearStyleLayers(); applyTokens(); savePrefs();
			};

			var applyFont = function (cn, en) {
				state.cn = cn || null; state.en = en || null;
				drop("font");
				if (cn || en) {
					var cnPref = cn ? cn + "," : "";
					var enPref = en ? en + "," : "";
					var families = cnPref + enPref + FONT_CN + "," + FONT_EN;
					var code = enPref + FONT_MONO;
					layer.font = insertCss(
						":root{--dsw-font-family:" + families + "!important;--ds-font-family-code:" + code + "!important}" +
						"body{font-family:" + families + "!important}" +
						"body *:not(code):not(pre):not(kbd):not(samp):not(svg):not(math):not([class*=icon]):not([class*=Icon]):not([class*=codicon]):not([class*=monaco]){font-family:" + families + "!important}" +
						"code,pre,kbd,samp,math{font-family:" + code + "!important}"
					);
				}
				savePrefs();
			};

			var applyPreset = function (x) {
				state.preset = x[0]; state.main = null; state.accent = null; state.neutral = null; state.label = null;
				Object.keys(tokens).forEach(function (k) { delete tokens[k]; });
				setTokens("--dsw-alias-bg-base", x[2]);
				setTokens("--dsw-alias-bg-layer-1", x[3]);
				setTokens("--dsw-alias-bg-layer-2", x[2]);
				setTokens("--dsw-alias-label-primary", x[4]);
				setTokens("--dsw-alias-label-secondary", x[4]);
				setTokens("--dsw-alias-brand-primary", x[5]);
				setTokens("--dsw-specific-sidebar-fill", x[3]);
				setTokens("--dsw-alias-button-primary-fill", x[5]);
				setTokens("--dsw-alias-button-info-fill", x[5]);
				setTokens("--dsw-alias-button-info-hover", x[5]);
				setTokens("--dsw-alias-state-business-primary", x[5]);
				clearStyleLayers();
				applyTokens();
				applyFont(x[6], x[7]);
				if (x[8]) layer.style = insertCss(x[8]);
				savePrefs();
			};

			// ---------------- 圆角 ----------------
			var applyRadius = function (pct) {
				drop("radius");
				var p = Number(pct);
				if (!isFinite(p) || p < 0) p = 100;
				p = Math.min(240, Math.round(p));
				state.radius = p;
				if (p !== 100) {
					var s = p / 100;
					var decl = "";
					Object.keys(RADIUS_DEFAULTS).forEach(function (k) {
						if (k === "windows") return;
						decl += "--dsw-radius-" + k + ":" + Math.round(RADIUS_DEFAULTS[k] * s) + "px!important;";
					});
					decl += "--dsh-windows-content-radius:" + Math.round(RADIUS_DEFAULTS.windows * s) + "px!important;";
					layer.radius = insertCss(":root,body{" + decl + "}");
				}
				savePrefs();
			};

			// ---------------- 背景 ----------------
			var mediaEl = null;
			var revokeUrl = function () {
				if (state.bgUrl && typeof URL !== "undefined" && URL.revokeObjectURL) {
					try { URL.revokeObjectURL(state.bgUrl); } catch (e) {}
				}
				state.bgUrl = null;
			};
			var removeMediaLayer = function () {
				if (mediaEl && mediaEl.parentNode) { try { mediaEl.parentNode.removeChild(mediaEl); } catch (e) {} }
				if (mediaEl) {
					var v = mediaEl.querySelector ? mediaEl.querySelector("video") : null;
					if (v && typeof v.pause === "function") { try { v.pause(); } catch (e) {} }
				}
				mediaEl = null;
			};

			// 背景能看见的前提：宿主自己不透明。只把「布局容器」及其内部用背景 token 铺底的元素变透明，
			// 弹窗与设置面板挂在 body 下、不在这些容器里，保持原有不透明底，文字依旧可读。
			// 先把宿主当前的实心底色抓下来，供弹窗恢复使用（否则弹窗会跟着透明）。
			var solidBg = function () {
				try {
					var el = document.documentElement;
					var v = el && window.getComputedStyle ? window.getComputedStyle(el).getPropertyValue("--dsw-alias-bg-base") : "";
					v = String(v || "").trim();
					if (!v || v === "transparent") {
						v = el && window.getComputedStyle ? String(window.getComputedStyle(document.body).backgroundColor || "").trim() : "";
					}
					if (v && v !== "transparent" && v !== "rgba(0, 0, 0, 0)") return v;
				} catch (e) {}
				return "#111111";
			};

			// 面板「纱罩」：完全不透明会挡住图，全透明文字又会压在图上。
			// 用宿主底色 + 可调不透明度，既能透出背景，又保证文字有稳定底衬。
			var hexToRgb = function (h) {
				var m = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(String(h || "").trim());
				if (!m) return null;
				var s = m[1];
				if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
				return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
			};
			var clampPct = function (v, d) {
				var n = Number(v);
				if (!isFinite(n)) n = d;
				return Math.max(0, Math.min(100, Math.round(n)));
			};
			var veilColor = function (solid, pct) {
				var p = clampPct(pct, 70);
				if (p <= 0) return "transparent";
				if (p >= 100) return solid;
				var rgb = hexToRgb(solid);
				var a = (p / 100).toFixed(3);
				if (rgb) return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
				return "color-mix(in srgb, " + solid + " " + p + "%, transparent)";
			};
			var hostIsDark = function () {
				try {
					if (document.querySelector && document.querySelector("[data-ds-dark-theme]")) return true;
					var bg = window.getComputedStyle ? String(window.getComputedStyle(document.body).backgroundColor || "") : "";
					var rgb = /rgba?\(([^)]+)\)/.exec(bg);
					if (rgb) {
						var p = rgb[1].split(",").map(function (x) { return Number(x.trim()); });
						if (p.length >= 3 && isFinite(p[0])) return (p[0] * 0.299 + p[1] * 0.587 + p[2] * 0.114) < 128;
					}
				} catch (e) {}
				return false;
			};
			var scrimColor = function () {
				var tone = state.scrimTone === "auto" ? (hostIsDark() ? "dark" : "light") : state.scrimTone;
				var a = clampPct(state.scrim, 40) / 100;
				return tone === "dark" ? "rgba(6,8,12," + a.toFixed(3) + ")" : "rgba(255,255,255," + a.toFixed(3) + ")";
			};

			var revealCss = function () {
				var solid = solidBg();
				var panelVeil = veilColor(solid, state.panel);
				// 只给「四个网格单元」上纱罩，其余容器（含嵌套的 _frame/_mainPanel）一律透传：
				// 每个单元恰好一层纱罩，不会因为嵌套叠加把图片彻底盖住。
				return "html,body{background-color:transparent!important}" +
					SURFACE_SEL + "{background-image:none!important;" +
					"--dsw-alias-bg-base:transparent!important;--dsw-specific-sidebar-fill:transparent!important}" +
					COL_SEL + "{background:" + panelVeil + "!important}" +
					":root{--dsh-simple-ui-solid:" + solid + "}" +
					// 弹窗保持完全实心，避免在图片上读不清。
					"html body [role=dialog],html body [role=dialog] *{--dsw-alias-bg-base:var(--dsh-simple-ui-solid)!important}";
			};

			var mountMediaLayer = function (kind, url) {
				if (typeof document === "undefined" || !document.body) return false;
				var el = document.createElement("div");
				el.id = "dsh-simple-ui-bg";
				var media;
				if (kind === "video") {
					media = document.createElement("video");
					media.muted = true;
					media.loop = true;
					media.autoplay = true;
					media.playsInline = true;
					media.setAttribute("muted", "");
					media.setAttribute("loop", "");
					media.setAttribute("playsinline", "");
					media.setAttribute("webkit-playsinline", "");
					media.src = url;
					try { var pr = media.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {}
				} else {
					media = document.createElement("img");
					media.alt = "";
					media.src = url;
				}
				el.appendChild(media);
				var first = document.body.firstChild || null;
				try { document.body.insertBefore(el, first); } catch (e) { document.body.appendChild(el); }
				mediaEl = el;
				return true;
			};

			var applyBg = function (save) {
				drop("bg");
				removeMediaLayer();
				var active = state.bgOn !== false && !!state.bgUrl;
				if (!active) {
					if (save) savePrefs();
					notify();
					return;
				}
				// 两条独立的铺底路径：
				//   1) 固定层 #dsh-simple-ui-bg（图片/动图放 <img>，视频放 <video>），z-index:-1 在内容之下；
				//   2) 图片额外写到 html 背景，万一固定层被宿主的新 stacking context 挡住仍能显示。
				// 遮罩（scrim）画在固定层上：浅色主题盖白、深色主题盖黑，强度可调，
				// 让图片"退到后面"，文字才不会淹没在画面里。
				var scrim = scrimColor();
				var extra = "";
				if (state.bgKind !== "video") {
					extra = "html{background-image:url(\"" + state.bgUrl + "\")!important;background-position:center!important;background-size:cover!important;background-attachment:fixed!important;background-repeat:no-repeat!important}";
				}
				layer.bg = insertCss(
					revealCss() + extra +
					"#dsh-simple-ui-bg::after{content:\"\";position:absolute;inset:0;pointer-events:none;background:" + scrim + "!important}" +
					"html body [role=dialog][aria-modal=true],html body dialog[open]{background:var(--dsw-alias-bg-layer-1,#111)!important}"
				);
				mountMediaLayer(state.bgKind === "video" ? "video" : "image", state.bgUrl);
				if (save) savePrefs();
				notify();
			};

			// 媒体来源统一入口：file → IndexedDB → object URL
			var setMedia = function (rec) {
				revokeUrl();
				state.bgKind = rec ? rec.kind : null;
				state.bgName = rec ? (rec.name || "") : "";
				if (rec && rec.blob) {
					try { state.bgUrl = URL.createObjectURL(rec.blob); }
					catch (e) { state.bgUrl = null; }
				}
				if (rec && !state.bgUrl && rec.dataUrl) state.bgUrl = rec.dataUrl;
				if (!rec) state.notice = "";
				applyBg(true);
			};

			var onPickFile = function (file) {
				if (!file) return;
				if (file.size > MAX_MEDIA_BYTES) {
					state.notice = "文件超过 80MB，换一张小一点的。";
					notify();
					return;
				}
				var kind = /^video\//.test(file.type || "") ? "video" : "image";
				var rec = { blob: file, name: file.name || "", kind: kind, type: file.type || "" };
				// 先本地生效（不依赖存储），再尝试持久化
				state.notice = "";
				setMedia(rec);
				idbPut("bg", rec).catch(function () {
					state.notice = "已生效，但浏览器没能保存（IndexedDB 不可用），刷新后会丢失。";
					notify();
				});
			};

			var clearBackground = function () {
				revokeUrl();
				state.bgKind = null; state.bgName = ""; state.bgOn = true; state.notice = "";
				removeMediaLayer();
				drop("bg");
				idbDel("bg");
				savePrefs();
				notify();
			};

			// 自检：背景不显示时，一眼看出是「宿主容器没被语义选择器命中」还是「媒体没加载」。
			var runDiagnostics = function () {
				var out = { matched: 0, sample: [], solid: "", layer: false, htmlBg: false, kind: state.bgKind || "-" };
				try {
					out.solid = solidBg();
					out.layer = !!mediaEl;
					if (document.querySelectorAll) {
						var hits = document.querySelectorAll(SURFACE_SEL);
						out.matched = hits ? hits.length : 0;
						for (var i = 0; i < hits.length && i < 5; i++) {
							var cls = hits[i].className ? String(hits[i].className).split(/\s+/) : [];
							for (var j = 0; j < cls.length; j++) { if (/_(frame|sidebarCol|centerCol|rightbarCol|bottomRow|mainPanel)$/.test(cls[j])) { out.sample.push(cls[j]); break; } }
						}
					}
					var hb = document.documentElement && window.getComputedStyle ? window.getComputedStyle(document.documentElement).backgroundImage : "";
					out.htmlBg = !!hb && hb !== "none";
				} catch (e) { out.error = String(e && e.message); }
				state.diag = out;
				notify();
			};

			var resetAll = function () {				quiet = true;
				try {
					storageDel(STORE_PREFS);
					revokeUrl();
					state.tab = "style";
					state.preset = null; state.main = null; state.accent = null; state.neutral = null; state.label = null;
					state.cn = null; state.en = null; state.radius = 100;
					state.scrim = 40; state.panel = 70; state.scrimTone = "auto";
					state.bgOn = true; state.bgKind = null; state.bgName = ""; state.notice = "";
					Object.keys(tokens).forEach(function (k) { delete tokens[k]; });
					drop("tokens"); clearStyleLayers(); drop("font"); drop("bg"); drop("radius");
					removeMediaLayer();
					idbDel("bg");
				} finally { quiet = false; }
				notify();
			};

			var restore = function () {
				quiet = true;
				try {
					var raw = storageGet(STORE_PREFS);
					var data = null;
					if (raw) { try { data = JSON.parse(raw); } catch (e) { data = null; } }
					if (data && typeof data === "object") {
						if (typeof data.tab === "string") state.tab = data.tab;
						state.preset = typeof data.preset === "string" ? data.preset : null;
						state.main = typeof data.main === "string" ? data.main : null;
						state.accent = typeof data.accent === "string" ? data.accent : null;
						state.neutral = typeof data.neutral === "string" ? data.neutral : null;
						state.label = typeof data.label === "string" ? data.label : null;
						state.cn = typeof data.cn === "string" ? data.cn : null;
						state.en = typeof data.en === "string" ? data.en : null;
						state.radius = typeof data.radius === "number" ? data.radius : 100;
						state.scrim = typeof data.scrim === "number" ? data.scrim : 40;
						state.panel = typeof data.panel === "number" ? data.panel : 70;
						state.scrimTone = typeof data.scrimTone === "string" ? data.scrimTone : "auto";
						state.bgOn = data.bgOn !== false;
						state.bgKind = data.bgKind || null;
						state.bgName = data.bgName || "";
						Object.keys(tokens).forEach(function (k) { delete tokens[k]; });
						if (data.tokens && typeof data.tokens === "object") {
							Object.keys(data.tokens).forEach(function (k) { if (typeof data.tokens[k] === "string") tokens[k] = data.tokens[k]; });
						}
					}
					clearStyleLayers();
					applyTokens();
					var p = presetById(state.preset);
					if (p && p[8]) layer.style = insertCss(p[8]);
					if (state.main) layer.root = insertCss(rootCssFor(state.main));
					if (state.cn || state.en) applyFont(state.cn, state.en);
					applyRadius(state.radius);
					// 媒体是异步的（IndexedDB），先按旧版 localStorage dataURL 迁移一次，再读 IndexedDB。
					var legacy = storageGet(STORE_BG_OLD);
					if (legacy) {
						state.bgUrl = legacy;
						state.bgKind = state.bgKind || "image";
						applyBg(false);
						storageDel(STORE_BG_OLD);
						try {
							var comma = legacy.indexOf(",");
							var meta = legacy.slice(0, comma);
							var b64 = legacy.slice(comma + 1);
							var mime = (meta.match(/data:([^;]+)/) || [])[1] || "image/png";
							var bin = typeof atob === "function" ? atob(b64) : "";
							if (bin) {
								var arr = new Uint8Array(bin.length);
								for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
								idbPut("bg", { blob: new Blob([arr], { type: mime }), name: "migrated", kind: "image", type: mime }).catch(function () {});
							}
						} catch (e) {}
					} else {
						idbGet("bg").then(function (rec) {
							if (!rec || !rec.blob) return;
							revokeUrl();
							state.bgKind = rec.kind || "image";
							state.bgName = rec.name || "";
							try { state.bgUrl = URL.createObjectURL(rec.blob); } catch (e) { state.bgUrl = null; }
							applyBg(false);
						}).catch(function () {});
					}
				} finally { quiet = false; }
			};

			// ---------------- 组件 ----------------
			var mark = function () { return React.createElement("span", { className: "skc-mark" }, "✓"); };
			var sq = function (v, t, on, fn) {
				return React.createElement("button", {
					key: t, type: "button", className: "skc-square" + (on ? " skc-on" : ""), title: t,
					"aria-label": t, "aria-pressed": !!on, style: { background: v },
					onClick: function () { fn(v); }
				}, on ? mark() : null);
			};
			var ft = function (v, t, on, fn) {
				return React.createElement("button", {
					key: t, type: "button", className: "skc-font" + (on ? " skc-on" : ""), title: t,
					"aria-label": t, "aria-pressed": !!on, style: { fontFamily: v },
					onClick: function () { fn(v); }
				}, t, on ? mark() : null);
			};
			var row = function (x) { return React.createElement("div", { className: "skc-row" }, x); };

			function Page() {
				var rev = React.useState(0);
				var refresh = function () { rev[1](function (x) { return x + 1; }); };
				React.useEffect(function () { rerender = refresh; return function () { if (rerender === refresh) rerender = null; }; });

				var tab = state.tab;
				var setTab = function (t) { state.tab = t; savePrefs(); refresh(); };

				var firstPicker = function (value, title, fn) {
					return React.createElement("label", { key: title, className: "skc-first-picker", title: title, style: { background: value || "linear-gradient(135deg,#ffd900,#ff7a00,#3ee6e0,#8b5cf6)" } },
						React.createElement("input", { type: "color", "aria-label": title, value: value || "#ffffff", onChange: function (e) { fn(e.target.value); } }));
				};

				var tabs = React.createElement("div", { className: "skc-tabs", role: "tablist", key: "tabs" },
					[["style", "样式"], ["bg", "背景"], ["color", "配色"], ["font", "字体"]].map(function (p) {
						return React.createElement("button", {
							key: p[0], type: "button", role: "tab", className: "skc-tab" + (tab === p[0] ? " skc-on" : ""),
							"data-tab": p[0], "aria-selected": tab === p[0] ? "true" : "false", onClick: function () { setTab(p[0]); }
						}, p[1]);
					}));

				var stylePanel = React.createElement("div", { className: "skc-panel", "data-panel": "style", role: "tabpanel", key: "style" }, [
					React.createElement("div", { className: "skc-section", key: "p" }, "预设风格"),
					row(presets.map(function (x) {
						return React.createElement("button", {
							key: x[0], type: "button", className: "skc-preset" + (state.preset === x[0] ? " skc-on" : ""), title: x[1],
							"aria-label": x[1], "aria-pressed": state.preset === x[0],
							style: { background: "linear-gradient(135deg," + x[2] + "," + x[3] + ")", color: x[4] },
							onClick: function () { applyPreset(x); refresh(); }
						}, x[1], state.preset === x[0] ? mark() : null);
					})),
					React.createElement("div", { className: "skc-section", key: "r" }, "圆角风格"),
					row([].concat(radiusPresets.map(function (p) {
						return React.createElement("button", {
							key: "r" + p[0], type: "button", className: "skc-radius" + (state.radius === p[0] ? " skc-on" : ""),
							"data-radius": String(p[0]), "aria-pressed": state.radius === p[0], title: p[1],
							style: { borderRadius: Math.round(8 * Math.max(p[0], 0) / 100 + 2) + "px" },
							onClick: function () { applyRadius(p[0]); refresh(); }
						}, p[1]);
					}), React.createElement("span", { key: "rv", className: "skc-hint" }, state.radius + "%"))),
					row([
						React.createElement("input", {
							key: "range", type: "range", className: "skc-range", min: "0", max: "240", step: "10",
							"aria-label": "圆角强度", value: state.radius,
							onChange: function (e) { applyRadius(Number(e.target.value)); refresh(); }
						})
					])
				]);

				var bgPanel = React.createElement("div", { className: "skc-panel", "data-panel": "bg", role: "tabpanel", key: "bg" }, [
					React.createElement("div", { className: "skc-section", key: "s" }, "背景媒体"),
					row([
						React.createElement("label", { key: "switch", className: "skc-bgtoggle", title: "关闭后恢复宿主默认背景" },
							React.createElement("input", { type: "checkbox", checked: state.bgOn !== false, "aria-label": "背景开关", onChange: function (e) { state.bgOn = e.target.checked; applyBg(true); refresh(); } }),
							React.createElement("span", null, "启用背景")),
						React.createElement("label", { key: "pick", className: "skc-btn skc-upload", title: "选择图片 / 动图 / 视频" },
							"选择文件",
							React.createElement("input", {
								type: "file", className: "skc-bgfile", accept: "image/*,video/mp4,video/webm,video/*", "aria-label": "选择背景文件",
								onChange: function (e) { var f = e.target.files && e.target.files[0]; if (e.target) e.target.value = ""; onPickFile(f); refresh(); }
							})),
						React.createElement("button", { key: "clear", type: "button", className: "skc-btn", onClick: function () { clearBackground(); refresh(); }, disabled: !state.bgUrl }, "清除背景"),
						React.createElement("button", { key: "diag", type: "button", className: "skc-btn", onClick: function () { runDiagnostics(); refresh(); } }, "检测"),
						React.createElement("button", { key: "reset", type: "button", className: "skc-btn", onClick: function () { resetAll(); refresh(); } }, "恢复默认")
					]),
					state.bgName ? React.createElement("div", { className: "skc-bgname", key: "name" }, "当前：" + state.bgName + (state.bgKind === "video" ? "（视频）" : "（图片）")) : null,
					state.notice ? React.createElement("div", { className: "skc-warn", key: "notice" }, state.notice) : null,
					state.diag ? React.createElement("div", { className: "skc-hint", key: "diag" },
						"检测：命中 " + state.diag.matched + " 个宿主容器" +
						(state.diag.sample.length ? "（" + state.diag.sample.join(", ") + "）" : "（一个都没命中，说明宿主的类名结构变了）") +
						"；宿主底色 " + state.diag.solid +
						"；背景层 " + (state.diag.layer ? "已创建" : "未创建") +
						"；html 背景图 " + (state.diag.htmlBg ? "有" : "无") +
						(state.diag.error ? "；错误 " + state.diag.error : "")
					) : null,
					// 可读性三件套：遮罩强度、面板纱罩、遮罩色调
					React.createElement("div", { className: "skc-section", key: "read" }, "可读性"),
					row([
						React.createElement("span", { key: "l1", className: "skc-hint" }, "遮罩 " + state.scrim + "%"),
						React.createElement("input", {
							key: "s1", type: "range", className: "skc-range", min: "0", max: "100", step: "5",
							"aria-label": "背景遮罩强度", value: state.scrim,
							onChange: function (e) { state.scrim = clampPct(e.target.value, 40); applyBg(true); refresh(); }
						}),
						React.createElement("span", { key: "l2", className: "skc-hint" }, "面板 " + state.panel + "%"),
						React.createElement("input", {
							key: "s2", type: "range", className: "skc-range", min: "0", max: "100", step: "5",
							"aria-label": "面板不透明度", value: state.panel,
							onChange: function (e) { state.panel = clampPct(e.target.value, 70); applyBg(true); refresh(); }
						}),
						["auto", "light", "dark"].map(function (tone) {
							return React.createElement("button", {
								key: "tone" + tone, type: "button", className: "skc-btn skc-tone" + (state.scrimTone === tone ? " skc-on" : ""),
								"data-tone": tone, "aria-pressed": state.scrimTone === tone,
								onClick: function () { state.scrimTone = tone; applyBg(true); refresh(); }
							}, tone === "auto" ? "遮罩跟随主题" : (tone === "light" ? "浅色遮罩" : "深色遮罩"));
						})
					])
				]);

				var colorPanel = React.createElement("div", { className: "skc-panel", "data-panel": "color", role: "tabpanel", key: "color" }, [
					React.createElement("div", { className: "skc-section", key: "m" }, "主色"),
					row([firstPicker(state.main, "自由选择主色", function (v) { applyColor(v); refresh(); })].concat(main.slice(1).map(function (v, i) { return sq(v, "主色" + (i + 1), state.main === v, function (x) { applyColor(x); refresh(); }); }))),
					React.createElement("div", { className: "skc-section", key: "a" }, "辅助色"),
					row([firstPicker(state.accent, "自由选择辅助色", function (v) { applyAccent(v); refresh(); })].concat(accent.slice(1).map(function (v, i) { return sq(v, "辅助色" + (i + 1), state.accent === v, function (x) { applyAccent(x); refresh(); }); }))),
					React.createElement("div", { className: "skc-section", key: "n" }, "中性色"),
					row([firstPicker(state.neutral, "自由选择中性色", function (v) { applyNeutral(v); refresh(); })].concat(neutral.slice(1).map(function (v, i) { return sq(v, "中性色" + (i + 1), state.neutral === v, function (x) { applyNeutral(x); refresh(); }); }))),
					React.createElement("div", { className: "skc-section", key: "l" }, "字体颜色"),
					row([firstPicker(state.label, "自由选择字体颜色", function (v) { applyLabel(v); refresh(); })].concat(label.slice(1).map(function (v, i) { return sq(v, "字体色" + (i + 1), state.label === v, function (x) { applyLabel(x); refresh(); }); })))
				]);

				var fontPanel = React.createElement("div", { className: "skc-panel", "data-panel": "font", role: "tabpanel", key: "font" }, [
					React.createElement("div", { className: "skc-section", key: "cn" }, "中文字体"),
					row(fontsCn.map(function (x) { return ft(x[1], x[0], state.cn === x[1], function (v) { applyFont(v, state.en); refresh(); }); })),
					React.createElement("div", { className: "skc-section", key: "en" }, "英文字体"),
					row(fontsEn.map(function (x) { return ft(x[1], x[0], state.en === x[1], function (v) { applyFont(state.cn, v); refresh(); }); }))
				]);

				var panels = { style: stylePanel, bg: bgPanel, color: colorPanel, font: fontPanel };
				return React.createElement("div", { className: "skc-page" }, [
					React.createElement("div", { className: "skc-title", key: "t" }, "外观皮肤"),
					tabs,
					panels[tab] || stylePanel
				]);
			}

			restore();

			// 视频背景在页面不可见时暂停，省电。
			var onVisibility = function () {
				if (!mediaEl) return;
				var v = mediaEl.querySelector ? mediaEl.querySelector("video") : null;
				if (!v) return;
				try { if (document.hidden) v.pause(); else { var p = v.play(); if (p && p.catch) p.catch(function () {}); } } catch (e) {}
			};
			if (typeof document !== "undefined" && document.addEventListener) document.addEventListener("visibilitychange", onVisibility);

			slotsSvc.inject("settings.section", function () {
				return slotsSvc.register({ name: "settings.section", id: "skinc-page", order: 31, label: "外观皮肤" }, function () { return React.createElement(Page); });
			});

			ctx.effect(function () {
				return function () {
					if (typeof document !== "undefined" && document.removeEventListener) document.removeEventListener("visibilitychange", onVisibility);
					rerender = null;
					removeMediaLayer();
					revokeUrl();
					drop("tokens"); drop("root"); drop("style"); drop("font"); drop("bg"); drop("radius");
					css();
				};
			});
		}

		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});
