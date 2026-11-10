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
			// 分段控件（segmented control）：外层浅底 + 描边，选中项是白色药丸 + 细光圈
			".skc-tabs{display:flex;align-items:stretch;width:100%;gap:2px;padding:4px;box-sizing:border-box;" +
			"border-radius:12px;border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.07));" +
			"background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-layer-1))}" +
			".skc-tab{flex:1 1 0;min-width:0;display:inline-flex;align-items:center;justify-content:center;gap:6px;" +
			"height:32px;padding:0 10px;border:0;border-radius:9px;background:transparent;" +
			"color:var(--dsw-alias-label-secondary);font-size:13px;font-weight:600;line-height:1;white-space:nowrap;cursor:pointer;" +
			"transition:background .14s ease,color .14s ease,box-shadow .14s ease}" +
			".skc-tab:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.10))}" +
			".skc-tab.skc-on{background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary);" +
			"box-shadow:0 1px 2px rgba(0,0,0,.10),0 0 0 1px rgba(0,0,0,.045)}" +
			".skc-tab svg{width:15px;height:15px;flex:0 0 15px;opacity:.8}" +
			".skc-tab.skc-on svg{opacity:1}" +
			".skc-tab .skc-tab-label{overflow:hidden;text-overflow:ellipsis}" +
			// 子标签（静态/动态/自定义）保持轻量胶囊，不抢主标签的视觉
			".skc-subtabs{width:auto;align-self:flex-start;margin:2px 0 4px;padding:3px;gap:3px;border:0;border-radius:10px;" +
			"background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-layer-1))}" +
			".skc-subtabs .skc-tab{flex:0 0 auto;height:26px;padding:0 12px;font-size:12px;border:0;border-radius:7px;background:transparent}" +
			".skc-subtabs .skc-tab.skc-on{background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary);" +
			"box-shadow:0 1px 2px rgba(0,0,0,.08),0 0 0 1px rgba(0,0,0,.04)}" +
			".skc-subtabs .skc-tab svg{display:none}" +
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
			// 输入框风格预览卡片
			".skc-cprev-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:10px}" +
			".skc-cprev{position:relative;display:flex;flex-direction:column;gap:8px;padding:10px;text-align:left;" +
			"border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1);cursor:pointer;font:inherit}" +
			".skc-cprev:hover{border-color:var(--dsw-alias-border-l3)}" +
			".skc-cprev.skc-on{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}" +
			".skc-cprev-head{display:flex;align-items:center;justify-content:space-between;gap:8px}" +
			".skc-cprev-name{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}" +
			".skc-cprev-hint{font-size:11px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}" +
			".skc-cprev-card{pointer-events:none}" +
			".skc-cprev-row{display:flex;align-items:center;gap:6px}" +
			".skc-cprev-chip{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:5px;" +
			"background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:1;white-space:nowrap}" +
						// 自定义图片裁切区
			".skc-crop-wrap{margin-top:10px;padding:10px;border:1px solid var(--dsw-alias-border-l2);" +
			"border-radius:10px;background:var(--dsw-alias-bg-layer-2);overflow:auto}" +
			".skc-crop{position:relative;overflow:hidden;border-radius:8px;" +
			"outline:2px dashed var(--dsw-alias-border-l3);outline-offset:-2px;background:#000}" +
			".skc-imgpanel{display:flex;flex-direction:column;gap:10px;margin-top:14px;padding-top:14px;" +
			"border-top:1px solid var(--dsw-alias-border-l1)}" +
".skc-cprev-send{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;margin-left:auto;" +
			"background:var(--dsw-alias-brand-primary);color:#fff;font-size:11px;font-weight:700;flex:none}" +
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
				composer: null,     // 输入框视觉风格 id
				header: null,       // 顶栏视觉风格 id
				headerTab: "static", // 顶栏子分类：static | dynamic | custom
				headerMask: 45,     // 顶栏图片蒙版强度
				headerImg: null,    // 顶栏图片 dataURL（真身存 IndexedDB）
				hCropSrc: null, hCropNat: null, hCropZoom: 1, hCropOx: 0, hCropOy: 0,
				composerTab: "static", // 输入框子分类：static | dynamic | custom
				composerMask: 45,   // 自定义图片的蒙版强度 0-100
				composerImg: null,  // 自定义图片 dataURL（运行时缓存，真身存 IndexedDB）
				flowColors: ["#D95926", "#8FB6E8", "#C79BE0"], // 流光边框的三段渐变色
				glowColor: "#D95926",
				msgStyle: "bubble",   // 文本消息框风格 id（null = 宿主默认）   // 呼吸光晕色
				caretColor: "#D95926",  // 光标律动 / 光标辐射色
				cropSrc: null,      // 裁切中的原图 dataURL（临时，不持久化）
				cropNat: null,      // 原图尺寸 {w,h}
				cropZoom: 1,        // 裁切缩放
				cropOx: 0, cropOy: 0, // 裁切平移
				cn: null, en: null,
				radius: 100,
				bgOn: true,
				scrim: 40,          // 背景遮罩强度 0-100
				panel: 70,          // 面板纱罩不透明度 0-100（0=全透明，图最清楚但字最难认）
				scrimTone: "auto",  // auto | light | dark
				slideOn: false,     // 文件夹轮播
				slideInterval: 30,  // 切换间隔（秒）
				slideCount: 0,
				slideIndex: 0,
				slideName: "",
				folderInfo: "",
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
			var layer = { tokens: null, root: null, style: null, font: null, bg: null, radius: null, composer: null, header: null, msg: null };
			var quiet = false;
			var rerender = null;

			var drop = function (name) {
				if (layer[name]) { try { layer[name](); } catch (e) {} layer[name] = null; }
			};
			var clearStyleLayers = function () { drop("root"); drop("style"); };

			var tok = function (v, k) { return { light: v, dark: darkOf(v, k) }; };
			// 深色映射：背景变黑、文字变白、主色不变（亮度不足时提亮到同色相更深一档）。
			// 宿主 composeActive 会按 active.colorScheme 自动挑 light/dark，
			// 插件不需要自己监听主题切换。
			var DARK_BG = "#151517";
			var DARK_LAYER = { 1: "#1F1F21", 2: "#262629", 3: "#2C2C2E" };
			var DARK_FG = { primary: "#F5F5F6", secondary: "#B4B4B8", tertiary: "#87878C" };
			var tokens = {};
			var setTokens = function (k, v) { tokens[k] = v; };
			// 把浅色值换算成深色值。规则：
			//  1) 背景类 → 深色底/分层深灰
			//  2) 文字类 → 浅色（按亮度轻微降级，避免刺眼）
			//  3) 主色/强调色 → 尽量保持不变；若在深底上对比不足 3:1，就同色相提亮
			//  4) 边框 → 半透明白（与宿主深色一致，避免生硬描边）
			var lum = function (hex) {
				var h = String(hex || "").replace("#", "");
				if (h.length < 6) return 0;
				var r = parseInt(h.slice(0, 2), 16) / 255,
					g = parseInt(h.slice(2, 4), 16) / 255,
					b = parseInt(h.slice(4, 6), 16) / 255;
				var f = function (u) { return u <= 0.03928 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4); };
				return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
			};
			var contrast = function (a, b) {
				var la = lum(a), lb = lum(b), hi = Math.max(la, lb), lo = Math.min(la, lb);
				return (hi + 0.05) / (lo + 0.05);
			};
			var lighten = function (hex, keepHue) {
				var h = String(hex || "").replace("#", "");
				if (h.length < 6) return hex;
				var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
				// 向白色混合 42%（保持色相），用于深底上提亮
				var mix = function (v) { return Math.round(v + (255 - v) * (keepHue || 0.42)); };
				var to2 = function (v) { var s = v.toString(16); return s.length < 2 ? "0" + s : s; };
				return "#" + to2(mix(r)) + to2(mix(g)) + to2(mix(b));
			};
			var darkOf = function (v, k) {
				if (typeof v !== "string" || v.charAt(0) !== "#" || v.length < 7) return v;
				// 边框：统一半透明白
				if (k.indexOf("border") >= 0) {
					if (k.indexOf("-l1") >= 0) return "#ffffff0f";
					if (k.indexOf("-l2") >= 0) return "#ffffff1f";
					if (k.indexOf("-l3") >= 0) return "#ffffff29";
					return "#ffffff3d";
				}
				// 背景基色
				if (k === "--dsw-alias-bg-base") return DARK_BG;
				if (k.indexOf("bg-layer-1") >= 0) return DARK_LAYER[1];
				if (k.indexOf("bg-layer-2") >= 0) return DARK_LAYER[2];
				if (k.indexOf("bg-layer-3") >= 0) return DARK_LAYER[3];
				if (k.indexOf("sidebar-fill") >= 0) return "#222226";
				if (k.indexOf("sidebar-nav-item-active") >= 0) return "#2C2C2E";
				if (k.indexOf("bubble") >= 0) return "#24262C";
				if (k.indexOf("input-major") >= 0) return "#1F1F21";
				if (k.indexOf("interactive-bg-hover") >= 0) return "#ffffff14";
				if (k.indexOf("settings-card-fill") >= 0) return DARK_LAYER[1];
				if (k.indexOf("menu-group-header-fill") >= 0) return "#1F1F21";
				if (k.indexOf("specific-menu") >= 0) return DARK_LAYER[2];
				if (k.indexOf("specific-tip") >= 0) return DARK_LAYER[2];
				// 文字
				if (k.indexOf("label-primary") >= 0) return DARK_FG.primary;
				if (k.indexOf("label-secondary") >= 0) return DARK_FG.secondary;
				if (k.indexOf("label-tertiary") >= 0) return DARK_FG.tertiary;
				// 主色 / 强调色：保持不变，对比不足才提亮
				if (contrast(v, DARK_BG) >= 3) return v;
				return lighten(v);
			};
			var applyTokens = function () {
				drop("tokens");
				var y = {};
				Object.keys(tokens).forEach(function (k) { y[k] = tok(tokens[k], k); });
				if (Object.keys(y).length) layer.tokens = theme.overrideTokens("dsh-simple-ui", y);
			};

			var savePrefs = function () {
				if (quiet) return;
				var snap = {};
				Object.keys(tokens).forEach(function (k) { snap[k] = tokens[k]; });
				storageSet(STORE_PREFS, JSON.stringify({
					v: 3, tab: state.tab, preset: state.preset, main: state.main, accent: state.accent,
					neutral: state.neutral, label: state.label, cn: state.cn, en: state.en,
					composer: state.composer, composerMask: state.composerMask, composerTab: state.composerTab, header: state.header, headerTab: state.headerTab,
					flowColors: state.flowColors, glowColor: state.glowColor, caretColor: state.caretColor, msgStyle: state.msgStyle, headerMask: state.headerMask,
					radius: state.radius, bgOn: state.bgOn !== false,
					scrim: state.scrim, panel: state.panel, scrimTone: state.scrimTone,
					slideOn: state.slideOn, slideInterval: state.slideInterval, slideCount: state.slideCount,
					bgKind: state.bgKind, bgName: state.bgName, tokens: snap
				}));
			};
			var notify = function () { if (typeof rerender === "function") { try { rerender(); } catch (e) {} } };

			// ---------------- 预设 / 配色 ----------------
			var STYLE_GOV = "body::after{content:\"\";position:fixed;left:0;right:0;top:0;height:5px;background:linear-gradient(90deg,#A00810,#D93A3F);z-index:2147483000;pointer-events:none}[class*=\"_sidebarCol\"]{border-right:1px solid rgba(190,10,16,.16)!important}[class*=\"_mainPanel\"]{border-top:3px solid #BE0A10!important;border-radius:6px!important}h1,h2,h3,h4{font-family:\"Noto Serif SC\",\"SimSun\",serif!important;letter-spacing:.02em}button{transition:transform .12s ease,box-shadow .12s ease!important}button:active{transform:translateY(1px)!important}";
			var STYLE_NIGHTCITY = "html{background:#080808!important}[class*=\"_frame\"]{background:linear-gradient(135deg,#080808 0%,#17120b 52%,#120616 100%)!important}[class*=\"_sidebarCol\"]{background:linear-gradient(180deg,#080808,#181007)!important;border-right:3px solid #FCEE0A!important;position:relative}[class*=\"_sidebarCol\"]::before{content:\"NIGHT CITY // 2077\";display:block;margin:12px 10px 7px;padding:7px 8px;background:#FCEE0A;color:#080808;font-family:monospace;font-size:11px;font-weight:900;letter-spacing:.13em;clip-path:polygon(0 0,100% 0,94% 100%,0 100%)}[class*=\"_sidebarCol\"]::after{content:\"NET.STATUS : ONLINE\";display:block;margin:auto 10px 12px;padding-top:8px;border-top:1px solid rgba(252,238,10,.65);color:#FCEE0A;font-family:monospace;font-size:9px;letter-spacing:.18em}[class*=\"_sidebarCol\"] button,[class*=\"_sidebarCol\"] a{border-left:3px solid transparent!important;transition:transform .16s ease,background .16s ease,border-color .16s ease!important}[class*=\"_sidebarCol\"] button:hover,[class*=\"_sidebarCol\"] a:hover{background:#FCEE0A!important;color:#080808!important;border-left-color:#FF2A86!important;transform:translateX(5px) skewX(-4deg)}[class*=\"_mainPanel\"]{background:linear-gradient(110deg,#11110d,#1a100d 70%,#170817)!important;border:1px solid #FCEE0A!important;border-left:5px solid #FCEE0A!important;box-shadow:7px 7px 0 #FF2A86,0 0 24px rgba(252,238,10,.18)!important}";
			var STYLE_NEWS = "*,*::before,*::after{border-radius:0!important}[class*=\"_mainPanel\"]{border:1px solid #1A1A1A!important;box-shadow:5px 5px 0 rgba(26,26,26,.85)!important}[class*=\"_sidebarCol\"]{border-right:1px solid #1A1A1A!important;background:#F5F0E3!important}[class*=\"_sidebarCol\"] button,[class*=\"_sidebarCol\"] a{font-family:\"Noto Serif SC\",\"SimSun\",serif!important}h1,h2,h3,h4{font-family:\"Noto Serif SC\",\"SimSun\",serif!important;letter-spacing:.02em}p{text-align:justify}";
			var STYLE_SKETCH = "html{background:#EEE9DF!important}body{background-image:repeating-linear-gradient(24deg,rgba(55,52,46,.035) 0 1px,transparent 1px 8px),repeating-linear-gradient(-29deg,rgba(55,52,46,.025) 0 1px,transparent 1px 11px)!important}[class*=\"_frame\"]{background:rgba(247,244,237,.9)!important}[class*=\"_sidebarCol\"]{background:repeating-linear-gradient(-35deg,rgba(45,43,39,.045) 0 1px,transparent 1px 8px),#E8E2D7!important;border-right:2px solid #3D3933!important;box-shadow:3px 0 0 rgba(61,57,51,.18),7px 0 0 rgba(61,57,51,.06)!important;position:relative}[class*=\"_sidebarCol\"]::before{content:\"SKETCHBOOK\";display:block;margin:13px 12px 8px;padding:5px 2px;border-bottom:2px solid #3D3933;color:#3D3933;font-family:\"LXGW WenKai\",KaiTi,serif;font-size:16px;font-weight:700;letter-spacing:.08em;transform:rotate(-1.2deg)}[class*=\"_sidebarCol\"] button,[class*=\"_sidebarCol\"] a{font-family:\"LXGW WenKai\",KaiTi,\"Noto Serif SC\",serif!important;transition:transform .14s ease,background .14s ease!important}[class*=\"_mainPanel\"]{background:rgba(252,250,245,.96)!important;border:1px solid #3D3933!important;border-radius:2px!important;box-shadow:2px 2px 0 rgba(61,57,51,.75)!important}";
			// [CC] 预设的额外装饰：Claude 的侧栏与内容区几乎同色（#FBFBF9 vs #FCFCFB），
			// 全靠中间一条 1px 极浅竖线分隔。实测该线为 #E2E2E1（x=410 处采样）。
			// 不补这条线，两块会糊在一起。
			var STYLE_CC =
				"[class*=\"_sidebarCol\"]{border-right:1px solid #E2E2E1!important}" +
				"body[data-ds-dark-theme] [class*=\"_sidebarCol\"]{border-right:1px solid rgba(255,255,255,.10)!important}";


			// ---------------------------------------------------------------------------
			// [CC] 预设 = Claude 桌面端配色体系（直接从 app.asar 的 MainWindowPage CSS 提取）
			//
			// Claude 的浅色不是"奶油暖色"，而是近乎中性的灰（gray-10 #FCFCFB，R-B 仅差 1），
			// 层次靠明度阶梯而不是色相：gray-0/10 底 → gray-20~50 卡片 → gray-60 选中。
			// 品牌主色是赭橙 hsl(15,63.1%,59.6%) = #D97757，辅助色是蓝阶 #3987E5 系。
			//
			// 宿主把气泡/卡片/输入框挂在独立 token 上，只改 bg-base 会让这些层继续用默认冷色，
			// 所以这里把整条表面阶梯、文字层级、边框一起对齐 Claude。
			// ---------------------------------------------------------------------------
			var CC_SURFACE = {
				// 输入框：最亮，浮在底色上（Claude gray-0）
				"--dsw-specific-input-major": "#FFFFFF",
				// 用户气泡：Claude 用浅蓝调强调（blue-30 #F0F7FE 系），不是暖砂
				"--dsw-specific-bubble": "#F0F4FA",
				"--dsw-specific-bubble-highlight": "#E7F1FB",
				// 卡片 / 代码块 / 次级容器（Claude 卡片实测 #F0F0EF = gray-50）
				"--dsw-alias-bg-layer-1": "#F0F0EF",
				"--dsw-alias-bg-layer-2": "#F6F6F4",
				"--dsw-alias-bg-layer-3": "#FFFFFF",
				// 卡片内选项行、菜单、提示（Claude gray-60 ~ gray-70）
				"--dsw-alias-interactive-bg-hover": "#EDECE8",
				"--dsw-alias-settings-card-fill": "#F0F0EF",
				"--dsw-alias-menu-group-header-fill": "#FCFCFB",
				"--dsw-specific-menu": "#FFFFFF",
				"--dsw-specific-tip": "#F3F3F0",
				// 边框：Claude 用 gray-90~150，中性微冷
				"--dsw-alias-border-l1": "#E7E6E1",
				"--dsw-alias-border-l2": "#E1E0D9",
				"--dsw-alias-border-l3": "#D2D1C7",
				"--dsw-alias-border-l4": "#C3C2B7"
			};
			// 侧栏与底色：严格取 Claude 实测值（sidebar #FBFBF9 / content #FCFCFB）
			var CC_SIDEBAR = {
				"--dsw-specific-sidebar-fill": "#FBFBF9",
				"--dsw-specific-sidebar-nav-item-active": "#EDECE8",
				"--dsw-alias-bg-base": "#FCFCFB",
				"--dsw-alias-bg-layer-2": "#F6F6F4"
			};
			// 文字层级：Claude gray-900 / 600 / 400，中性无色偏
			var CC_LABELS = {
				"--dsw-alias-label-primary": "#0B0B0B",
				"--dsw-alias-label-secondary": "#52514E",
				"--dsw-alias-label-tertiary": "#898781"
			};
			// 主色 / 辅助色
			//
			// 重要：DSH 的 composer 发送按钮（.GRgSLq_primary）用的是 --dsw-alias-button-info-fill，
			// 不是 brand-primary。所以主色必须同时写进 button-info-*，否则按钮不变色。
			// 宿主默认 button-info-fill 指向 --dsw-static-deepseek-500（蓝），这就是"主色没生效"的原因。
			// 主色取 Claude orange-400 #D95926（深橙）；hover 向 orange-500 走深。
			var CC_BRAND = {
				// 主色：深橙
				"--dsw-alias-brand-primary": "#D95926",
				"--dsw-alias-brand-text": "#D95926",
				"--dsw-alias-button-primary-fill": "#D95926",
				"--dsw-alias-button-primary-hover": "#AE461C",
				"--dsw-alias-state-business-primary": "#D95926",
				"--dsw-specific-sidebar-nav-item-active-accent": "#D95926",
				// 关键：composer 发送按钮 / 选中图标 / badge 走的是 info-fill
				"--dsw-alias-button-info-fill": "#D95926",
				"--dsw-alias-button-info-hover": "#AE461C",
				"--dsw-alias-button-primary-dimmed": "#F3C5B2",
				// 链接保持克制的蓝，作为辅助色
				"--dsw-alias-link": "#256ABF"
			};

			var presets = [
				["claude", "[CC]", "#FCFCFB", "#FBFBF9", "#0B0B0B", "#D95926", "\"Noto Sans SC\",\"Source Han Sans SC\",\"Microsoft YaHei\"", "Inter,\"Segoe UI\"", STYLE_CC, CC_SURFACE, CC_SIDEBAR, CC_LABELS, CC_BRAND],
				["apple", "Apple 银灰", "#F5F5F7", "#FFFFFF", "#1D1D1F", "#007AFF", "\"PingFang SC\",\"Microsoft YaHei\"", "\"SF Pro Display\",\"Segoe UI\""],
				["nightcity", "夜之城 2077", "#080808", "#15110B", "#F5F1D8", "#FCEE0A", "\"Noto Sans SC\",\"Source Han Sans SC\",\"Microsoft YaHei\"", "\"JetBrains Mono\",Consolas,\"Cascadia Mono\"", STYLE_NIGHTCITY],
				["gov", "红白页", "#F5F6F8", "#FFFFFF", "#262626", "#BE0A10", "\"Noto Serif SC\",\"Source Han Serif SC\",\"Songti SC\",SimSun", "\"Source Sans 3\",\"Segoe UI\"", STYLE_GOV],
				["news", "报纸版面", "#F7F3E9", "#FDFBF3", "#1A1A1A", "#1A1A1A", "\"Noto Serif SC\",\"Source Han Serif SC\",\"Songti SC\",SimSun", "Georgia,\"Times New Roman\",serif", STYLE_NEWS],
				["sketch", "素描线稿", "#EEE9DF", "#F7F4ED", "#3D3933", "#3D3933", "\"LXGW WenKai\",KaiTi,\"Kaiti SC\",STKaiti", "\"IBM Plex Mono\",Consolas,\"Cascadia Mono\"", STYLE_SKETCH],
			];
			// ---------------------------------------------------------------------------
			// 输入框视觉风格（纯外观，不改行为）
			//
			// 稳定选择器来自宿主真实 DOM（已核对 app.asar）：
			//   [data-composer-card]        整个输入框卡片
			//   [class*="_input"]           文字输入区（contenteditable）
			//   [class*="_placeholder"]     占位文字
			//   [class*="_row"]             底部控制行
			//   [class*="_primary"]         发送按钮
			// data-* 属性是宿主自己挂的语义标记，不随构建哈希变化，比 [class*="_xxx"] 更稳。
			//
			// 每个风格只声明一份规格，预览与真实样式都由它生成，避免"预览好看、实际不一样"。
			// light/dark 两套值由宿主 colorScheme 自动切换。
			// ---------------------------------------------------------------------------
			// 桃花瓣贴图：每张 tile 的瓣数、位置、大小、旋转、透明度都不同。
			// 只重复一张图会形成规则网格（看起来"太整齐"），所以做三层不同尺寸的贴图叠在一起。
			var petalTile = function (size, petals) {
				var body = "";
				for (var i = 0; i < petals.length; i++) {
					var p = petals[i];
					body += "<g transform=\"translate(" + p[0] + "," + p[1] + ") rotate(" + p[2] + ") scale(" + p[3] + ")\">" +
						"<path d=\"M10 22 C5 18 3 11 5 5 C6.5 1.5 9 2 10 6 C11 2 13.5 1.5 15 5 C17 11 15 18 10 22 Z\" fill=\"" + p[4] + "\" opacity=\"" + p[5] + "\"/>" +
						"</g>";
				}
				var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + size + "\" height=\"" + size + "\">" + body + "</svg>";
				return "url(\"data:image/svg+xml," + encodeURIComponent(svg) + "\")";
			};
			// 近景：大瓣、密；中景：中瓣、疏；远景：小瓣、极疏。三者尺寸互不整除，叠起来不会出现规则重复。
			var PETAL_NEAR = petalTile(160, [
				[10, 6, 20, 1.0, "#F7AFC8", 0.95],
				[92, 40, -26, 0.82, "#F5BBD0", 0.82],
				[40, 104, 34, 0.92, "#F9C6D9", 0.88],
				[126, 116, -12, 0.68, "#F2A2C0", 0.72],
				[74, 16, 8, 0.6, "#FAD2E2", 0.68],
			]);
			var PETAL_MID = petalTile(232, [
				[18, 30, -38, 0.72, "#F4B6CD", 0.62],
				[150, 12, 46, 0.58, "#F9C9DB", 0.52],
				[96, 150, 12, 0.66, "#EF9EBD", 0.58],
			]);
			var PETAL_FAR = petalTile(320, [
				[26, 54, 28, 0.42, "#F8CBDD", 0.34],
				[196, 190, -32, 0.36, "#FBE0EB", 0.28],
			]);
			var PETAL_IMAGES = PETAL_NEAR + "," + PETAL_MID + "," + PETAL_FAR;
			var PETAL_SIZES = "160px 160px,232px 232px,320px 320px";

			// 光标可能落在 textarea、contenteditable 或宿主的 _input 元素上，三种都覆盖
			// ---------------- 粒子系统（飘雪 / 桃花 / 枫叶 / 细雨） ----------------
			// 平铺贴图无论叠几层都会露出规则网格，所以这四类改成逐粒子元素：
			// 每个粒子的起点、大小、下落时长、延迟、横向漂移、旋转、透明度都由 Math.random 决定。
			var svgCssUrl = function (viewBox, body) {
				return "url(\"data:image/svg+xml," + encodeURIComponent(
					"<svg xmlns='http://www.w3.org/2000/svg' viewBox='" + viewBox + "'>" + body + "</svg>"
				) + "\")";
			};
			// 桃花瓣：水滴形 + 顶端小缺口（原来的形状像心形/蝴蝶，不像花瓣）
			var PETAL_SHAPE = svgCssUrl("0 0 20 24",
				"<path d='M10 23 C6.6 20.4 4.4 16.6 4.4 12.4 C4.4 8.6 6 5 8.2 3.6 C9.1 3.1 9.8 3.7 10 5.2 C10.2 3.7 10.9 3.1 11.8 3.6 C14 5 15.6 8.6 15.6 12.4 C15.6 16.6 13.4 20.4 10 23 Z' fill='#F5A8C4'/>" +
				"<path d='M10 6.4 C10.4 9.2 10.6 14 10 20' stroke='#E0709B' stroke-width='0.7' fill='none' opacity='0.5'/>");
			// 枫叶：五裂叶 + 叶柄
			var MAPLE_SHAPE = svgCssUrl("0 0 20 24",
				"<path d='M10 1 L11.6 5.6 L15.6 3.9 L14 7.9 L19.2 8.7 L15 10.8 L17.2 15.4 L12.3 13.6 L10 19 L7.7 13.6 L2.8 15.4 L5 10.8 L0.8 8.7 L6 7.9 L4.4 3.9 L8.4 5.6 Z' fill='#D9691F'/>" +
				"<path d='M10 13 L10 22' stroke='#B24E12' stroke-width='1.1' stroke-linecap='round'/>");

			var FX_KINDS = { petal: 26, snow: 30, maple: 18, rain: 46 };
			var fxState = { card: null, layer: null, kind: null };

			var removeFx = function () {
				if (fxState.layer && fxState.layer.parentNode) { try { fxState.layer.parentNode.removeChild(fxState.layer); } catch (e) {} }
				fxState = { card: null, layer: null, kind: null };
			};
			var buildFx = function (kind) {
				if (!FX_KINDS[kind]) { removeFx(); return; }
				if (typeof document === "undefined" || !document.querySelector) return;
				var card = document.querySelector("[data-composer-card]");
				if (!card || !card.appendChild) return;
				if (fxState.card === card && fxState.kind === kind && fxState.layer && fxState.layer.parentNode) return;
				removeFx();
				var layerEl = document.createElement("div");
				layerEl.className = "skc-fx skc-fx-" + kind;
				var n = FX_KINDS[kind];
				var rnd = Math.random;
				for (var i = 0; i < n; i++) {
					var it = document.createElement("i");
					it.className = "skc-fx-item";
					var isRain = kind === "rain";
					var size = isRain ? 1 : (kind === "snow" ? (2 + rnd() * 4) : (9 + rnd() * 8));
					var dur = isRain ? (1.1 + rnd() * 1.5) : (kind === "snow" ? (7 + rnd() * 9) : (8 + rnd() * 7));
					var delay = -rnd() * dur;
					var drift = isRain ? (rnd() * 10 - 3) : ((rnd() * 2 - 1) * (kind === "snow" ? 40 : 95));
					var rot = isRain ? 3 : ((rnd() * 2 - 1) * (kind === "snow" ? 0 : 330));
					var op = isRain ? (0.14 + rnd() * 0.26) : (kind === "snow" ? (0.45 + rnd() * 0.5) : (0.5 + rnd() * 0.45));
					if (it.style && it.style.setProperty) {
						it.style.setProperty("--x", (rnd() * 102 - 1).toFixed(1) + "%");
						it.style.setProperty("--size", size.toFixed(1) + "px");
						it.style.setProperty("--dur", dur.toFixed(2) + "s");
						it.style.setProperty("--delay", delay.toFixed(2) + "s");
						it.style.setProperty("--drift", drift.toFixed(0) + "px");
						it.style.setProperty("--rot", rot.toFixed(0) + "deg");
						it.style.setProperty("--op", op.toFixed(2));
						if (isRain) it.style.setProperty("--len", (9 + rnd() * 18).toFixed(0) + "px");
					}
					layerEl.appendChild(it);
				}
				card.appendChild(layerEl);
				fxState = { card: card, layer: layerEl, kind: kind };
			};
			var FX_OF_STYLE = { petal: 1, snow: 1, maple: 1, rain: 1 };
			var refreshFx = function () {
				var k = state.composer;
				if (FX_OF_STYLE[k]) buildFx(k); else removeFx();
			};
			// 粒子层挂在 composer 卡片上；卡片可能晚于样式出现，所以切风格后补两次
			var refreshFxSoon = function () {
				refreshFx();
				if (typeof setTimeout !== "function") return;
				setTimeout(refreshFx, 60);
				setTimeout(refreshFx, 400);
			};

			// 粒子外壳 + 通用下落动画：每个粒子的时长/延迟/漂移/旋转都来自自身 CSS 变量，
			// 彼此不同步——这是"随机感"的关键，平铺贴图做不到。
			var FX_BASE_CSS = function (bgRest) {
				return "[data-composer-card]{position:relative!important;overflow:hidden!important;border:0!important;background:" + bgRest + "!important}" +
					".skc-fx{position:absolute!important;inset:0!important;overflow:hidden!important;pointer-events:none!important;z-index:0!important;border-radius:inherit!important}" +
					".skc-fx-item{position:absolute;left:var(--x,50%);top:-16%;width:var(--size,12px);height:var(--size,12px);display:block;opacity:0;" +
					"will-change:transform,opacity;background-repeat:no-repeat;background-size:100% 100%}" +
					"[data-composer-card]>*:not(.skc-fx){position:relative!important;z-index:1!important}" +
					"@media (prefers-reduced-motion: reduce){.skc-fx{display:none!important}.skc-caretfx-ring.on{opacity:.5;transform:translate(var(--skc-cx,0px),var(--skc-cy,0px)) scale(1.15)}}";
			};
			var FX_FALL_KEYFRAMES = "@keyframes skc-fallUp{0%{transform:translate3d(0,-8%,0) rotate(0deg);opacity:0}" +
				"6%{opacity:var(--op,.8)}" +
				"38%{transform:translate3d(calc(var(--drift,0px) * 0.35),42%,0) rotate(calc(var(--rot,180deg) * 0.35))}" +
				"66%{transform:translate3d(calc(var(--drift,0px) * 0.78),78%,0) rotate(calc(var(--rot,180deg) * 0.72))}" +
				"100%{transform:translate3d(var(--drift,0px),132%,0) rotate(var(--rot,180deg));opacity:0}}";
			var CARET_INPUT_SEL = "[data-composer-card] textarea,[data-composer-card] [contenteditable=\"true\"],[data-composer-card] [class*=\"_input\"]";
			var COMPOSER_STYLES = [
	{ id: "flat", cat: "static", name: "极简扁平", hint: "无边框无阴影，最轻",
		light: { bg: "#F1F0EC", border: "0", radius: 12, shadow: "none" },
		dark: { bg: "#1F1F21", border: "0", radius: 12, shadow: "none" } },
	{ id: "outline", cat: "static", name: "描边卡片", hint: "细边框，边界清晰",
		light: { bg: "#FFFFFF", border: "1px solid #E1E0D9", radius: 14, shadow: "none" },
		dark: { bg: "#1B1B1D", border: "1px solid #ffffff1f", radius: 14, shadow: "none" } },
	{ id: "float", cat: "static", name: "悬浮层", hint: "大圆角 + 柔和投影，浮起来",
		light: { bg: "#FFFFFF", border: "0", radius: 22, shadow: "0 10px 30px rgba(0,0,0,.10), 0 1px 3px rgba(0,0,0,.05)" },
		dark: { bg: "#232326", border: "0", radius: 22, shadow: "0 10px 30px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.4)" } },
	{ id: "inset", cat: "static", name: "内嵌下沉", hint: "内阴影，像嵌进页面",
		light: { bg: "#EDECE8", border: "0", radius: 12, shadow: "inset 0 2px 6px rgba(0,0,0,.07)" },
		dark: { bg: "#141416", border: "0", radius: 12, shadow: "inset 0 2px 6px rgba(0,0,0,.5)" } },
	{ id: "terminal", cat: "static", name: "终端方角", hint: "直角 + 等宽字，工具感",
		light: { bg: "#FFFFFF", border: "1px solid #C9C8C0", radius: 3, shadow: "none", mono: true },
		dark: { bg: "#17171A", border: "1px solid #3A3A3E", radius: 3, shadow: "none", mono: true } },
	{ id: "paper", cat: "static", name: "纸感", hint: "暖米底 + 柔和阴影",
		light: { bg: "#FBF8F1", border: "0", radius: 18, shadow: "0 2px 12px rgba(120,100,60,.10)" },
		dark: { bg: "#1E1C18", border: "0", radius: 18, shadow: "0 2px 12px rgba(0,0,0,.45)" } },
	{ id: "glass", cat: "static", name: "玻璃拟态", hint: "半透明 + 背景模糊，通透",
		light: { bg: "rgba(255,255,255,.55)", border: "1px solid rgba(255,255,255,.65)", radius: 20, shadow: "0 8px 24px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.75)", blur: "saturate(180%) blur(18px)" },
		dark: { bg: "rgba(32,32,36,.55)", border: "1px solid rgba(255,255,255,.14)", radius: 20, shadow: "0 8px 24px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.10)", blur: "saturate(180%) blur(18px)" } },
	// ---- 动态：纯 CSS 动画 ----
	{ id: "flow", cat: "dynamic", name: "流光边框", hint: "渐变光带沿边框流动，颜色可配",
		light: { bg: "#FFFFFF", border: "1.5px solid #D95926", radius: 14, shadow: "none" },
		dark: { bg: "#1B1B1D", border: "1.5px solid #EB6834", radius: 14, shadow: "none" },
		// 注意：动画作用在 ::before 的 background-position 上，这里绝不能用 background 简写 + !important，
		// 否则 !important 静态声明会压住动画（这正是旧版"没动态"的原因）。
		css: function () {
			var c = state.flowColors || ["#D95926", "#8FB6E8", "#C79BE0"];
			var grad = "linear-gradient(90deg," + c[0] + "," + c[1] + "," + c[2] + "," + c[0] + ")";
			var sel = "[data-composer-card]";
			return sel + "{position:relative!important;border:0!important;background:var(--dsw-alias-bg-layer-1,#FFFFFF)!important}" +
				"body[data-ds-dark-theme] " + sel + "{background:var(--dsw-alias-bg-layer-1,#1B1B1D)!important}" +
				sel + "::before{content:\"\";position:absolute;inset:0;border-radius:inherit;padding:1.5px;pointer-events:none;" +
				"background:" + grad + ";background-size:300% 100%;" +
				"-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;" +
				"mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude}" +
				"@media (prefers-reduced-motion: no-preference){" +
				"@keyframes skc-flow{0%{background-position:0% 50%}100%{background-position:300% 50%}}" +
				sel + "::before{animation:skc-flow 3s linear infinite}}";
		} },
	{ id: "glow", cat: "dynamic", name: "呼吸光晕", hint: "边框光晕缓慢呼吸，颜色可配",
		light: { bg: "#FFFFFF", border: "0", radius: 14, shadow: "0 0 0 3px rgba(217,89,38,.22)" },
		dark: { bg: "#1B1B1D", border: "0", radius: 14, shadow: "0 0 0 3px rgba(235,104,52,.28)" },
		css: function () {
			var rgb = hexToRgb(state.glowColor) || [217, 89, 38];
			var c = rgb.join(",");
			var sel = "[data-composer-card]";
			return sel + "{border:0!important;background:var(--dsw-alias-bg-layer-1,#FFFFFF)!important}" +
				"@media (prefers-reduced-motion: no-preference){" +
				"@keyframes skc-glow{0%,100%{box-shadow:0 0 0 0 rgba(" + c + ",0),0 4px 14px rgba(0,0,0,.06)}" +
				"50%{box-shadow:0 0 0 3px rgba(" + c + ",.24),0 6px 22px rgba(" + c + ",.18)}}" +
				sel + "{animation:skc-glow 2.6s ease-in-out infinite}}";
		} },
	{ id: "aurora", cat: "dynamic", name: "极光渐变", hint: "底色缓慢流动",
		light: { bg: "linear-gradient(120deg,#FFF4EE,#EFF4FF,#F7EEFF)", border: "0", radius: 14, shadow: "none" },
		dark: { bg: "linear-gradient(120deg,#221A16,#161A22,#1E1622)", border: "0", radius: 14, shadow: "none" },
		// 旧版用 background 简写 + !important，把 background-position 也一并写死，8s 的位移动画被压住 → 看着是静止的。
		// 现在只写 background-color / -image / -size，position 留给动画。
		raw: {
			light: "%SEL%{border:0!important;background-color:var(--dsw-alias-bg-layer-1,#FFFFFF)!important;background-image:linear-gradient(120deg,#FFF4EE,#EFF4FF,#F7EEFF,#FFF4EE)!important;background-size:300% 300%!important}",
			dark: "%SEL%{border:0!important;background-color:var(--dsw-alias-bg-layer-1,#1B1B1D)!important;background-image:linear-gradient(120deg,#221A16,#161A22,#1E1622,#221A16)!important;background-size:300% 300%!important}"
		},
		anim: "@keyframes skc-aurora{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}%SEL%{animation:skc-aurora 8s ease infinite}" },
	{ id: "caret", cat: "dynamic", name: "光标律动", hint: "光标附近一颗柔光随输入呼吸",
		light: { bg: "#FFFFFF", border: "0", radius: 14, shadow: "none" },
		dark: { bg: "#1B1B1D", border: "0", radius: 14, shadow: "none" },
		// 原生光标颜色改不了动画（caret-color 也被 !important 压住），改成跟随光标位置的柔光点，
		// 位置由 JS 实时测量，CSS 只负责渲染与呼吸。
		css: function () {
			var rgb = hexToRgb(state.caretColor) || [217, 89, 38];
			var c = rgb.join(",");
			return "[data-composer-card]{position:relative!important;border:0!important;background:var(--dsw-alias-bg-layer-1,#FFFFFF)!important}" +
				"body[data-ds-dark-theme] [data-composer-card]{background:var(--dsw-alias-bg-layer-1,#1B1B1D)!important}" +
				CARET_INPUT_SEL + "{caret-color:" + (state.caretColor || "#D95926") + "!important}" +
				".skc-caretfx{position:absolute!important;inset:0!important;pointer-events:none!important;overflow:hidden!important;border-radius:inherit!important;z-index:3!important}" +
				".skc-caretfx-dot{position:absolute;left:0;top:0;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;opacity:0;" +
				"background:radial-gradient(circle,rgba(" + c + ",.32),rgba(" + c + ",0) 70%);" +
				"transform:translate(var(--skc-cx,0px),var(--skc-cy,0px)) scale(.7);transition:opacity .2s ease,transform .16s ease-out}" +
				".skc-caretfx-dot.on{opacity:1}" +
				"@media (prefers-reduced-motion: no-preference){@keyframes skc-caretBreath{0%,100%{opacity:.5;transform:translate(var(--skc-cx,0px),var(--skc-cy,0px)) scale(.78)}50%{opacity:1;transform:translate(var(--skc-cx,0px),var(--skc-cy,0px)) scale(1.08)}}.skc-caretfx-dot.on{animation:skc-caretBreath 1.8s ease-in-out infinite}}";
		} },
	{ id: "caretradiate", cat: "dynamic", name: "光标辐射", hint: "有内容输入时，从光标向外辐射一圈流光",
		light: { bg: "#FFFFFF", border: "0", radius: 14, shadow: "none" },
		dark: { bg: "#1B1B1D", border: "0", radius: 14, shadow: "none" },
		css: function () {
			var rgb = hexToRgb(state.caretColor) || [217, 89, 38];
			var c = rgb.join(",");
			return "[data-composer-card]{position:relative!important;border:0!important;background:var(--dsw-alias-bg-layer-1,#FFFFFF)!important}" +
				"body[data-ds-dark-theme] [data-composer-card]{background:var(--dsw-alias-bg-layer-1,#1B1B1D)!important}" +
				CARET_INPUT_SEL + "{caret-color:" + (state.caretColor || "#D95926") + "!important}" +
				".skc-caretfx{position:absolute!important;inset:0!important;pointer-events:none!important;overflow:hidden!important;border-radius:inherit!important;z-index:3!important}" +
				".skc-caretfx-ring{position:absolute;left:0;top:0;width:72px;height:72px;margin:-36px 0 0 -36px;aspect-ratio:1/1;flex:none;border-radius:50%;opacity:0;overflow:visible;" +
				"border:1.5px solid rgba(" + c + ",.55);background:radial-gradient(circle,rgba(" + c + ",.18),rgba(" + c + ",0) 72%);" +
				"transform:translate(var(--skc-cx,0px),var(--skc-cy,0px)) scale(.4)}" +
				".skc-caretfx-ring.on{opacity:0}" +
				"@media (prefers-reduced-motion: no-preference){@keyframes skc-radiate{0%{opacity:.85;transform:translate(var(--skc-cx,0px),var(--skc-cy,0px)) scale(.4)}100%{opacity:0;transform:translate(var(--skc-cx,0px),var(--skc-cy,0px)) scale(2.8)}}.skc-caretfx-ring.on{animation:skc-radiate .9s ease-out}}";
		} },
	{ id: "scan", cat: "dynamic", name: "霓虹扫描", hint: "彩色光带扫过",
		light: { bg: "linear-gradient(90deg,#FFFFFF,#EFEFEF,#FFFFFF)", border: "0", radius: 14, shadow: "none" },
		dark: { bg: "linear-gradient(90deg,#1B1B1D,#2C2C30,#1B1B1D)", border: "0", radius: 14, shadow: "none" },
		raw: { light: "%SEL%{position:relative!important;overflow:hidden!important;border:0!important;background:#FFFFFF!important}%SEL%::after{content:\"\";position:absolute;top:0;bottom:0;width:45%;left:-50%;pointer-events:none;filter:blur(1px);background:linear-gradient(90deg,transparent 0%,rgba(217,89,38,.38) 22%,rgba(143,182,232,.45) 50%,rgba(199,155,224,.38) 78%,transparent 100%)}", dark: "%SEL%{position:relative!important;overflow:hidden!important;border:0!important;background:#1B1B1D!important}%SEL%::after{content:\"\";position:absolute;top:0;bottom:0;width:45%;left:-50%;pointer-events:none;filter:blur(1px);background:linear-gradient(90deg,transparent 0%,rgba(235,104,52,.42) 22%,rgba(110,160,230,.48) 50%,rgba(170,130,220,.42) 78%,transparent 100%)}" },
		anim: "@keyframes skc-scan{0%{left:-45%}100%{left:105%}}%SEL%::after{animation:skc-scan 3.2s ease-in-out infinite}" },
	// ---- 动态：氛围飘落 ----
	{ id: "snow", cat: "dynamic", name: "飘雪", hint: "逐粒子随机飘雪，疏密自然",
		light: { bgColor: "#FFFFFF", bgSize: "180px 180px", bgImage: "radial-gradient(2px 2px at 20% 30%, rgba(150,175,205,.5), transparent),radial-gradient(2px 2px at 70% 60%, rgba(150,175,205,.4), transparent),radial-gradient(2px 2px at 45% 85%, rgba(150,175,205,.45), transparent)" },
		dark: { bgColor: "#1B1B1D", bgSize: "180px 180px", bgImage: "radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,.55), transparent),radial-gradient(2px 2px at 70% 60%, rgba(255,255,255,.45), transparent),radial-gradient(2px 2px at 45% 85%, rgba(255,255,255,.5), transparent)" },
		css: function () {
			return FX_BASE_CSS("var(--dsw-alias-bg-layer-1,#FFFFFF)") +
				"body[data-ds-dark-theme] [data-composer-card]{background:var(--dsw-alias-bg-layer-1,#1B1B1D)!important}" +
				".skc-fx-snow .skc-fx-item{background:radial-gradient(circle,rgba(255,255,255,.95),rgba(255,255,255,0) 70%)}" +
				"body:not([data-ds-dark-theme]) .skc-fx-snow .skc-fx-item{background:radial-gradient(circle,rgba(150,175,205,.9),rgba(150,175,205,0) 70%)}" +
				"@media (prefers-reduced-motion: no-preference){" + FX_FALL_KEYFRAMES +
				".skc-fx-snow .skc-fx-item{animation:skc-fallUp var(--dur,10s) linear var(--delay,0s) infinite}}";
		} },
	{ id: "petal", cat: "dynamic", name: "桃花飘落", hint: "逐粒子随机飘落，远近错落",
		light: { bgColor: "#FFFFFF", bgSize: "160px 160px", bgImage: "radial-gradient(3px 3px at 25% 35%, rgba(245,168,196,.55), transparent),radial-gradient(3px 3px at 65% 70%, rgba(245,168,196,.45), transparent)" },
		dark: { bgColor: "#1B1B1D", bgSize: "160px 160px", bgImage: "radial-gradient(3px 3px at 25% 35%, rgba(245,168,196,.5), transparent),radial-gradient(3px 3px at 65% 70%, rgba(245,168,196,.4), transparent)" },
		css: function () {
			return FX_BASE_CSS("var(--dsw-alias-bg-layer-1,#FFFFFF)") +
				"body[data-ds-dark-theme] [data-composer-card]{background:var(--dsw-alias-bg-layer-1,#1B1B1D)!important}" +
				".skc-fx-petal .skc-fx-item{background-image:" + PETAL_SHAPE + "}" +
				"@media (prefers-reduced-motion: no-preference){" + FX_FALL_KEYFRAMES +
				".skc-fx-petal .skc-fx-item{animation:skc-fallUp var(--dur,10s) linear var(--delay,0s) infinite}}";
		} },
	{ id: "maple", cat: "dynamic", name: "枫叶飘落", hint: "逐粒子随机飘落，旋转翻飞",
		light: { bgColor: "#FFFFFF", bgSize: "170px 170px", bgImage: "radial-gradient(3px 3px at 30% 40%, rgba(217,105,31,.5), transparent),radial-gradient(3px 3px at 72% 65%, rgba(217,105,31,.4), transparent)" },
		dark: { bgColor: "#1B1B1D", bgSize: "170px 170px", bgImage: "radial-gradient(3px 3px at 30% 40%, rgba(217,105,31,.45), transparent),radial-gradient(3px 3px at 72% 65%, rgba(217,105,31,.35), transparent)" },
		css: function () {
			return FX_BASE_CSS("var(--dsw-alias-bg-layer-1,#FFFFFF)") +
				"body[data-ds-dark-theme] [data-composer-card]{background:var(--dsw-alias-bg-layer-1,#1B1B1D)!important}" +
				".skc-fx-maple .skc-fx-item{background-image:" + MAPLE_SHAPE + "}" +
				"@media (prefers-reduced-motion: no-preference){" + FX_FALL_KEYFRAMES +
				".skc-fx-maple .skc-fx-item{animation:skc-fallUp var(--dur,10s) linear var(--delay,0s) infinite}}";
		} },
	{ id: "rain", cat: "dynamic", name: "细雨", hint: "逐粒子随机雨丝，长短快慢不一",
		light: { bgColor: "#FFFFFF", bgSize: "180px 180px", bgImage: "none" },
		dark: { bgColor: "#1B1B1D", bgSize: "180px 180px", bgImage: "none" },
		css: function () {
			return FX_BASE_CSS("var(--dsw-alias-bg-layer-1,#FFFFFF)") +
				"body[data-ds-dark-theme] [data-composer-card]{background:var(--dsw-alias-bg-layer-1,#1B1B1D)!important}" +
				".skc-fx-rain .skc-fx-item{width:1px;height:var(--len,14px);border-radius:1px;" +
				"background:linear-gradient(180deg,rgba(150,180,215,0),rgba(150,180,215,.8))}" +
				"body[data-ds-dark-theme] .skc-fx-rain .skc-fx-item{background:linear-gradient(180deg,rgba(200,220,245,0),rgba(200,220,245,.7))}" +
				"@media (prefers-reduced-motion: no-preference){" +
				"@keyframes skc-rainFall{0%{transform:translate3d(0,-20%,0) rotate(var(--rot,3deg));opacity:0}" +
				"8%{opacity:var(--op,.3)}" +
				"100%{transform:translate3d(var(--drift,0px),140%,0) rotate(var(--rot,3deg));opacity:0}}" +
				".skc-fx-rain .skc-fx-item{animation:skc-rainFall var(--dur,1.6s) linear var(--delay,0s) infinite}}";
		} },	// ---- 动态：改结构的（不只是换色） ----
	{ id: "chamfer", cat: "dynamic", name: "斜切硬朗", hint: "左上/右下斜切角，0 圆角，硬朗工业感",
		light: { bg: "linear-gradient(135deg,#FFFFFF,#F5F5F2)", border: "0", radius: 0, shadow: "none" },
		dark: { bg: "linear-gradient(135deg,#1D1D1F,#17171A)", border: "0", radius: 0, shadow: "none" },
		pvStyle: { borderRadius: "0", clipPath: "polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%,0 14px)" },
		css: function () {
			var sel = "[data-composer-card]";
			var b = "var(--dsw-alias-brand-primary)";
			return sel + "{position:relative!important;border:0!important;border-radius:0!important;padding:12px 16px!important;" +
				"background:linear-gradient(135deg,var(--dsw-alias-bg-layer-1),color-mix(in srgb," + b + " 8%,var(--dsw-alias-bg-layer-1)))!important;" +
				"clip-path:polygon(16px 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%,0 16px)!important}" +
				sel + "::after{content:\"\";position:absolute;left:0;top:0;width:34px;height:3px;pointer-events:none;" +
				"background:" + b + ";opacity:.85}";
		} },
	{ id: "bracket", cat: "dynamic", name: "四角取景框", hint: "无底色，只有四个角标，像相机取景框",
		light: { bg: "transparent", border: "0", radius: 0, shadow: "none" },
		dark: { bg: "transparent", border: "0", radius: 0, shadow: "none" },
		pvStyle: { backgroundColor: "transparent", border: "0", borderRadius: "0" },
		css: function () {
			var sel = "[data-composer-card]";
			var c = "color-mix(in srgb,var(--dsw-alias-brand-primary) 72%,transparent)";
			var L = "linear-gradient(" + c + "," + c + ")";
			return sel + "{position:relative!important;border:0!important;border-radius:0!important;background:transparent!important;padding:12px 18px!important}" +
				sel + "::before{content:\"\";position:absolute;inset:0;pointer-events:none;" +
				"background:" +
				L + " left top/18px 1.5px no-repeat," + L + " left top/1.5px 18px no-repeat," +
				L + " right top/18px 1.5px no-repeat," + L + " right top/1.5px 18px no-repeat," +
				L + " left bottom/18px 1.5px no-repeat," + L + " left bottom/1.5px 18px no-repeat," +
				L + " right bottom/18px 1.5px no-repeat," + L + " right bottom/1.5px 18px no-repeat}";
		} },
	{ id: "bloom", cat: "dynamic", name: "右下光晕", hint: "底色 + 主图案集中在右下角",
		light: { bg: "var(--dsw-alias-bg-layer-1)", border: "0", radius: 18, shadow: "none" },
		dark: { bg: "var(--dsw-alias-bg-layer-1)", border: "0", radius: 18, shadow: "none" },
		pvStyle: {
			borderRadius: "14px",
			backgroundImage: "radial-gradient(120% 120% at 100% 100%, color-mix(in srgb, var(--dsw-alias-brand-primary) 34%, transparent), transparent 62%)," +
				"repeating-linear-gradient(45deg, color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent) 0 2px, transparent 2px 8px)"
		},
		css: function () {
			var sel = "[data-composer-card]";
			var b = "var(--dsw-alias-brand-primary)";
			var mask = "radial-gradient(130% 130% at 100% 100%,#000 0 40%,transparent 76%)";
			return sel + "{position:relative!important;border:0!important;border-radius:18px!important;overflow:hidden!important;" +
				"background:var(--dsw-alias-bg-layer-1)!important}" +
				sel + "::before{content:\"\";position:absolute;inset:0;pointer-events:none;z-index:0;" +
				"background:" +
				"radial-gradient(120% 120% at 100% 100%,color-mix(in srgb," + b + " 32%,transparent),transparent 60%)," +
				"radial-gradient(64% 64% at 100% 100%,color-mix(in srgb," + b + " 18%,transparent),transparent 72%)," +
				"repeating-linear-gradient(45deg,color-mix(in srgb," + b + " 11%,transparent) 0 2px,transparent 2px 9px);" +
				"mask-image:" + mask + ";-webkit-mask-image:" + mask + "}" +
				sel + ">*{position:relative!important;z-index:1!important}";
		} },
	{ id: "edge", cat: "dynamic", name: "锋利描边", hint: "0 圆角 + 左侧厚色条 + 右侧斜纹块",
		light: { bg: "#FFFFFF", border: "0", radius: 0, shadow: "none" },
		dark: { bg: "#1B1B1D", border: "0", radius: 0, shadow: "none" },
		pvStyle: { borderRadius: "0", borderLeft: "3px solid var(--dsw-alias-brand-primary)" },
		css: function () {
			var sel = "[data-composer-card]";
			var b = "var(--dsw-alias-brand-primary)";
			return sel + "{position:relative!important;border:0!important;border-radius:0!important;padding:12px 44px 12px 20px!important;overflow:hidden!important;" +
				"background:linear-gradient(180deg,color-mix(in srgb," + b + " 8%,var(--dsw-alias-bg-layer-1)),var(--dsw-alias-bg-layer-1))!important;" +
				"box-shadow:inset 4px 0 0 0 " + b + "!important}" +
				sel + "::before{content:\"\";position:absolute;right:0;top:0;bottom:0;width:30px;pointer-events:none;z-index:0;" +
				"background:repeating-linear-gradient(135deg," + b + " 0 3px,transparent 3px 9px);opacity:.14}" +
				sel + ">*{position:relative!important;z-index:1!important}";
		} },
	{ id: "image", cat: "custom", name: "自定义图片", hint: "上传图片，裁切后自动加蒙版", image: true }
];
			// 动态风格的 keyframes：只定义一次，深浅色共用
			var COMPOSER_KEYFRAMES =
				"@keyframes skc-flow{0%{background-position:0% 50%}100%{background-position:300% 50%}}" +
				"@keyframes skc-glow{0%,100%{box-shadow:0 0 0 0 rgba(217,89,38,0),0 4px 14px rgba(0,0,0,.06)}" +
				"50%{box-shadow:0 0 0 3px rgba(217,89,38,.20),0 6px 22px rgba(217,89,38,.16)}}" +
				"@keyframes skc-aurora{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}" +
				"@keyframes skc-scan{0%{left:-45%}100%{left:105%}}" +
				"@keyframes skc-caret{0%,100%{caret-color:inherit}50%{caret-color:transparent}}";
			// 输入框大致长宽比：宿主 composer 宽度约 680–800px、高度约 110–130px。
			// 裁切框按这个比例，保证贴上去不变形。

			// ---------------------------------------------------------------------------
			// 顶栏（conversation.session.header）视觉风格
			//
			// 宿主真实结构（已核对 app.asar）：
			//   <header data-window-drag="true">            ← 顶栏容器，grid，min-height:76px
			//     <div data-conversation-header-leading>    ← 左侧
			//     <div titleRow>                            ← 标题行
			//       <nav aria-label=...>                    ← 会话标题（crumb）
			//       <div headerActions>                     ← 智能体团队 / 标准模式
			//       <div headerUtilities>                   ← session id 徽标
			//     <div data-conversation-header-corner>     ← 右侧角落
			//     <div data-conversation-tabs role=tablist> ← 对话/轨迹/上下文…
			//   </header>
			//
			// 只用 data-* 与语义属性定位，不用哈希类名（an3WzG_xxx 会随构建变化）。
			// ---------------------------------------------------------------------------
			var Q = "\"";   // 双引号，用于拼选择器
			var DQ = Q;           // 同上，图片 url 拼接用
			var HDR_SEL = "header[data-window-drag]";
			var HDR_TABS = HDR_SEL + " [data-conversation-tabs]";
			var HDR_TAB = HDR_TABS + " button[role=" + Q + "tab" + Q + "]";
			var HDR_TAB_ON = HDR_TAB + "[aria-selected=" + Q + "true" + Q + "]";

			// 星点贴图：用固定种子的伪随机在方形 tile 里撒点，多层不同尺寸叠起来才不会重复成网格。
			var headerStarTile = function (size, count, rgb, minO, maxO, seed) {
				var s = seed || 1;
				var rnd = function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
				var dots = "";
				for (var i = 0; i < count; i++) {
					var x = (rnd() * size).toFixed(1);
					var y = (rnd() * size).toFixed(1);
					var r = (0.5 + rnd() * 0.9).toFixed(2);
					var o = (minO + rnd() * (maxO - minO)).toFixed(2);
					dots += "<circle cx=\"" + x + "\" cy=\"" + y + "\" r=\"" + r + "\" fill=\"rgba(" + rgb + "," + o + ")\"/>";
				}
				var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + size + "\" height=\"" + size + "\">" + dots + "</svg>";
				return "url(\"data:image/svg+xml," + encodeURIComponent(svg) + "\")";
			};
			var STARS_DARK_A = headerStarTile(180, 22, "255,255,255", 0.28, 0.82, 7);
			var STARS_DARK_B = headerStarTile(240, 12, "205,222,255", 0.16, 0.5, 19);
			var STARS_LIGHT_A = headerStarTile(180, 22, "32,58,104", 0.16, 0.46, 11);
			var STARS_LIGHT_B = headerStarTile(240, 12, "44,74,124", 0.1, 0.3, 23);

			var HEADER_STYLES = [
				// ---- 静态 ----
				{
					id: "plain", cat: "static", name: "极简", hint: "压到 48px，去掉底边",
					css: function () {
						return HDR_SEL + "{min-height:48px!important;padding:4px 20px 0 14px!important}" +
							HDR_TABS + "{margin-top:2px!important;gap:8px 16px!important}" +
							HDR_TAB + "{font-size:13px!important}";
					}
				},
				{
					id: "brandbar", cat: "static", name: "品牌横幅", hint: "顶部品牌色粗条 + 淡品牌底",
					css: function () {
						return HDR_SEL + "{box-shadow:inset 0 3px 0 var(--dsw-alias-brand-primary)!important;" +
							"background:color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, transparent)!important;" +
							"border-bottom:1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, transparent)!important;" +
							"padding-top:13px!important}";
					}
				},
				{
					id: "darkbar", cat: "static", name: "深色顶栏", hint: "深底白字，对比强烈",
					css: function () {
						return HDR_SEL + "{background:#1B1B1D!important;border-bottom:1px solid rgba(255,255,255,.12)!important}" +
							HDR_SEL + " nav," + HDR_SEL + " nav *{" + "color:#EDEDEA!important}" +
							HDR_SEL + " [data-conversation-header-leading] *{color:#B9B9B5!important}" +
							HDR_TAB + "{color:#9A9A96!important}" +
							HDR_TAB_ON + "{color:#EB6834!important}" +
							HDR_TAB_ON + " *{color:#EB6834!important}";
					}
				},
				{
					id: "card", cat: "static", name: "浮动卡片", hint: "内缩成圆角卡片，浮起来",
					css: function () {
						return HDR_SEL + "{margin:10px 14px 0!important;min-height:64px!important;padding:8px 18px 0!important;" +
							"border-radius:14px!important;border:1px solid var(--dsw-alias-border-l2)!important;" +
							"background:var(--dsw-alias-bg-layer-1)!important;" +
							"box-shadow:0 6px 20px rgba(0,0,0,.07)!important}";
					}
				},
				{
					id: "grid", cat: "static", name: "网格纸", hint: "细网格纹理背景",
					css: function () {
						return HDR_SEL + "{background-image:" +
							"linear-gradient(var(--dsw-alias-border-l1) 1px,transparent 1px)," +
							"linear-gradient(90deg,var(--dsw-alias-border-l1) 1px,transparent 1px)!important;" +
							"background-size:16px 16px!important;" +
							"border-bottom:1px solid var(--dsw-alias-border-l2)!important}";
					}
				},
				{
					id: "accentleft", cat: "static", name: "左侧竖条", hint: "左侧 4px 品牌竖线",
					css: function () {
						return HDR_SEL + "{border-left:4px solid var(--dsw-alias-brand-primary)!important;" +
							"padding-left:16px!important}";
					}
				},
				// ---- 动态：克制叠加，只画在内容背后，不动底色、不动文字渲染 ----
				{
					id: "aurora2", cat: "dynamic", name: "极光", hint: "底部一抹品牌色柔光缓慢漂移",
					// 预览快照：静态但能看出"底部三团柔光"
					pv: {
						backgroundImage: "radial-gradient(55% 130% at 18% 125%, color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, transparent), transparent 70%)," +
							"radial-gradient(50% 120% at 58% 132%, rgba(87,199,217,.32), transparent 72%)," +
							"radial-gradient(45% 110% at 88% 126%, rgba(156,139,240,.26), transparent 74%)"
					},
					css: function () {
						return HDR_SEL + "{position:relative!important;overflow:hidden!important;isolation:isolate!important}" +
							HDR_SEL + "::before{content:\"\";position:absolute;inset:-35% -8%;z-index:0;pointer-events:none;filter:blur(22px);opacity:.26;" +
							"background:" +
							"radial-gradient(46% 85% at 20% 118%,color-mix(in srgb,var(--dsw-alias-brand-primary) 60%,transparent),transparent 72%)," +
							"radial-gradient(42% 78% at 60% 126%,color-mix(in srgb,#57C7D9 44%,transparent),transparent 74%)," +
							"radial-gradient(36% 70% at 88% 116%,color-mix(in srgb,#9C8BF0 34%,transparent),transparent 76%)}" +
							"body[data-ds-dark-theme] " + HDR_SEL + "::before{opacity:.22}" +
							HDR_SEL + ">*{position:relative!important;z-index:1!important}" +
							"@media (prefers-reduced-motion: no-preference){" +
							"@keyframes skc-auroraDrift{0%,100%{transform:translate3d(-2.5%,0,0)}50%{transform:translate3d(2.5%,2.5%,0)}}" +
							HDR_SEL + "::before{animation:skc-auroraDrift 34s ease-in-out infinite}}";
					}
				},
				{
					id: "holo", cat: "dynamic", name: "全息虹彩", hint: "一道低温虹彩非常缓慢地扫过",
					pv: {
						backgroundImage: "linear-gradient(102deg, transparent 14%, rgba(96,206,255,.26) 34%, rgba(160,142,255,.24) 50%, rgba(255,150,200,.20) 66%, transparent 86%)"
					},
					css: function () {
						return HDR_SEL + "{position:relative!important;overflow:hidden!important;isolation:isolate!important}" +
							HDR_SEL + "::after{content:\"\";position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.9;" +
							"background:linear-gradient(102deg,transparent 16%,rgba(96,206,255,.15) 33%,rgba(160,142,255,.14) 50%,rgba(255,150,200,.12) 67%,transparent 86%);" +
							"background-size:240% 100%}" +
							"body[data-ds-dark-theme] " + HDR_SEL + "::after{opacity:.62}" +
							HDR_SEL + ">*{position:relative!important;z-index:1!important}" +
							"@media (prefers-reduced-motion: no-preference){" +
							"@keyframes skc-holoSweep{0%{background-position:-40% 50%}100%{background-position:280% 50%}}" +
							HDR_SEL + "::after{animation:skc-holoSweep 26s linear infinite}}";
					}
				},
				{
					id: "blueprint", cat: "dynamic", name: "蓝图", hint: "细网格 + 一道极慢的扫描光",
					pv: {
						backgroundImage: "linear-gradient(var(--dsw-alias-border-l1) 1px, transparent 1px), linear-gradient(90deg, var(--dsw-alias-border-l1) 1px, transparent 1px)",
						backgroundSize: "8px 8px",
						borderBottom: "1px dashed color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, transparent)"
					},
					css: function () {
						return HDR_SEL + "{position:relative!important;overflow:hidden!important;isolation:isolate!important;" +
							"background-image:linear-gradient(var(--dsw-alias-border-l1) 1px,transparent 1px),linear-gradient(90deg,var(--dsw-alias-border-l1) 1px,transparent 1px)!important;" +
							"background-size:18px 18px!important;" +
							"border-bottom:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 26%,var(--dsw-alias-border-l2))!important}" +
							HDR_SEL + " nav," + HDR_SEL + " nav *{letter-spacing:.04em!important}" +
							HDR_SEL + "::before{content:\"\";position:absolute;top:0;bottom:0;width:26%;z-index:0;pointer-events:none;transform:translateX(-140%);" +
							"background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent),transparent)}" +
							HDR_SEL + ">*{position:relative!important;z-index:1!important}" +
							"@media (prefers-reduced-motion: no-preference){" +
							"@keyframes skc-bpScan{0%{transform:translateX(-140%)}100%{transform:translateX(430%)}}" +
							HDR_SEL + "::before{animation:skc-bpScan 26s linear infinite}}";
					}
				},
				{
					id: "neon", cat: "dynamic", name: "霓虹赛博", hint: "深靛底 + 青/品红辉光 + 扫描线，底边霓虹流光",
					pv: {
						backgroundColor: "#12142A",
						backgroundImage: "radial-gradient(60% 150% at 6% 0%, rgba(125,249,255,.30), transparent 68%)," +
							"radial-gradient(55% 150% at 94% 10%, rgba(255,42,134,.26), transparent 70%)," +
							"repeating-linear-gradient(180deg, rgba(255,255,255,.05) 0 1px, transparent 1px 3px)",
						borderBottom: "2px solid rgba(125,249,255,.55)"
					},
					pvText: "light",
					css: function () {
						return HDR_SEL + "{position:relative!important;overflow:hidden!important;" +
							"background:linear-gradient(180deg,#141733 0%,#101226 55%,#150E22 100%)!important;" +
							"border-bottom:1px solid rgba(125,249,255,.22)!important;" +
							"box-shadow:inset 0 -20px 24px -22px rgba(125,249,255,.42),inset 0 -20px 24px -22px rgba(255,42,134,.3)!important}" +
							// 两端冷暖辉光 + 极淡扫描线：读起来"有霓虹"，而不是一块死黑
							HDR_SEL + "::before{content:\"\";position:absolute;inset:0;z-index:0;pointer-events:none;" +
							"background:" +
							"radial-gradient(46% 150% at 4% 0%,rgba(125,249,255,.22),transparent 66%)," +
							"radial-gradient(42% 150% at 82% 130%,rgba(255,42,134,.2),transparent 68%)," +
							"radial-gradient(38% 140% at 60% 0%,rgba(120,90,255,.16),transparent 70%)," +
							"repeating-linear-gradient(180deg,rgba(255,255,255,.05) 0 1px,transparent 1px 3px)}" +
							HDR_SEL + ">*{position:relative!important;z-index:1!important}" +
							HDR_SEL + " nav," + HDR_SEL + " nav *{color:#DCE8F7!important}" +
							HDR_SEL + " [data-conversation-header-leading] *{color:#8E9BBC!important}" +
							HDR_TAB + "{color:#8B96B8!important}" +
							HDR_TAB_ON + "{color:#FF6BB5!important;text-shadow:0 0 8px rgba(255,107,181,.45)!important}" +
							HDR_SEL + "::after{content:\"\";position:absolute;left:0;right:0;bottom:0;height:2px;pointer-events:none;opacity:.85;" +
							"background:linear-gradient(90deg,transparent 0%,#7DF9FF 22%,#FF2A86 50%,#7DF9FF 78%,transparent 100%);" +
							"background-size:220% 100%}" +
							"@media (prefers-reduced-motion: no-preference){" +
							"@keyframes skc-neonFlow{0%{background-position:0% 50%}100%{background-position:220% 50%}}" +
							HDR_SEL + "::after{animation:skc-neonFlow 14s linear infinite}}";
					}
				},
				{
					id: "liquid", cat: "dynamic", name: "液态金属", hint: "偶尔一道镜面高光斜掠而过",
					pv: {
						backgroundImage: "linear-gradient(104deg, transparent 28%, rgba(255,255,255,.55) 44%, transparent 60%)"
					},
					css: function () {
						return HDR_SEL + "{position:relative!important;overflow:hidden!important;isolation:isolate!important}" +
							HDR_SEL + "::before{content:\"\";position:absolute;top:-70%;bottom:-70%;left:-45%;width:40%;z-index:0;pointer-events:none;" +
							"transform:skewX(-16deg);filter:blur(12px);" +
							"background:linear-gradient(90deg,transparent,rgba(255,255,255,.34),transparent)}" +
							"body[data-ds-dark-theme] " + HDR_SEL + "::before{background:linear-gradient(90deg,transparent,rgba(255,255,255,.14),transparent)}" +
							HDR_SEL + ">*{position:relative!important;z-index:1!important}" +
							"@media (prefers-reduced-motion: no-preference){" +
							"@keyframes skc-liquidSweep{0%{left:-45%}52%,100%{left:118%}}" +
							HDR_SEL + "::before{animation:skc-liquidSweep 18s ease-in-out infinite}}";
					}
				},
				{
					id: "starfield", cat: "dynamic", name: "星轨", hint: "双层星点缓慢漂移，偶尔一颗流星",
					pv: {
						backgroundColor: "#0B1220",
						backgroundImage: "radial-gradient(1px 1px at 12% 34%, rgba(255,255,255,.85), transparent)," +
							"radial-gradient(1px 1px at 38% 66%, rgba(255,255,255,.6), transparent)," +
							"radial-gradient(1.4px 1.4px at 62% 28%, rgba(255,255,255,.7), transparent)," +
							"radial-gradient(1px 1px at 84% 72%, rgba(255,255,255,.5), transparent)",
						borderBottom: "0"
					},
					pvText: "light",
					css: function () {
						return HDR_SEL + "{position:relative!important;overflow:hidden!important;isolation:isolate!important;" +
							"background:linear-gradient(180deg,#F3F7FD,#E8EFF9)!important;" +
							"background-image:" + STARS_LIGHT_A + "," + STARS_LIGHT_B + "!important;" +
							"background-size:180px 180px,240px 240px!important;background-repeat:repeat!important;" +
							"border-bottom:1px solid rgba(40,70,120,.14)!important}" +
							"body[data-ds-dark-theme] " + HDR_SEL + "{background:linear-gradient(180deg,#0B1220,#080D16)!important;" +
							"background-image:" + STARS_DARK_A + "," + STARS_DARK_B + "!important;" +
							"border-bottom:1px solid rgba(140,170,220,.18)!important}" +
							HDR_SEL + " nav," + HDR_SEL + " nav *{color:#24406B!important}" +
							"body[data-ds-dark-theme] " + HDR_SEL + " nav,body[data-ds-dark-theme] " + HDR_SEL + " nav *{color:#DEE9F7!important}" +
							HDR_SEL + " [data-conversation-header-leading] *{color:#6B7C96!important}" +
							"body[data-ds-dark-theme] " + HDR_SEL + " [data-conversation-header-leading] *{color:#8494AC!important}" +
							HDR_TAB + "{color:#5E7796!important}" +
							"body[data-ds-dark-theme] " + HDR_TAB + "{color:#93A3BE!important}" +
							HDR_TAB_ON + "{color:#1F5FA8!important}" +
							"body[data-ds-dark-theme] " + HDR_TAB_ON + "{color:#FFD479!important}" +
							HDR_SEL + ">*{position:relative!important;z-index:1!important}" +
							HDR_SEL + "::after{content:\"\";position:absolute;top:-6%;height:1.5px;width:74px;left:-24%;z-index:0;pointer-events:none;opacity:0;" +
							"transform:rotate(11deg);filter:blur(1px);background:linear-gradient(90deg,transparent,rgba(60,90,140,.55))}" +
							"body[data-ds-dark-theme] " + HDR_SEL + "::after{background:linear-gradient(90deg,transparent,rgba(255,255,255,.7))}" +
							"@media (prefers-reduced-motion: no-preference){" +
							"@keyframes skc-starDrift{0%{background-position:0 0,0 0}100%{background-position:0 720px,0 720px}}" +
							"@keyframes skc-meteor{0%,86%{left:-24%;opacity:0}88%{opacity:.55}97%,100%{left:112%;opacity:0}}" +
							HDR_SEL + "{animation:skc-starDrift 130s linear infinite}" +
							HDR_SEL + "::after{animation:skc-meteor 24s linear infinite}}";
					}
				},
				// ---- 自定义 ----
				{
					id: "image", cat: "custom", name: "自定义图片", hint: "上传图片，裁切后自动加蒙版",
					image: true
				}
			];
			var HEADER_RATIO = 16;   // 顶栏大致长宽比（宽 ~1200px / 高 ~76px）
			var headerStyleById = function (id) {
				for (var i = 0; i < HEADER_STYLES.length; i++) if (HEADER_STYLES[i].id === id) return HEADER_STYLES[i];
				return null;
			};
			// 自定义图片的顶栏 CSS：图片打底 + 黑色蒙版保证文字可读
			var headerImageCss = function (dataUrl, maskPct) {
				if (!dataUrl) return "";
				var a = Math.max(0, Math.min(100, Number(maskPct) || 0)) / 100;
				var scrim = "rgba(0,0,0," + a.toFixed(2) + ")";
				var css = HDR_SEL + "{background-image:linear-gradient(" + scrim + "," + scrim + "),url(" + DQ + dataUrl + DQ + ")!important;" +
					"background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;" +
					"border-bottom:0!important}";
				if (a >= 0.35) {
					css += HDR_SEL + " nav," + HDR_SEL + " nav *{color:#FFFFFF!important}" +
						HDR_TAB + "{color:rgba(255,255,255,.72)!important}" +
						HDR_TAB_ON + "{color:#FFFFFF!important}";
				}
				return css;
			};
			var applyHeader = function (id) {
				state.header = id;
				drop("header");
				var st = headerStyleById(id);
				if (st && st.image) {
					if (state.headerImg) layer.header = insertCss(headerImageCss(state.headerImg, state.headerMask));
				} else if (st) {
					layer.header = insertCss(st.css());
				}
				savePrefs();
			};
			var refreshHeaderImage = function () {
				drop("header");
				if (state.header === "image" && state.headerImg) {
					layer.header = insertCss(headerImageCss(state.headerImg, state.headerMask));
				}
			};
			// ---------------- 文本消息框（用户消息 / AI 消息分开设计） ----------------
			// 锚点用宿主自己的语义属性，不依赖构建哈希：
			//   [data-chat-flow-kind="user"]       用户消息行
			//   [data-chat-flow-kind="assistant"]  AI 消息行
			// 用户气泡落在 [class*="_userStack"]（右侧、限宽）；AI 侧是整行，用作"整行回复区"。
			var MSG_U = '[data-chat-flow-kind="user"]';
			var MSG_A = '[data-chat-flow-kind="assistant"]';
			// 用户气泡在宿主里是 primitives 的 [data-message-bubble]；_userStack 是外层容器（含附件、引用摘要），
// 刷在外层会和气泡自带的背景叠成"双层框"，所以直接改气泡本体。
var MSG_BUBBLE = '[data-message-bubble]';
// 气泡本身自带的背景/边框/内边距一律让位给插件，避免残留内层块。
var MSG_RESET = MSG_BUBBLE + "{background-color:transparent!important;background-image:none!important;border:0!important;box-shadow:none!important}";
			var MSG_STYLES = [
				{ id: "bubble", name: "柔和气泡", hint: "用户右侧圆角气泡，AI 浅色整行" },
				{ id: "card", name: "卡片分层", hint: "用户白卡片带阴影，AI 左侧品牌竖线" },
				{ id: "glass", name: "磨砂玻璃", hint: "双方半透明 + 背景模糊" },
				{ id: "terminal", name: "终端对照", hint: "用户等宽深块，AI 等宽浅底 + 竖线" },
				{ id: "outline", name: "描边极简", hint: "双方透明底 + 细描边，最轻" },
				{ id: "tint", name: "品牌染色", hint: "用户品牌色淡底，AI 中性淡底" }
			];
			var msgStyleById = function (id) {
				for (var i = 0; i < MSG_STYLES.length; i++) if (MSG_STYLES[i].id === id) return MSG_STYLES[i];
				return null;
			};
			var BR = "var(--dsw-alias-brand-primary)";
			var L1 = "var(--dsw-alias-bg-layer-1)";
			var B1 = "var(--dsw-alias-border-l1)";
			var B2 = "var(--dsw-alias-border-l2)";
			var msgCssFor = function (id) {
				if (!id) return "";
				if (id === "bubble") {
					return MSG_RESET + MSG_BUBBLE + "{border-radius:18px!important;padding:10px 14px!important;" +
						"background:color-mix(in srgb," + BR + " 11%," + L1 + ")!important;" +
						"border:1px solid color-mix(in srgb," + BR + " 22%,transparent)!important}" +
						MSG_A + "{border-radius:16px!important;padding:10px 14px!important;margin:2px 0!important;" +
						"background:" + L1 + "!important;border:1px solid " + B1 + "!important}";
				}
				if (id === "card") {
					return MSG_RESET + MSG_BUBBLE + "{border-radius:14px!important;padding:12px 16px!important;" +
						"background:" + L1 + "!important;border:1px solid " + B2 + "!important;" +
						"box-shadow:0 4px 16px rgba(0,0,0,.06)!important}" +
						MSG_A + "{position:relative!important;padding:8px 14px 8px 16px!important;margin:2px 0!important}" +
						MSG_A + "::before{content:\"\";position:absolute;left:2px;top:8px;bottom:8px;width:2px;border-radius:2px;" +
						"background:color-mix(in srgb," + BR + " 55%,transparent)}";
				}
				if (id === "glass") {
					return MSG_RESET + MSG_BUBBLE + "{border-radius:18px!important;padding:10px 14px!important;" +
						"background:color-mix(in srgb," + L1 + " 55%,transparent)!important;" +
						"border:1px solid color-mix(in srgb," + B2 + " 70%,transparent)!important;" +
						"backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important}" +
						MSG_A + "{border-radius:16px!important;padding:10px 14px!important;margin:2px 0!important;" +
						"background:color-mix(in srgb," + L1 + " 40%,transparent)!important;" +
						"border:1px solid color-mix(in srgb," + B2 + " 55%,transparent)!important;" +
						"backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important}";
				}
				if (id === "terminal") {
					return MSG_RESET + MSG_BUBBLE + "{border-radius:6px!important;padding:10px 13px!important;" +
						"background:color-mix(in srgb,#1B1B1D 92%,transparent)!important;" +
						"border:1px solid rgba(255,255,255,.14)!important}" +
						MSG_BUBBLE + "," + MSG_BUBBLE + " *{color:#EDEDEA!important;font-family:var(--dsw-font-mono,Consolas,monospace)!important}" +
						MSG_A + "{border-radius:6px!important;padding:10px 13px!important;margin:2px 0!important;" +
						"background:color-mix(in srgb," + L1 + " 75%,transparent)!important;" +
						"border:1px solid " + B2 + "!important;border-left:3px solid " + BR + "!important}";
				}
				if (id === "outline") {
					return MSG_RESET + MSG_BUBBLE + "{border-radius:14px!important;padding:9px 13px!important;" +
						"background:transparent!important;border:1px solid " + B2 + "!important}" +
						MSG_A + "{border-radius:14px!important;padding:9px 13px!important;margin:2px 0!important;" +
						"background:transparent!important;border:1px solid " + B1 + "!important}";
				}
				if (id === "tint") {
					return MSG_RESET + MSG_BUBBLE + "{border-radius:16px!important;padding:10px 14px!important;" +
						"background:color-mix(in srgb," + BR + " 8%," + L1 + ")!important;border:0!important}" +
						MSG_A + "{border-radius:16px!important;padding:10px 14px!important;margin:2px 0!important;" +
						"background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 70%," + L1 + ")!important;border:0!important}";
				}
				return "";
			};
			var applyMsgStyle = function (id) {
				state.msgStyle = id;
				drop("msg");
				if (id) layer.msg = insertCss(msgCssFor(id));
				savePrefs();
			};

			var COMPOSER_RATIO = 6;
			var composerStyleById = function (id) {
				for (var i = 0; i < COMPOSER_STYLES.length; i++) if (COMPOSER_STYLES[i].id === id) return COMPOSER_STYLES[i];
				return null;
			};
			// 由规格生成真实 CSS。用 body[data-ds-dark-theme] 切深色，与宿主一致。
			var composerCssFor = function (st) {
				if (!st) return "";
				// 需要按用户配置生成 CSS 的风格（流光/光晕/光标类）
				if (typeof st.css === "function") return st.css();
				var DARK = "body[data-ds-dark-theme] ";
				// 动态风格：用 %SEL% 占位替换，动画规则单独包在"允许动态"的媒体查询里
				if (st.raw) {
					var sub = function (tpl, prefix) { return String(tpl).split("%SEL%").join(prefix + "[data-composer-card]"); };
					var css = sub(st.raw.light, "");
					if (st.raw.dark) css += sub(st.raw.dark, DARK);
					var anim = "";
					if (st.anim) {
						anim = "@media (prefers-reduced-motion: no-preference){" +
							sub(st.anim, "") + sub(st.anim, DARK) +
							String(COMPOSER_KEYFRAMES).split("%SEL%").join("[data-composer-card]") + "}";
					}
					return css + anim;
				}
				var build = function (m, prefix) {
					var sel = prefix + "[data-composer-card]";
					var css = sel + "{background:" + m.bg + "!important;border:" + m.border + "!important;" +
						"border-radius:" + m.radius + "px!important;box-shadow:" + m.shadow + "!important";
					if (m.blur) css += "backdrop-filter:" + m.blur + "!important;-webkit-backdrop-filter:" + m.blur + "!important";
					css += "}";
					css += sel + " [class*=\"_input\"]{font-family:" +
						(m.mono ? "var(--dsw-font-mono,Consolas,monospace)" : "inherit") + "!important}";
					return css;
				};
				return build(st.light, "") + build(st.dark, DARK);
			};
			// 自定义图片的 CSS：图片打底 + 半透明黑色蒙版保证文字可读。
			// 蒙版强度 state.composerMask（0–100），直接换算成 rgba 的 alpha。
			var composerImageCss = function (dataUrl, maskPct) {
				if (!dataUrl) return "";
				var a = Math.max(0, Math.min(100, Number(maskPct) || 0)) / 100;
				var scrim = "rgba(0,0,0," + a.toFixed(2) + ")";
				var sel = "[data-composer-card]";
				// 蒙版足够深时文字转白，否则保持主题色
				var lightText = a >= 0.35;
				var css = sel + "{background-image:linear-gradient(" + scrim + "," + scrim + "),url(\"" + dataUrl + "\")!important;" +
					"background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;" +
					"border:1px solid rgba(255,255,255,.18)!important;border-radius:16px!important;" +
					"box-shadow:0 8px 26px rgba(0,0,0,.18)!important}";
				if (lightText) {
					css += sel + " [class*=\"_input\"]," + sel + " [class*=\"_input\"] *{color:#FFFFFF!important}" +
						sel + " [class*=\"_placeholder\"]{color:rgba(255,255,255,.72)!important}";
				}
				return css;
			};
			// ---------------- 光标特效引擎（光标律动 / 光标辐射） ----------------
			// 原生 caret 的样式改不了动画（caret-color 会被 !important 静态声明压住），
			// 所以改成"测量光标位置 + 在光标处画一层光效"。
			var caretFx = { card: null, layer: null, dot: null, ring: null, mirror: null };
			var removeCaretFx = function () {
				if (caretFx.layer && caretFx.layer.parentNode) { try { caretFx.layer.parentNode.removeChild(caretFx.layer); } catch (e) {} }
				caretFx = { card: null, layer: null, dot: null, ring: null, mirror: null };
			};
			var ensureCaretFx = function (card) {
				if (!card || !card.appendChild) return null;
				if (caretFx.card === card && caretFx.layer && caretFx.layer.parentNode) return caretFx.layer;
				removeCaretFx();
				var layerEl = document.createElement("div");
				layerEl.className = "skc-caretfx";
				var dot = document.createElement("div");
				dot.className = "skc-caretfx-dot";
				var ring = document.createElement("div");
				ring.className = "skc-caretfx-ring";
				layerEl.appendChild(dot);
				layerEl.appendChild(ring);
				card.appendChild(layerEl);
				caretFx = { card: card, layer: layerEl, dot: dot, ring: ring, mirror: null };
				return layerEl;
			};
			// 返回光标相对输入框卡片的坐标。contenteditable 用 Range 矩形；textarea 用镜像元素测量折行后的位置。
			var measureCaret = function (el, card) {
				try {
					var box = card.getBoundingClientRect ? card.getBoundingClientRect() : { left: 0, top: 0 };
					if (el.isContentEditable === true) {
						var sel = typeof window !== "undefined" && window.getSelection ? window.getSelection() : null;
						if (sel && sel.rangeCount) {
							var range = sel.getRangeAt(0).cloneRange();
							range.collapse(true);
							var rects = range.getClientRects ? range.getClientRects() : null;
							var rr = rects && rects.length ? rects[0] : range.getBoundingClientRect();
							if (rr && (rr.left || rr.top)) return { x: rr.left - box.left, y: rr.top - box.top + (rr.height || 16) * 0.55 };
						}
					}
					if (typeof el.selectionStart === "number") {
						var cs = typeof window !== "undefined" && window.getComputedStyle ? window.getComputedStyle(el) : null;
						var ir = el.getBoundingClientRect ? el.getBoundingClientRect() : { left: 0, top: 0 };
						var offX = ir.left - box.left;
						var offY = ir.top - box.top;
						var mir = caretFx.mirror;
						if (!mir) {
							mir = document.createElement("div");
							mir.setAttribute("aria-hidden", "true");
							caretFx.mirror = mir;
						}
						if (mir.parentNode) mir.parentNode.removeChild(mir);
						// 镜像元素贴在输入框自身的位置上，这样 span 的 offsetLeft/Top 就是相对卡片的坐标
						mir.style.cssText = "position:absolute;visibility:hidden;white-space:pre-wrap;word-wrap:break-word;overflow:hidden;" +
							"pointer-events:none;z-index:-1;left:" + offX + "px;top:" + offY + "px;" +
							(cs
								? ("font:" + cs.font + ";padding:" + cs.padding + ";border:" + cs.border + ";letter-spacing:" + cs.letterSpacing +
									";line-height:" + cs.lineHeight + ";text-transform:" + cs.textTransform + ";box-sizing:border-box;width:" +
									(el.clientWidth || 200) + "px;")
								: "font:14px/1.6 system-ui;padding:8px;box-sizing:border-box;width:200px;");
						mir.textContent = String(el.value || "").slice(0, el.selectionStart);
						var span = document.createElement("span");
						span.textContent = "\u200b";
						mir.appendChild(span);
						card.appendChild(mir);
						var spanX = span.offsetLeft - (el.scrollLeft || 0);
						var spanY = span.offsetTop - (el.scrollTop || 0);
						var lh = cs && parseFloat(cs.lineHeight) ? parseFloat(cs.lineHeight) : 20;
						if (mir.parentNode) mir.parentNode.removeChild(mir);
						if (isFinite(spanX) && isFinite(spanY)) return { x: offX + spanX, y: offY + spanY + lh * 0.55 };
					}
				} catch (e) {}
				return null;
			};
			var caretStyleOn = function () { return state.composer === "caret" || state.composer === "caretradiate"; };
			var refreshCaretFx = function () {
				hideCaretRing();
				if (!caretStyleOn()) { removeCaretFx(); return; }
				if (typeof document === "undefined" || !document.querySelector) return;
				var card = document.querySelector("[data-composer-card]");
				if (!card) { removeCaretFx(); return; }
				ensureCaretFx(card);
			};
			var applyCaretPoint = function (layerEl, pt) {
				layerEl.style.setProperty("--skc-cx", Math.round(pt.x) + "px");
				layerEl.style.setProperty("--skc-cy", Math.round(pt.y) + "px");
			};
			var caretRingTimer = null;
			var hideCaretRing = function () {
				if (caretRingTimer) { clearTimeout(caretRingTimer); caretRingTimer = null; }
				if (caretFx.ring && caretFx.ring.classList) caretFx.ring.classList.remove("on");
			};
			var pulseRadiate = function () {
				var ring = caretFx.ring;
				if (!ring || !ring.classList) return;
				ring.classList.remove("on");
				// 强制重排，保证每次都重新播放动画
				void ring.offsetWidth;
				ring.classList.add("on");
				// 动画一结束就收掉，避免"没输入了光环还在"
				if (caretRingTimer) clearTimeout(caretRingTimer);
				caretRingTimer = setTimeout(hideCaretRing, 950);
			};
			var onCaretInput = function (e) {
				if (!caretStyleOn()) return;
				var t = e && e.target;
				if (!t || !t.closest || !t.closest("[data-composer-card]")) return;
				var card = t.closest("[data-composer-card]");
				var value = typeof t.value === "string" ? t.value : (t.textContent || "");
				var hasText = String(value).trim().length > 0;
				var layerEl = ensureCaretFx(card);
				if (!layerEl) return;
				var pt = measureCaret(t, card);
				if (pt) applyCaretPoint(layerEl, pt);
				if (state.composer === "caretradiate") {
					if (caretFx.dot && caretFx.dot.classList) caretFx.dot.classList.remove("on");
					if (hasText) pulseRadiate();
					else hideCaretRing();
				} else if (caretFx.dot && caretFx.dot.classList) {
					if (hasText) caretFx.dot.classList.add("on");
					else caretFx.dot.classList.remove("on");
				}
			};
			var onCaretFocus = function (e) {
				if (!caretStyleOn()) return;
				var t = e && e.target;
				if (!t || !t.closest || !t.closest("[data-composer-card]")) return;
				var card = t.closest("[data-composer-card]");
				var layerEl = ensureCaretFx(card);
				if (!layerEl) return;
				var pt = measureCaret(t, card);
				if (pt) applyCaretPoint(layerEl, pt);
				if (state.composer === "caret" && caretFx.dot && caretFx.dot.classList) caretFx.dot.classList.add("on");
			};
			var onCaretBlur = function (e) {
				var t = e && e.target;
				if (t && t.closest && t.closest("[data-composer-card]")) {
					if (caretFx.dot && caretFx.dot.classList) caretFx.dot.classList.remove("on");
					hideCaretRing();
				}
			};
			var bindCaretEvents = function () {
				if (typeof document === "undefined" || !document.addEventListener) return;
				document.addEventListener("input", onCaretInput, true);
				document.addEventListener("focusin", onCaretFocus, true);
				document.addEventListener("focusout", onCaretBlur, true);
			};
			var unbindCaretEvents = function () {
				if (typeof document === "undefined" || !document.removeEventListener) return;
				document.removeEventListener("input", onCaretInput, true);
				document.removeEventListener("focusin", onCaretFocus, true);
				document.removeEventListener("focusout", onCaretBlur, true);
			};

			var applyComposer = function (id) {
				state.composer = id;
				drop("composer");
				var st = composerStyleById(id);
				if (st && st.image) {
					if (state.composerImg) layer.composer = insertCss(composerImageCss(state.composerImg, state.composerMask));
				} else if (st) {
					layer.composer = insertCss(composerCssFor(st));
				}
				savePrefs();
				refreshCaretFx();
				refreshFxSoon();
			};
			// 重新渲染自定义图片层（换图或调蒙版时用）
			var refreshComposerImage = function () {
				drop("composer");
				if (state.composer === "image" && state.composerImg) {
					layer.composer = insertCss(composerImageCss(state.composerImg, state.composerMask));
				}
			};
			var main = ["#4D6BFE", "#2F5AF3", "#14B8A6", "#10B981", "#F97316", "#F43F5E", "#8B5CF6", "#EC4899", "#F59E0B", "#6366F1"];
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

			// 用 CSS 直写主色时，必须同时给出深色分支，
			// 否则 !important 的 :root 规则会把深色模式也刷成浅色值。
			// 宿主深色主题的标记是 body[data-ds-dark-theme]。
			var rootCssFor = function (v) {
				var keys = ["--dsw-alias-brand-primary", "--dsw-alias-brand-text", "--dsw-alias-button-primary-fill",
					"--dsw-alias-button-primary-hover", "--dsw-alias-button-info-fill", "--dsw-alias-button-info-hover",
					"--dsw-alias-state-business-primary", "--dsw-specific-sidebar-nav-item-active-accent"];
				var light = "", dark = "";
				for (var i = 0; i < keys.length; i++) {
					light += keys[i] + ":" + v + "!important;";
					dark += keys[i] + ":" + darkOf(v, keys[i]) + "!important;";
				}
				return ":root{" + light + "}" + "body[data-ds-dark-theme]{" + dark + "}";
			};

			var applyColor = function (v) {
				state.preset = null; state.main = v;
				["--dsw-alias-brand-primary", "--dsw-alias-brand-text", "--dsw-alias-button-primary-fill", "--dsw-alias-button-primary-hover", "--dsw-alias-button-info-fill", "--dsw-alias-button-info-hover", "--dsw-alias-state-business-primary", "--dsw-specific-sidebar-nav-item-active-accent"].forEach(function (k) { setTokens(k, v); });
				clearStyleLayers();
				applyTokens();
				layer.root = insertCss(rootCssFor(v));
				savePrefs();
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
				// 分组补丁（第 10/11/12/13 项），后写覆盖前面同名键
				[x[9], x[10], x[11], x[12]].forEach(function (grp) {
					if (!grp) return;
					for (var k in grp) if (Object.prototype.hasOwnProperty.call(grp, k)) setTokens(k, grp[k]);
				});
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

			// ---------------- 幻灯片交叉淡入 ----------------
			// 切换时不要重建 CSS 和图层（那样会闪），而是同一个图层里两张 <img> 交替淡入淡出。
			var SLIDE_FADE_MS = 900;
			var slideCssOn = false;
			var slideFx = { layer: null, a: null, b: null, front: "a" };
			var removeSlideFx = function () {
				if (slideFx.layer && slideFx.layer.parentNode) { try { slideFx.layer.parentNode.removeChild(slideFx.layer); } catch (e) {} }
				slideFx = { layer: null, a: null, b: null, front: "a" };
				slideCssOn = false;
			};
			var ensureSlideCss = function () {
				if (slideCssOn && layer.bg) return true;
				drop("bg");
				layer.bg = insertCss(revealCss() +
					"#dsh-simple-ui-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}" +
					"#dsh-simple-ui-bg>.skc-bg-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;" +
					"opacity:0;transition:opacity " + SLIDE_FADE_MS + "ms ease}" +
					"#dsh-simple-ui-bg>.skc-bg-img.skc-bg-on{opacity:1}");
				slideCssOn = true;
				return true;
			};
			var ensureSlideLayer = function () {
				if (slideFx.layer && slideFx.layer.parentNode) return slideFx.layer;
				if (typeof document === "undefined" || !document.body) return null;
				// 单图/视频层与幻灯片层用同一个 id，创建前必须先清掉旧的，否则页面上会有两个背景层
				removeMediaLayer();
				if (typeof document.querySelectorAll === "function") {
					var stale = document.querySelectorAll("#dsh-simple-ui-bg");
					if (stale) for (var si = stale.length - 1; si >= 0; si--) {
						var sn = stale[si];
						if (sn && sn.parentNode) { try { sn.parentNode.removeChild(sn); } catch (e) {} }
					}
				}
				var el = document.createElement("div");
				el.id = "dsh-simple-ui-bg";
				var a = document.createElement("img");
				a.alt = ""; a.className = "skc-bg-img";
				var b = document.createElement("img");
				b.alt = ""; b.className = "skc-bg-img";
				el.appendChild(a);
				el.appendChild(b);
				var first = document.body.firstChild || null;
				try { document.body.insertBefore(el, first); } catch (e) { document.body.appendChild(el); }
				slideFx.layer = el; slideFx.a = a; slideFx.b = b; slideFx.front = "a";
				return el;
			};
			// 淡入新图；prevUrl 在淡入完成后才回收，避免旧图在过渡中变成空白
			var crossfadeSlide = function (url, prevUrl) {
				if (!url) return;
				ensureSlideCss();
				if (!ensureSlideLayer()) return;
				var back = slideFx.front === "a" ? slideFx.b : slideFx.a;
				var front = slideFx.front === "a" ? slideFx.a : slideFx.b;
				var swapped = false;
				var doSwap = function () {
					if (swapped) return;
					swapped = true;
					try {
						back.classList.add("skc-bg-on");
						front.classList.remove("skc-bg-on");
					} catch (e) {}
					slideFx.front = slideFx.front === "a" ? "b" : "a";
					if (prevUrl && prevUrl !== url && typeof URL !== "undefined" && URL.revokeObjectURL) {
						setTimeout(function () { try { URL.revokeObjectURL(prevUrl); } catch (e) {} }, SLIDE_FADE_MS + 150);
					}
				};
				back.onload = doSwap;
				back.onerror = doSwap;
				back.src = url;
				if (back.complete) setTimeout(doSwap, 40);
				else setTimeout(doSwap, 1200); // 兜底：图太大/加载慢也要切过去
			};

			var applyBg = function (save) {
				// 幻灯片：只做交叉淡入，不动 CSS 与图层（重建会闪）
				if (state.slideOn && slides.length && state.bgUrl && state.bgOn !== false) {
					crossfadeSlide(state.bgUrl, null);
					if (save) savePrefs();
					notify();
					return;
				}
				removeSlideFx();
				slideCssOn = false;
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
				state.slideOn = false;
				stopSlides();
				setMedia(rec);
				idbPut("bg", rec).catch(function () {
					state.notice = "已生效，但浏览器没能保存（IndexedDB 不可用），刷新后会丢失。";
					notify();
				});
			};

			// ---------------- 幻灯片（文件夹轮播） ----------------
			// 浏览器拿不到真实文件夹路径，只能用 webkitdirectory 选目录、把文件内容存进 IndexedDB，
			// 顺序按文件名自然排序（1.jpg, 2.jpg, 10.jpg 而不是 1,10,2）。
			var SLIDE_MAX_FILES = 80;
			var SLIDE_MAX_BYTES = 200 * 1024 * 1024;
			var slides = [];
			var slideTimer = null;

			var stopSlides = function () {
				if (slideTimer) { try { clearInterval(slideTimer); } catch (e) {} slideTimer = null; }
			};

			var applySlideAt = function (i, save) {
				if (!slides.length) return;
				var n = slides.length;
				i = ((i % n) + n) % n;
				state.slideIndex = i;
				state.bgKind = "image";
				state.bgName = slides[i].name || "";
				var prev = state.bgUrl;
				try { state.bgUrl = URL.createObjectURL(slides[i].blob); } catch (e) { state.bgUrl = null; }
				if (state.bgOn !== false && state.bgUrl) {
					// 交叉淡入：旧图的 objectURL 等淡入结束再回收
					crossfadeSlide(state.bgUrl, prev);
					if (save) savePrefs();
					notify();
					return;
				}
				revokeUrl();
				applyBg(!!save);
			};

			var startSlides = function () {
				stopSlides();
				if (!state.slideOn || slides.length < 2 || state.bgOn === false) return;
				var sec = Math.max(3, Math.min(3600, Number(state.slideInterval) || 30));
				slideTimer = setInterval(function () {
					if (typeof document !== "undefined" && document.hidden) return;
					applySlideAt(state.slideIndex + 1, false);
				}, sec * 1000);
			};

			// 图片判定：优先看 MIME，MIME 为空（部分格式/系统不填）时按扩展名兜底。
			var IMG_EXT = /\.(jpe?g|jfif|png|apng|gif|webp|avif|bmp|svg)$/i;
			var VIDEO_EXT = /\.(mp4|m4v|webm|mov|ogv|avi|mkv)$/i;
			var isImageFile = function (f) {
				var t = String((f && f.type) || "");
				if (t) return /^image\//.test(t);
				return IMG_EXT.test(String((f && f.name) || ""));
			};
			var isVideoFile = function (f) {
				var t = String((f && f.type) || "");
				if (t) return /^video\//.test(t);
				return VIDEO_EXT.test(String((f && f.name) || ""));
			};
			// 关键：webkitdirectory 的 e.target.files 是一个「活的」FileList，
			// 一旦把 input.value 置空，里面的条目就会被清掉。所以必须先拷贝成真数组再清空输入框。
			var snapshotFiles = function (fileList) {
				var out = [];
				if (!fileList) return out;
				if (typeof fileList.length !== "number") return out;
				for (var i = 0; i < fileList.length; i++) {
					var f = fileList[i];
					if (f) out.push(f);
				}
				return out;
			};

			var onPickFolder = function (fileList) {
				var all = snapshotFiles(fileList);
				if (!all.length) {
					state.folderInfo = "读到 0 个文件";
					state.notice = "没有读到任何文件，换一个文件夹试试。";
					notify();
					return;
				}
				var images = [];
				var skippedVideo = 0;
				var skippedOther = [];
				for (var i = 0; i < all.length; i++) {
					var f = all[i];
					if (isImageFile(f)) images.push(f);
					else if (isVideoFile(f)) skippedVideo++;
					else if (skippedOther.length < 6) skippedOther.push(String(f.name || "").split(".").pop().toLowerCase());
				}
				state.folderInfo = "读到 " + all.length + " 个文件 · 识别 " + images.length + " 张图片" +
					(skippedVideo ? " · 视频 " + skippedVideo : "") +
					(skippedOther.length ? " · 跳过 " + skippedOther.join("/") : "");
				images.sort(function (a, b) {
					return String(a.name || "").localeCompare(String(b.name || ""), "zh-Hans-CN", { numeric: true, sensitivity: "base" });
				});
				var kept = [];
				var total = 0;
				for (var j = 0; j < images.length; j++) {
					if (kept.length >= SLIDE_MAX_FILES) break;
					if (total + images[j].size > SLIDE_MAX_BYTES) break;
					kept.push(images[j]);
					total += images[j].size;
				}
				if (!kept.length) {
					state.notice = "这个文件夹里没有识别到图片：共 " + all.length + " 个文件" +
						(skippedVideo ? "，视频 " + skippedVideo + " 个" : "") +
						(skippedOther.length ? "，其他类型 " + skippedOther.join("/") : "") + "。";
					notify();
					return;
				}
				var recs = kept.map(function (f) {
					return { blob: f, name: f.name || "", type: f.type || "" };
				});
				var dropped = images.length - kept.length;
				state.notice = "";
				slides = recs;
				state.slideCount = recs.length;
				state.slideOn = true;
				state.slideInterval = Math.max(3, Math.min(3600, Number(state.slideInterval) || 30));
				applySlideAt(0, true);
				startSlides();
				idbPut("slides", recs).then(function () {
					if (dropped > 0) {
						state.notice = "文件夹共 " + images.length + " 张图片，受容量限制只收录了前 " + kept.length + " 张。";
						notify();
					}
				}).catch(function () {
					state.notice = "轮播已生效，但浏览器没能保存这个文件夹（IndexedDB 不可用），刷新后会丢失。";
					notify();
				});
			};

			var clearSlides = function () {
				stopSlides();
				slides = [];
				state.slideCount = 0;
				state.slideIndex = 0;
				state.slideOn = false;
				state.slideName = "";
				state.notice = "";
				idbDel("slides");
				// 幻灯片清掉后回退到单张背景（如果还有）
				idbGet("bg").then(function (rec) {
					if (rec && rec.blob) {
						state.bgKind = rec.kind || "image";
						state.bgName = rec.name || "";
						revokeUrl();
						try { state.bgUrl = URL.createObjectURL(rec.blob); } catch (e) { state.bgUrl = null; }
						applyBg(true);
					} else {
						revokeUrl();
						state.bgKind = null;
						state.bgName = "";
						applyBg(true);
					}
				}).catch(function () {
					revokeUrl();
					state.bgKind = null;
					state.bgName = "";
					applyBg(true);
				});
			};

			var clearBackground = function () {
				stopSlides();
				slides = [];
				state.slideCount = 0; state.slideIndex = 0; state.slideOn = false; state.slideName = "";
				revokeUrl();
				state.bgKind = null; state.bgName = ""; state.bgOn = true; state.notice = "";
				removeMediaLayer();
				drop("bg");
				idbDel("bg");
				idbDel("slides");
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
					state.slideOn = false; state.slideInterval = 30; state.slideCount = 0; state.slideIndex = 0; state.slideName = "";
					stopSlides();
					unbindCaretEvents();
					removeSlideFx();
					removeFx();
					removeCaretFx();
					slides = [];
					Object.keys(tokens).forEach(function (k) { delete tokens[k]; });
					drop("tokens"); clearStyleLayers(); drop("font"); drop("bg"); drop("radius"); drop("msg");
					removeMediaLayer();
					removeSlideFx();
					idbDel("bg");
					idbDel("slides");
				} finally { quiet = false; }
				notify();
			};

					// ---------------- 顶栏自定义图片：上传 + 按顶栏比例裁切 ----------------
			var HDR_CROP_W = 620;
			var HDR_CROP_H = Math.round(HDR_CROP_W / HEADER_RATIO);
			var hCropGeom = function () {
				if (!state.hCropNat) return null;
				var W = HDR_CROP_W, H = HDR_CROP_H;
				var base = Math.max(W / state.hCropNat.w, H / state.hCropNat.h);
				var sc = base * (state.hCropZoom || 1);
				var dw = state.hCropNat.w * sc, dh = state.hCropNat.h * sc;
				return { W: W, H: H, dw: dw, dh: dh,
			x: (W - dw) / 2 + (state.hCropOx || 0),
			y: (H - dh) / 2 + (state.hCropOy || 0) };
			};
			var pickHeaderFile = function (file) {
				if (!file) return;
				if (file.size > MAX_MEDIA_BYTES) { state.notice = "图片超过 80MB，请换一张"; refresh(); return; }
				var reader = new FileReader();
				reader.onload = function () {
			var img = new Image();
			img.onload = function () {
				var MAXW = 2400, src = reader.result, w = img.naturalWidth, h = img.naturalHeight;
				if (w > MAXW) {
					try {
						var k = MAXW / w;
						var cv = document.createElement("canvas");
						cv.width = MAXW; cv.height = Math.round(h * k);
						var c2 = cv.getContext("2d");
						c2.drawImage(img, 0, 0, cv.width, cv.height);
						src = cv.toDataURL("image/jpeg", 0.9);
						w = cv.width; h = cv.height;
					} catch (e) {}
				}
				state.hCropSrc = src;
				state.hCropNat = { w: w, h: h };
				state.hCropZoom = 1; state.hCropOx = 0; state.hCropOy = 0;
				state.notice = "";
				refresh();
			};
			img.onerror = function () { state.notice = "图片读不出来，换个格式试试"; refresh(); };
			img.src = reader.result;
				};
				reader.readAsDataURL(file);
			};
			var updateHCropLive = function () {
				var g = hCropGeom();
				if (!g) return;
				var el = document.querySelector ? document.querySelector("[data-skc-hcrop] img") : null;
				if (!el || !el.style) return;
				el.style.width = g.dw + "px";
				el.style.height = g.dh + "px";
				el.style.left = g.x + "px";
				el.style.top = g.y + "px";
			};
			var startHCropDrag = function (e) {
				e.preventDefault();
				if (!state.hCropSrc) return;
				var sx = e.clientX, sy = e.clientY;
				var ox = state.hCropOx || 0, oy = state.hCropOy || 0;
				var g0 = hCropGeom();
				if (!g0) return;
				var baseX = (g0.W - g0.dw) / 2, baseY = (g0.H - g0.dh) / 2;
				var host = e.currentTarget;
				var imgEl = host && host.querySelector ? host.querySelector("img") : null;
				var move = function (ev) {
			var nx = ox + (ev.clientX - sx), ny = oy + (ev.clientY - sy);
			state.hCropOx = nx; state.hCropOy = ny;
			if (imgEl) {
				imgEl.style.left = (baseX + nx) + "px";
				imgEl.style.top = (baseY + ny) + "px";
			}
				};
				var up = function () {
			document.removeEventListener("mousemove", move);
			document.removeEventListener("mouseup", up);
			document.removeEventListener("blur", up);
			window.removeEventListener("blur", up);
			refresh();
				};
				document.addEventListener("mousemove", move);
				document.addEventListener("mouseup", up);
				document.addEventListener("blur", up);
				window.addEventListener("blur", up);
			};
			var applyHeaderCrop = function () {
				var g = hCropGeom();
				if (!g || !state.hCropSrc) return;
				var OUT_W = 1600, k = OUT_W / g.W, OUT_H = Math.round(g.H * k);
				var cv = document.createElement("canvas");
				cv.width = OUT_W; cv.height = OUT_H;
				var c2 = cv.getContext("2d");
				if (!c2) return;
				var img = new Image();
				img.onload = function () {
			try {
				c2.drawImage(img, g.x * k, g.y * k, g.dw * k, g.dh * k);
				var dataUrl = cv.toDataURL("image/jpeg", 0.86);
				state.headerImg = dataUrl;
				state.header = "image";
				idbPut("headerImg", { dataUrl: dataUrl }).catch(function () {});
				refreshHeaderImage();
				savePrefs();
				state.notice = "已应用，蒙版强度可再调";
				refresh();
			} catch (err) { state.notice = "生成失败：" + (err && err.message); refresh(); }
				};
				img.onerror = function () { state.notice = "图片解码失败"; refresh(); };
				img.src = state.hCropSrc;
			};
			var updateHeaderMaskLive = function () {
				refreshHeaderImage();
				var a = (state.headerMask / 100).toFixed(2);
				var mk = document.querySelector ? document.querySelector("[data-skc-hmask]") : null;
				if (mk && mk.style) mk.style.opacity = a;
				var lbl = document.querySelector ? document.querySelector("[data-skc-hmaskval]") : null;
				if (lbl) lbl.textContent = state.headerMask + "%";
				var pv = document.querySelector ? document.querySelector("[data-skc-hprev]") : null;
				if (pv && pv.style && state.headerImg) {
			pv.style.backgroundImage = "linear-gradient(rgba(0,0,0," + a + "),rgba(0,0,0," + a + ")),url(" + DQ + state.headerImg + DQ + ")";
				}
			};

			var restore = function () {
				quiet = true;
				var migratedRemoved = false;
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
						state.composer = typeof data.composer === "string" ? data.composer : null;
					if (typeof data.msgStyle === "string" || data.msgStyle === null) state.msgStyle = data.msgStyle;
						state.header = typeof data.header === "string" ? data.header : null;
						state.headerTab = (data.headerTab === "dynamic" || data.headerTab === "custom") ? data.headerTab : "static";
						state.headerMask = typeof data.headerMask === "number" ? Math.max(0, Math.min(100, data.headerMask)) : 45;
						state.composerTab = (data.composerTab === "dynamic" || data.composerTab === "custom") ? data.composerTab : "static";
						state.composerMask = typeof data.composerMask === "number" ? Math.max(0, Math.min(100, data.composerMask)) : 45;
					if (Array.isArray(data.flowColors) && data.flowColors.length === 3) {
						state.flowColors = data.flowColors.map(function (c) { return typeof c === "string" && /^#[0-9a-fA-F]{6}$/.test(c) ? c : "#D95926"; });
					}
					if (typeof data.glowColor === "string" && /^#[0-9a-fA-F]{6}$/.test(data.glowColor)) state.glowColor = data.glowColor;
					if (typeof data.caretColor === "string" && /^#[0-9a-fA-F]{6}$/.test(data.caretColor)) state.caretColor = data.caretColor;
						state.cn = typeof data.cn === "string" ? data.cn : null;
						state.en = typeof data.en === "string" ? data.en : null;
						state.radius = typeof data.radius === "number" ? data.radius : 100;
						state.scrim = typeof data.scrim === "number" ? data.scrim : 40;
						state.panel = typeof data.panel === "number" ? data.panel : 70;
						state.scrimTone = typeof data.scrimTone === "string" ? data.scrimTone : "auto";
						state.slideOn = data.slideOn === true;
						state.slideInterval = typeof data.slideInterval === "number" ? Math.max(3, Math.min(3600, data.slideInterval)) : 30;
						state.slideCount = typeof data.slideCount === "number" ? data.slideCount : 0;
						state.bgOn = data.bgOn !== false;
						state.bgKind = data.bgKind || null;
						state.bgName = data.bgName || "";
						Object.keys(tokens).forEach(function (k) { delete tokens[k]; });
						if (data.tokens && typeof data.tokens === "object") {
							Object.keys(data.tokens).forEach(function (k) { if (typeof data.tokens[k] === "string") tokens[k] = data.tokens[k]; });
						}
					}
					clearStyleLayers();
					// 「辅助色」已从配色面板移除：清掉存档里遗留的该 token，
					// 否则旧用户会保留一个再也无法修改或关闭的底色。
					// 注意 applyAccent 当年写的是 --dsw-specific-sidebar-nav-item-active，
					// 与 brand/button 主色链路无关，删除后回落到 [CC] / 主机默认。
					if (state.accent) {
						delete tokens["--dsw-specific-sidebar-nav-item-active"];
						state.accent = null;
						migratedRemoved = true;
					}
					// 已移除的预设（deep / neon）：回退到默认 [CC]。
					// 若不处理，presetById 返回 null，存档里的旧 token 会继续生效，
					// 界面上看不到任何预设被选中，但颜色仍是那个被删掉的预设。
					if (state.preset && !presetById(state.preset)) {
						if (state.preset === "deep" || state.preset === "neon") {
							migratedRemoved = true;
							state.preset = "claude";
							state.main = null; state.accent = null; state.neutral = null; state.label = null;
							var fb = presetById("claude");
							Object.keys(tokens).forEach(function (k) { delete tokens[k]; });
							if (fb) {
								setTokens("--dsw-alias-bg-base", fb[2]);
								setTokens("--dsw-alias-bg-layer-1", fb[3]);
								setTokens("--dsw-alias-bg-layer-2", fb[2]);
								setTokens("--dsw-alias-label-primary", fb[4]);
								setTokens("--dsw-alias-label-secondary", fb[4]);
								setTokens("--dsw-alias-brand-primary", fb[5]);
								setTokens("--dsw-specific-sidebar-fill", fb[3]);
								[fb[9], fb[10], fb[11], fb[12]].forEach(function (grp) {
									if (!grp) return;
									for (var fk in grp) if (Object.prototype.hasOwnProperty.call(grp, fk)) tokens[fk] = grp[fk];
								});
							}
						} else {
							// 其它未知 id：仅清空标记，保留用户已有 token
							state.preset = null;
						}
					}
					// 迁移/校正：预设自带的 token 以「预设定义」为准，覆盖存档里的旧值。
					// 原因：用户改主色/辅助色/中性色/文字色时 state.preset 会被置空，
					// 所以只要 preset 还在，说明这些分组 token 没被用户单独定制过，
					// 它们应当跟随插件版本更新。否则旧存档里的过期色值会一直生效。
					// 兼容：必须同时兼容「已装过旧版、存档里没有这些键」的情况。
					var pMig = presetById(state.preset);
					if (pMig) {
						var groups = [pMig[9], pMig[10], pMig[11], pMig[12]];
						for (var gj = 0; gj < groups.length; gj++) {
							var g2 = groups[gj];
							if (!g2) continue;
							for (var mk2 in g2) {
								if (Object.prototype.hasOwnProperty.call(g2, mk2)) tokens[mk2] = g2[mk2];
							}
						}
					}
					applyTokens();
					var p = presetById(state.preset);
					if (p && p[8]) layer.style = insertCss(p[8]);
					if (state.main) layer.root = insertCss(rootCssFor(state.main));
					if (state.cn || state.en) applyFont(state.cn, state.en);
					applyRadius(state.radius);
					// 顶栏视觉风格
					if (state.header) {
						var hst = headerStyleById(state.header);
						if (hst && hst.image) {
							idbGet("headerImg").then(function (rec) {
								if (!rec || typeof rec.dataUrl !== "string") return;
								state.headerImg = rec.dataUrl;
								refreshHeaderImage();
							}).catch(function () {});
						} else if (hst) {
							layer.header = insertCss(hst.css());
						}
					}
			// 输入框视觉风格（纯外观层，与配色/预设互不干扰）
					// 文本消息框风格
          if (state.msgStyle) layer.msg = insertCss(msgCssFor(state.msgStyle));
          if (state.composer) {
						var cst = composerStyleById(state.composer);
						if (cst && cst.image) {
							// 自定义图片存 IndexedDB（dataURL，体积可控且 CSS 里可直接用）
							idbGet("composerImg").then(function (rec) {
								if (!rec || typeof rec.dataUrl !== "string") return;
								state.composerImg = rec.dataUrl;
								refreshComposerImage();
							}).catch(function () {});
						} else if (cst) {
							layer.composer = insertCss(composerCssFor(cst));
						}
					}
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
					// 幻灯片优先于单张背景：有幻灯片且开着轮播就直接从第一张开始。
					idbGet("slides").then(function (recs) {
						if (!Array.isArray(recs) || !recs.length) return;
						slides = recs;
						state.slideCount = recs.length;
						if (!state.slideOn) return;
						applySlideAt(0, false);
						startSlides();
					}).catch(function () {});
					// 若发生了「已移除预设」的回退，restore 期间 quiet=true 会跳存档写入，
					// 这里补一次持久化，避免下次重载又走一遍回退路径。
					if (migratedRemoved) { quiet = false; savePrefs(); quiet = true; }
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
				// 防失控闸门：正常交互不会超过 60 次/秒；
			// 一旦某处逻辑写错导致自激，这里会直接丢弃多余的重渲染，避免整个界面卡死。
			var _rfWin = 0, _rfCount = 0;
			var refresh = function () {
				var now = Date.now();
				if (now - _rfWin > 1000) { _rfWin = now; _rfCount = 0; }
				_rfCount++;
				if (_rfCount > 60) return;
				rev[1](function (x) { return x + 1; });
			};
				React.useEffect(function () { rerender = refresh; return function () { if (rerender === refresh) rerender = null; }; });

				var tab = state.tab;
				var setTab = function (t) { state.tab = t; savePrefs(); refresh(); };

				var firstPicker = function (value, title, fn) {
					return React.createElement("label", { key: title, className: "skc-first-picker", title: title, style: { background: value || "linear-gradient(135deg,#ffd900,#ff7a00,#3ee6e0,#8b5cf6)" } },
						React.createElement("input", { type: "color", "aria-label": title, value: value || "#ffffff", onChange: function (e) { fn(e.target.value); } }));
				};

				// 分段控件里的图标：纯 stroke 线性图标，跟随文字颜色，浅深色都不用另配。
				var TAB_ICONS = {
					style: [["path", { d: "M12 3a9 9 0 0 0 0 18h1.3a2.2 2.2 0 0 0 0-4.4h-1.9a2.6 2.6 0 0 1 0-5.2H16A5 5 0 0 0 21 6.4 9 9 0 0 0 12 3Z" }], ["circle", { cx: 8.7, cy: 9.4, r: 1 }], ["circle", { cx: 8.2, cy: 13.8, r: 1 }]],
					header: [["rect", { x: 3, y: 4, width: 18, height: 6, rx: 2 }], ["path", { d: "M3 14h18M3 18h11" }]],
					composer: [["rect", { x: 3, y: 8, width: 18, height: 8, rx: 4 }], ["path", { d: "M7 12h5" }]],
					bg: [["rect", { x: 3, y: 5, width: 18, height: 14, rx: 2 }], ["circle", { cx: 8.5, cy: 10, r: 1.4 }], ["path", { d: "m5.5 16.5 4-4 2.5 2.5 3-3 4 4.5" }]],
					color: [["path", { d: "M12 3.5c3.2 3.6 5.5 6.6 5.5 9.3A5.5 5.5 0 0 1 6.5 12.8c0-2.7 2.3-5.7 5.5-9.3Z" }]],
					font: [["path", { d: "M5 19 10.2 5h3.6L19 19" }], ["path", { d: "M7.6 14.5h8.8" }]],
					msg: [["path", { d: "M4 5h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H10l-4.5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" }]]
				};
				var tabIcon = function (id) {
					var glyph = TAB_ICONS[id];
					if (!glyph || !React.createElement) return null;
					return React.createElement("svg", {
						viewBox: "0 0 24 24", width: 15, height: 15, fill: "none", stroke: "currentColor",
						strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
						"aria-hidden": "true", focusable: "false", key: "ico"
					}, glyph.map(function (g, i) {
						return React.createElement(g[0], Object.assign({ key: "g" + i }, g[1]));
					}));
				};

				var tabs = React.createElement("div", { className: "skc-tabs", role: "tablist", key: "tabs" },
					[["style", "样式"], ["header", "顶栏"], ["composer", "输入框"], ["msg", "消息框"], ["bg", "背景"], ["color", "配色"], ["font", "字体"]].map(function (p) {
						return React.createElement("button", {
							key: p[0], type: "button", role: "tab", className: "skc-tab" + (tab === p[0] ? " skc-on" : ""),
							"data-tab": p[0], "aria-selected": tab === p[0] ? "true" : "false", onClick: function () { setTab(p[0]); }
						}, [tabIcon(p[0]), React.createElement("span", { className: "skc-tab-label", key: "lb" }, p[1])]);
					}));

				// 输入框预览：用与真实样式同一份规格渲染，保证"所见即所得"。
				// 预览里的文字/按钮是假的，只验证视觉；真实输入框的样式由 composerCssFor 生成。
				var composerPreview = function (st) {
					// 自定义图片：预览用已裁好的图；还没图就显示占位
					if (st.image) {
						var imgStyle = state.composerImg
							? { backgroundImage: "linear-gradient(rgba(0,0,0," + (state.composerMask / 100).toFixed(2) + "),rgba(0,0,0," + (state.composerMask / 100).toFixed(2) + ")),url(\"" + state.composerImg + "\")" }
							: { background: "var(--dsw-alias-bg-layer-2)" };
						var cardStyleImg = Object.assign({
							border: "1px solid rgba(255,255,255,.18)", borderRadius: "16px",
							boxShadow: "0 8px 26px rgba(0,0,0,.18)", backgroundSize: "cover",
							backgroundPosition: "center", padding: "12px 14px", width: "100%",
							boxSizing: "border-box", display: "flex", flexDirection: "column",
							gap: "10px", minHeight: "76px"
						}, imgStyle);
						var txtImg = { fontSize: "13px", lineHeight: "1.6", flex: "1",
							color: state.composerImg && state.composerMask >= 35 ? "#fff" : "var(--dsw-alias-label-caption)" };
						return React.createElement("div", { className: "skc-cprev-card", "data-skc-cprev-img": "1", style: cardStyleImg }, [
							React.createElement("div", { key: "t", style: txtImg }, state.composerImg ? "描述任务或提问…" : "上传图片后可预览"),
							React.createElement("div", { key: "r", className: "skc-cprev-row" }, [
								React.createElement("span", { key: "s", className: "skc-cprev-send", style: { borderRadius: "50%" } }, "↑")
							])
						]);
					}
					var m = hostIsDark() ? st.dark : st.light;
					var cardStyle = {
						border: m.border, borderRadius: m.radius + "px", boxShadow: m.shadow,
						padding: "12px 14px", width: "100%", boxSizing: "border-box",
						display: "flex", flexDirection: "column", gap: "10px", minHeight: "76px"
					};
					// 粒子类风格：底色 + 纹理背景（预览也能看到飘落纹理）
					if (m.bgImage) {
						cardStyle.backgroundColor = m.bgColor || "#FFFFFF";
						cardStyle.backgroundImage = m.bgImage;
						cardStyle.backgroundSize = m.bgSize || "140px 140px";
						cardStyle.backgroundRepeat = "repeat";
					} else {
						cardStyle.background = m.bg;
					}
					// 预览只用轻量模糊：真 composer 用 18px，但设置页里多张卡同时 backdrop-filter 会拖垮渲染
					if (m.blur) { cardStyle.backdropFilter = "blur(6px)"; cardStyle.WebkitBackdropFilter = "blur(6px)"; }
					// 结构类样式（切角/取景框/右下图案/厚边条）在预览里也要能看出来
					if (st.pvStyle) { for (var pvk in st.pvStyle) { if (Object.prototype.hasOwnProperty.call(st.pvStyle, pvk)) cardStyle[pvk] = st.pvStyle[pvk]; } }
					// 可配色风格：预览也反映当前选的颜色，免得"设置页看不出来"
					var hexA = function (h, a) {
						var rgb = hexToRgb(h) || [217, 89, 38];
						return "rgba(" + rgb.join(",") + "," + a + ")";
					};
					if (st.id === "flow") {
						var fc = state.flowColors || ["#D95926", "#8FB6E8", "#C79BE0"];
						cardStyle.border = "1.5px solid " + fc[0];
						cardStyle.backgroundImage = "linear-gradient(90deg," + fc.map(function (c) { return hexA(c, 0.14); }).join(",") + ")";
					} else if (st.id === "glow") {
						cardStyle.boxShadow = "0 0 0 3px " + hexA(state.glowColor, 0.26);
					} else if (st.id === "caret" || st.id === "caretradiate") {
						cardStyle.boxShadow = "inset 0 0 20px -4px " + hexA(state.caretColor, 0.6);
					}
					var textStyle = {
						fontSize: "13px", lineHeight: "1.6",
						color: "var(--dsw-alias-label-caption)",
						fontFamily: m.mono ? "var(--dsw-font-mono,Consolas,monospace)" : "inherit",
						flex: "1"
					};
					var chip = function (label, key) {
						return React.createElement("span", {
							key: key, className: "skc-cprev-chip"
						}, label);
					};
					var card = React.createElement("div", { className: "skc-cprev-card", style: cardStyle }, [
						React.createElement("div", { key: "t", style: textStyle }, "描述任务或提问…"),
						React.createElement("div", { key: "r", className: "skc-cprev-row" }, [
							chip("＋", "a"), chip("完全权限", "b"), chip("DeepSeek-V4.1", "c"),
							React.createElement("span", {
								key: "s", className: "skc-cprev-send",
								style: { borderRadius: m.radius >= 16 ? "50%" : "6px" }
							}, "↑")
						])
					]);
					// 玻璃拟态需要"背后有东西"才看得出模糊，垫一层彩色渐变演示
					if (st.id === "glass") {
						return React.createElement("div", {
							style: { position: "relative", borderRadius: "12px", padding: "10px",
								background: "linear-gradient(120deg,#F2A66B,#8FB6E8,#C79BE0)" }
						}, card);
					}
					return card;
				};

				// ---------------- 自定义图片：上传 + 按输入框比例裁切 ----------------
				var CROP_W = 520;                       // 预览宽度（px）
				var CROP_H = Math.round(CROP_W / COMPOSER_RATIO);
				var cropGeom = function () {
					if (!state.cropNat) return null;
					var W = CROP_W, H = CROP_H;
					// cover：保证图片铺满裁切框
					var base = Math.max(W / state.cropNat.w, H / state.cropNat.h);
					var s = base * (state.cropZoom || 1);
					var dw = state.cropNat.w * s, dh = state.cropNat.h * s;
					return { W: W, H: H, dw: dw, dh: dh,
						x: (W - dw) / 2 + (state.cropOx || 0),
						y: (H - dh) / 2 + (state.cropOy || 0) };
				};
				var pickCropFile = function (file) {
					if (!file) return;
					if (file.size > MAX_MEDIA_BYTES) { state.notice = "图片超过 80MB，请换一张"; refresh(); return; }
					var reader = new FileReader();
					reader.onload = function () {
						var img = new Image();
						img.onload = function () {
							// 超大图先降采样到 2400px 以内再进 state：
							// 原图 dataURL 动辄十几 MB，塞进 React state 会让每次重渲染都变慢。
							var MAXW = 2400;
							var src = reader.result, w = img.naturalWidth, h = img.naturalHeight;
							if (w > MAXW) {
								try {
									var k = MAXW / w;
									var cv = document.createElement("canvas");
									cv.width = MAXW; cv.height = Math.round(h * k);
									var c2 = cv.getContext("2d");
									c2.drawImage(img, 0, 0, cv.width, cv.height);
									src = cv.toDataURL("image/jpeg", 0.9);
									w = cv.width; h = cv.height;
								} catch (e) { /* 降采样失败就用原图 */ }
							}
							state.cropSrc = src;
							state.cropNat = { w: w, h: h };
							state.cropZoom = 1; state.cropOx = 0; state.cropOy = 0;
							state.notice = "";
							refresh();
						};
						img.onerror = function () { state.notice = "图片读不出来，换个格式试试"; refresh(); };
						img.src = reader.result;
					};
					reader.readAsDataURL(file);
				};
				// 蒙版强度变化时：真实输入框 CSS + 裁切预览蒙版 + 预览卡 + 百分比文字，
				// 全部直接改 DOM，不整页重渲染（拖动才不卡）。
				var updateMaskLive = function () {
					refreshComposerImage();
					var a = (state.composerMask / 100).toFixed(2);
					var mk = document.querySelector ? document.querySelector("[data-skc-cropmask]") : null;
					if (mk && mk.style) mk.style.opacity = a;
					var lbl = document.querySelector ? document.querySelector("[data-skc-maskval]") : null;
					if (lbl) lbl.textContent = state.composerMask + "%";
					// 最终效果预览区（图 + 蒙版），以及文字颜色阈值
					var pv = document.querySelector ? document.querySelector("[data-skc-liveprev]") : null;
					if (pv && pv.style && state.composerImg) {
						pv.style.backgroundImage = "linear-gradient(rgba(0,0,0," + a + "),rgba(0,0,0," + a + ")),url(\"" + state.composerImg + "\")";
					}
					var pt = document.querySelector ? document.querySelector("[data-skc-liveprev-text]") : null;
					if (pt && pt.style) pt.style.color = state.composerMask >= 35 ? "#FFFFFF" : "var(--dsw-alias-label-caption)";
				};
				// 缩放时只更新裁切预览图的位置与尺寸，不触发整页重渲染
				var updateCropLive = function () {
					var g = cropGeom();
					if (!g) return;
					var el = document.querySelector ? document.querySelector(".skc-crop img") : null;
					if (!el || !el.style) return;
					el.style.width = g.dw + "px";
					el.style.height = g.dh + "px";
					el.style.left = g.x + "px";
					el.style.top = g.y + "px";
				};
				var startCropDrag = function (e) {
					e.preventDefault();
					if (!state.cropSrc) return;
					var sx = e.clientX, sy = e.clientY;
					var ox = state.cropOx || 0, oy = state.cropOy || 0;
					var g0 = cropGeom();
					if (!g0) return;
					var baseX = (g0.W - g0.dw) / 2, baseY = (g0.H - g0.dh) / 2;
					var host = e.currentTarget;
					var imgEl = host && host.querySelector ? host.querySelector("img") : null;
					// 关键：拖拽期间只改 DOM 的 transform，不调用 refresh()。
					// 之前每帧 refresh 会重渲染整页（含 8 张预览卡），直接卡死。
					var move = function (ev) {
						var nx = ox + (ev.clientX - sx), ny = oy + (ev.clientY - sy);
						state.cropOx = nx; state.cropOy = ny;
						if (imgEl) {
							imgEl.style.left = (baseX + nx) + "px";
							imgEl.style.top = (baseY + ny) + "px";
						}
					};
					var up = function () {
						document.removeEventListener("mousemove", move);
						document.removeEventListener("mouseup", up);
						document.removeEventListener("blur", up);
						window.removeEventListener("blur", up);
						// 松手后只重渲染一次
						refresh();
					};
					document.addEventListener("mousemove", move);
					document.addEventListener("mouseup", up);
					// 兜底：鼠标在窗口外松开时 mouseup 可能不触发，避免监听器泄漏
					document.addEventListener("blur", up);
					window.addEventListener("blur", up);
				};
				var applyCrop = function () {
					var g = cropGeom();
					if (!g || !state.cropSrc) return;
					var OUT_W = 1200, k = OUT_W / g.W, OUT_H = Math.round(g.H * k);
					var cv = document.createElement("canvas");
					cv.width = OUT_W; cv.height = OUT_H;
					var c2 = cv.getContext("2d");
					if (!c2) return;
					var img = new Image();
					img.onload = function () {
						try {
							c2.drawImage(img, g.x * k, g.y * k, g.dw * k, g.dh * k);
							var dataUrl = cv.toDataURL("image/jpeg", 0.86);
							state.composerImg = dataUrl;
							state.composer = "image";
							idbPut("composerImg", { dataUrl: dataUrl }).catch(function () {});
							refreshComposerImage();
							savePrefs();
							state.notice = "已应用，蒙版强度可再调";
							refresh();
						} catch (err) { state.notice = "生成失败：" + (err && err.message); refresh(); }
					};
					img.onerror = function () { state.notice = "图片解码失败"; refresh(); };
					img.src = state.cropSrc;
				};
				var composerImagePanel = function () {
					// ---------------------------------------------------------------------------
					// 自定义图片：预览 + 控制合并成一块。
					// 之前上面是网格预览卡、下面是裁切面板，两处都在表达"自定义图片"，重复。
					// 现在只有一块：上面的预览随参数实时变化，下面是全部控制。
					//   裁切中  → 预览区就是裁切框（可拖动/缩放，带蒙版）
					//   已应用  → 预览区按输入框真实比例显示最终效果（图 + 蒙版 + 文字 + 发送键）
					//   未选图  → 空状态提示
					// ---------------------------------------------------------------------------
					var g = cropGeom();
					var cropping = !!(state.cropSrc && g);
					var a = (state.composerMask / 100).toFixed(2);
					var whiteText = state.composerMask >= 35;

					// ---- 预览区 ----
					var preview;
					if (cropping) {
						// 裁切框：直接当预览，蒙版层实时叠加
						preview = React.createElement("div", {
							key: "pv", className: "skc-crop",
							"data-skc-cropbox": "1",
							style: { width: CROP_W + "px", height: CROP_H + "px", cursor: "grab" },
							onMouseDown: startCropDrag
						}, [
							React.createElement("img", {
								key: "im", src: state.cropSrc, draggable: false,
								style: { position: "absolute", left: g.x + "px", top: g.y + "px",
									width: g.dw + "px", height: g.dh + "px", userSelect: "none", pointerEvents: "none" }
							}),
							React.createElement("div", {
								key: "mk", "data-skc-cropmask": "1",
								style: { position: "absolute", inset: 0, background: "#000",
									opacity: a, pointerEvents: "none" }
							})
						]);
					} else if (state.composerImg) {
						// 最终效果预览：按输入框比例，含文字与发送键
						preview = React.createElement("div", {
							key: "pv", "data-skc-liveprev": "1",
							style: {
								position: "relative", width: "100%", maxWidth: (CROP_W + 40) + "px",
								height: CROP_H + "px", borderRadius: "16px", overflow: "hidden",
								border: "1px solid rgba(255,255,255,.18)",
								boxShadow: "0 8px 26px rgba(0,0,0,.18)",
								backgroundImage: "linear-gradient(rgba(0,0,0," + a + "),rgba(0,0,0," + a + ")),url(\"" + state.composerImg + "\")",
								backgroundSize: "cover", backgroundPosition: "center",
								display: "flex", flexDirection: "column", justifyContent: "space-between",
								padding: "12px 14px", boxSizing: "border-box"
							}
						}, [
							React.createElement("div", {
								key: "t", "data-skc-liveprev-text": "1",
								style: { fontSize: "13px", lineHeight: "1.6",
									color: whiteText ? "#FFFFFF" : "var(--dsw-alias-label-caption)" }
							}, "描述任务或提问…"),
							React.createElement("div", {
								key: "s", style: { alignSelf: "flex-end", display: "inline-flex",
									alignItems: "center", justifyContent: "center", width: "24px", height: "24px",
									borderRadius: "50%", background: "var(--dsw-alias-brand-primary)",
									color: "#fff", fontSize: "11px", fontWeight: 700 }
							}, "↑")
						]);
					} else {
						preview = React.createElement("div", {
							key: "pv", className: "skc-imgempty",
							style: { width: "100%", maxWidth: (CROP_W + 40) + "px", height: CROP_H + "px",
								borderRadius: "16px", border: "1px dashed var(--dsw-alias-border-l3)",
								background: "var(--dsw-alias-bg-layer-2)", display: "flex",
								alignItems: "center", justifyContent: "center",
								color: "var(--dsw-alias-label-tertiary)", fontSize: "12px" }
						}, "还没有图片，点「选择图片」开始");
					}

					var items = [
						React.createElement("div", { className: "skc-section", key: "s1" }, "自定义图片"),
						React.createElement("div", { className: "skc-hint", key: "h1" },
							"选图后按 " + COMPOSER_RATIO + ":1 框选：拖动平移、滑杆缩放；下面的蒙版强度会实时反映在预览里。"),
						React.createElement("div", { key: "pvwrap", className: "skc-crop-wrap" }, preview),
						// 按钮行
						React.createElement("div", { className: "skc-row", key: "r1" }, [
							React.createElement("label", { key: "up", className: "skc-btn",
								style: { cursor: "pointer", display: "inline-flex", alignItems: "center" } }, [
								"选择图片",
								React.createElement("input", {
									key: "i", type: "file", accept: "image/*",
									style: { display: "none" },
									onChange: function (e) { pickCropFile(e.target && e.target.files && e.target.files[0]); }
								})
							]),
							cropping ? React.createElement("button", {
								key: "ap", type: "button", className: "skc-btn",
								style: { background: "var(--dsw-alias-brand-primary)", color: "#fff", borderColor: "transparent" },
								onClick: applyCrop
							}, "应用裁切") : null,
							state.composerImg ? React.createElement("button", {
								key: "rm", type: "button", className: "skc-btn",
								onClick: function () {
									state.composerImg = null; state.cropSrc = null; state.cropNat = null;
									state.composer = null;
									idbDel("composerImg");
									drop("composer");
									savePrefs();
									refresh();
								}
							}, "移除图片") : null
						])
					];

					// 缩放（仅裁切中）
					if (cropping) {
						items.push(React.createElement("div", { key: "zs", className: "skc-row" }, [
							React.createElement("span", { key: "l", className: "skc-section", style: { margin: 0 } }, "缩放"),
							React.createElement("input", {
								key: "z", type: "range", min: 1, max: 3, step: 0.01,
								className: "skc-range", value: state.cropZoom || 1,
								onChange: function (e) {
									state.cropZoom = Number(e.target.value) || 1;
									updateCropLive();
								},
								onMouseUp: function () { refresh(); },
								onTouchEnd: function () { refresh(); },
								onKeyUp: function () { refresh(); }
							})
						]));
					}

					// 蒙版强度（有图或裁切中都显示）
					items.push(React.createElement("div", { key: "ms", className: "skc-row" }, [
						React.createElement("span", { key: "l", className: "skc-section", style: { margin: 0 } }, "蒙版强度"),
						React.createElement("input", {
							key: "m", type: "range", min: 0, max: 90, step: 1,
							className: "skc-range", value: state.composerMask,
							onChange: function (e) {
								state.composerMask = Number(e.target.value) || 0;
								updateMaskLive();
								savePrefs();
							},
							onMouseUp: function () { refresh(); },
							onTouchEnd: function () { refresh(); },
							onKeyUp: function () { refresh(); }
						}),
						React.createElement("span", { key: "v", className: "skc-hint", "data-skc-maskval": "1" }, state.composerMask + "%")
					]));
					items.push(React.createElement("div", { key: "mh", className: "skc-hint" },
						"蒙版越深文字越清楚；超过 35% 时输入文字自动转为白色。"));
					items.push(React.createElement("div", { className: "skc-row", key: "rst" }, [
						React.createElement("button", {
							key: "off", type: "button", className: "skc-btn",
							onClick: function () { applyComposer(null); refresh(); }
						}, "恢复宿主默认")
					]));
					return React.createElement("div", { className: "skc-imgpanel", key: "custom" }, items);
				};


				// 顶栏预览：迷你模拟图
				var headerPreview = function (st) {
					if (st.image) {
						var a = (state.headerMask / 100).toFixed(2);
						var bg = state.headerImg
							? "linear-gradient(rgba(0,0,0," + a + "),rgba(0,0,0," + a + ")),url(" + DQ + state.headerImg + DQ + ")"
							: "var(--dsw-alias-bg-layer-2)";
						return React.createElement("div", {
							"data-skc-hprev": "1",
							style: { width: "100%", height: "46px", borderRadius: "8px", overflow: "hidden",
								border: "1px solid var(--dsw-alias-border-l2)",
								backgroundImage: bg, backgroundSize: "cover", backgroundPosition: "center",
								display: "flex", alignItems: "center", padding: "0 10px",
								boxSizing: "border-box", fontSize: "10px",
								color: state.headerImg && state.headerMask >= 35 ? "#fff" : "var(--dsw-alias-label-tertiary)" }
						}, state.headerImg ? "会话标题" : "上传图片后可预览");
					}
					var heightMap = { plain: 26, roomy: 40, compact: 24 };
					var h = heightMap[st.id] || 34;
					var wrap = {
						width: "100%", borderRadius: "8px", overflow: "hidden",
						border: "1px solid var(--dsw-alias-border-l2)",
						background: "var(--dsw-alias-bg-layer-1)", boxSizing: "border-box"
					};
					var bar = {
						display: "flex", alignItems: "center", gap: "6px",
						height: h + "px", padding: "0 8px",
						borderBottom: "1px solid var(--dsw-alias-border-l3)",
						position: "relative"
					};
					// 各风格的关键视觉特征
					if (st.id === "plain") { bar.borderBottom = "0"; }
					if (st.id === "brandbar") {
						bar.boxShadow = "inset 0 3px 0 var(--dsw-alias-brand-primary)";
						bar.background = "color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, transparent)";
					}
					if (st.id === "darkbar") { bar.background = "#1B1B1D"; bar.borderBottom = "0"; }
					if (st.id === "card") {
						wrap.margin = "0 4px"; wrap.borderRadius = "10px";
						wrap.boxShadow = "0 4px 12px rgba(0,0,0,.10)"; wrap.border = "1px solid var(--dsw-alias-border-l2)";
					}
					if (st.id === "grid") {
						bar.backgroundImage = "linear-gradient(var(--dsw-alias-border-l1) 1px,transparent 1px),linear-gradient(90deg,var(--dsw-alias-border-l1) 1px,transparent 1px)";
						bar.backgroundSize = "12px 12px";
					}
					if (st.id === "accentleft") { bar.borderLeft = "3px solid var(--dsw-alias-brand-primary)"; bar.borderBottom = "0"; }
					// 动态风格的预览快照：静态呈现关键视觉，至少让 6 张卡片能区分开
					if (st.pv) {
						for (var pk in st.pv) { if (Object.prototype.hasOwnProperty.call(st.pv, pk)) bar[pk] = st.pv[pk]; }
					}
					var darkText = st.id === "darkbar" || st.pvText === "light";
					var titleColor = darkText ? "#EDEDEA" : "var(--dsw-alias-label-secondary)";
					var titleSize = "10px";
					var titleWeight = 600;
					var title = React.createElement("span", {
						key: "t", style: { fontSize: titleSize, fontWeight: titleWeight, color: titleColor,
							whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }
					}, "会话标题");
					var tabs = React.createElement("div", {
						key: "tb", style: { display: "flex", gap: "8px", padding: "4px 8px 6px", alignItems: "center" }
					}, ["对话", "轨迹", "统计"].map(function (lab, i) {
						var on = i === 0;
						var c = on ? "var(--dsw-alias-state-business-primary)" : "var(--dsw-alias-label-tertiary)";
						if (darkText) c = on ? (st.id === "neon" ? "#7DF9FF" : "#FFD479") : "rgba(235,235,235,.62)";
						return React.createElement("span", { key: lab, style: { fontSize: "9px", color: c } }, lab);
					}));
					return React.createElement("div", { style: wrap }, [
						React.createElement("div", { key: "b", style: bar }, [title]),
						tabs
					]);
				};

				// 顶栏自定义图片面板
				var headerImagePanel = function () {
					var g = hCropGeom();
					var cropping = !!(state.hCropSrc && g);
					var a = (state.headerMask / 100).toFixed(2);
					var preview;
					if (cropping) {
						preview = React.createElement("div", {
							key: "c", "data-skc-hcrop": "1", className: "skc-crop",
							style: { width: HDR_CROP_W + "px", height: HDR_CROP_H + "px", cursor: "grab" },
							onMouseDown: startHCropDrag
						}, [
							React.createElement("img", {
								key: "im", src: state.hCropSrc, draggable: false,
								style: { position: "absolute", left: g.x + "px", top: g.y + "px",
									width: g.dw + "px", height: g.dh + "px", userSelect: "none", pointerEvents: "none" }
							}),
							React.createElement("div", {
								key: "mk", "data-skc-hmask": "1",
								style: { position: "absolute", inset: 0, background: "#000", opacity: a, pointerEvents: "none" }
							})
						]);
					} else if (state.headerImg) {
						preview = React.createElement("div", {
							key: "p", "data-skc-hprev": "1",
							style: { width: "100%", maxWidth: (HDR_CROP_W + 40) + "px", height: HDR_CROP_H + "px",
								borderRadius: "10px", overflow: "hidden",
								border: "1px solid var(--dsw-alias-border-l2)",
								backgroundImage: "linear-gradient(rgba(0,0,0," + a + "),rgba(0,0,0," + a + ")),url(" + DQ + state.headerImg + DQ + ")",
								backgroundSize: "cover", backgroundPosition: "center",
								display: "flex", alignItems: "center", padding: "0 14px",
								boxSizing: "border-box", fontSize: "12px",
								color: state.headerMask >= 35 ? "#FFFFFF" : "var(--dsw-alias-label-caption)" }
						}, "描述任务或提问…");
					} else {
						preview = React.createElement("div", {
							key: "e", className: "skc-imgempty",
							style: { width: "100%", maxWidth: (HDR_CROP_W + 40) + "px", height: HDR_CROP_H + "px",
								borderRadius: "10px", border: "1px dashed var(--dsw-alias-border-l3)",
								background: "var(--dsw-alias-bg-layer-2)", display: "flex",
								alignItems: "center", justifyContent: "center",
								color: "var(--dsw-alias-label-tertiary)", fontSize: "12px" }
						}, "还没有图片，点「选择图片」开始");
					}
					var items = [
						React.createElement("div", { className: "skc-section", key: "s" }, "自定义图片"),
						React.createElement("div", { className: "skc-hint", key: "h" },
							"选图后按 " + HEADER_RATIO + ":1 框选（顶栏是横条）：拖动平移、滑杆缩放；蒙版强度实时反映在预览里。"),
						React.createElement("div", { key: "w", className: "skc-crop-wrap" }, preview),
						React.createElement("div", { className: "skc-row", key: "r" }, [
							React.createElement("label", { key: "u", className: "skc-btn",
								style: { cursor: "pointer", display: "inline-flex", alignItems: "center" } }, [
								"选择图片",
								React.createElement("input", {
									key: "i", type: "file", accept: "image/*", style: { display: "none" },
									onChange: function (e) { pickHeaderFile(e.target && e.target.files && e.target.files[0]); }
								})
							]),
							cropping ? React.createElement("button", {
								key: "ap", type: "button", className: "skc-btn",
								style: { background: "var(--dsw-alias-brand-primary)", color: "#fff", borderColor: "transparent" },
								onClick: applyHeaderCrop
							}, "应用裁切") : null,
							state.headerImg ? React.createElement("button", {
								key: "rm", type: "button", className: "skc-btn",
								onClick: function () {
									state.headerImg = null; state.hCropSrc = null; state.hCropNat = null;
									state.header = null;
									idbDel("headerImg");
									drop("header");
									savePrefs();
									refresh();
								}
							}, "移除图片") : null
						])
					];
					if (cropping) {
						items.push(React.createElement("div", { key: "z", className: "skc-row" }, [
							React.createElement("span", { key: "l", className: "skc-section", style: { margin: 0 } }, "缩放"),
							React.createElement("input", {
								key: "r", type: "range", min: 1, max: 3, step: 0.01,
								className: "skc-range", value: state.hCropZoom || 1,
								onChange: function (e) { state.hCropZoom = Number(e.target.value) || 1; updateHCropLive(); },
								onMouseUp: function () { refresh(); },
								onTouchEnd: function () { refresh(); },
								onKeyUp: function () { refresh(); }
							})
						]));
					}
					items.push(React.createElement("div", { key: "m", className: "skc-row" }, [
						React.createElement("span", { key: "l", className: "skc-section", style: { margin: 0 } }, "蒙版强度"),
						React.createElement("input", {
							key: "r", type: "range", min: 0, max: 90, step: 1,
							className: "skc-range", value: state.headerMask,
							onChange: function (e) {
								state.headerMask = Number(e.target.value) || 0;
								updateHeaderMaskLive();
								savePrefs();
							},
							onMouseUp: function () { refresh(); },
							onTouchEnd: function () { refresh(); },
							onKeyUp: function () { refresh(); }
						}),
						React.createElement("span", { key: "v", className: "skc-hint", "data-skc-hmaskval": "1" }, state.headerMask + "%")
					]));
					items.push(React.createElement("div", { key: "mh", className: "skc-hint" },
						"蒙版越深文字越清楚；超过 35% 时标题自动转白。"));
					items.push(React.createElement("div", { key: "rst", className: "skc-row" }, [
						React.createElement("button", {
							key: "o", type: "button", className: "skc-btn",
							onClick: function () { applyHeader(null); refresh(); }
						}, "恢复宿主默认")
					]));
					return React.createElement("div", { className: "skc-imgpanel", key: "hp" }, items);
				};

				var headerPanel = React.createElement("div", { className: "skc-panel", "data-panel": "header", role: "tabpanel", key: "header" }, [
					React.createElement("div", { className: "skc-tabs skc-subtabs", role: "tablist", key: "st" },
						[["static", "静态风格"], ["dynamic", "动态风格"], ["custom", "自定义风格"]].map(function (p) {
							return React.createElement("button", {
								key: p[0], type: "button", role: "tab",
								className: "skc-tab" + (state.headerTab === p[0] ? " skc-on" : ""),
								"data-header-cat": p[0],
								"aria-selected": state.headerTab === p[0] ? "true" : "false",
								onClick: function () { state.headerTab = p[0]; savePrefs(); refresh(); }
							}, p[1]);
						})),
					React.createElement("div", { className: "skc-hint", key: "hh" },
						state.headerTab === "dynamic"
							? "带 CSS 动画；系统开启「减少动态效果」时动画自动关闭。"
							: (state.headerTab === "custom"
								? "上传图片做顶栏底图，按 16:1 裁切，自动加蒙版。"
								: "作用于会话顶部区域：高度、底边、标题与标签样式。纯视觉，不改交互。")),
					state.headerTab === "custom" ? null : React.createElement("div", { className: "skc-cprev-grid", key: "g" },
						HEADER_STYLES.filter(function (st) { return (st.cat || "static") === state.headerTab; })
							.map(function (st) {
								return React.createElement("button", {
									key: st.id, type: "button",
									className: "skc-cprev" + (state.header === st.id ? " skc-on" : ""),
									"data-header-style": st.id,
									"aria-pressed": state.header === st.id,
									title: st.hint,
									onClick: function () { applyHeader(st.id); refresh(); }
								}, [
									React.createElement("div", { className: "skc-cprev-head", key: "h" }, [
										React.createElement("span", { key: "n", className: "skc-cprev-name" }, st.name),
										state.header === st.id ? mark() : null
									]),
									React.createElement("div", { key: "p" }, headerPreview(st)),
									React.createElement("div", { key: "d", className: "skc-cprev-hint" }, st.hint)
								]);
							})
					),
					state.headerTab === "custom" ? headerImagePanel() : null,
					state.headerTab !== "custom" ? React.createElement("div", { className: "skc-row", key: "r" }, [
						React.createElement("button", {
							key: "off", type: "button", className: "skc-btn",
							onClick: function () { applyHeader(null); refresh(); }
						}, "恢复宿主默认")
					]) : null,
					state.notice ? React.createElement("div", { className: "skc-hint", key: "nt" }, state.notice) : null
				]);

				// 可配色风格的配置行：流光（三段渐变）/ 光晕 / 光标（单色）
				var composerColorRows = function () {
					var out = [];
					var FLOW_PRESETS = [
						["#D95926", "#8FB6E8", "#C79BE0"],
						["#7DF9FF", "#FF2A86", "#A78BFA"],
						["#34D399", "#38BDF8", "#818CF8"],
						["#F59E0B", "#EF4444", "#EC4899"],
						["#FFD479", "#FF8A5C", "#E0507A"]
					];
					var SINGLE = ["#D95926", "#22D3EE", "#A78BFA", "#34D399", "#EC4899", "#F59E0B", "#8FB6E8"];
					if (state.composer === "flow") {
						var cur = state.flowColors || FLOW_PRESETS[0];
						out.push(React.createElement("div", { className: "skc-section", key: "fl" }, "流光渐变色"));
						out.push(row([0, 1, 2].map(function (i) {
							return React.createElement("label", {
								key: "fc" + i, className: "skc-first-picker", title: "第 " + (i + 1) + " 个颜色", style: { background: cur[i] }
							}, React.createElement("input", {
								type: "color", "aria-label": "流光颜色" + (i + 1), value: cur[i],
								onChange: function (e) {
									var next = (state.flowColors || FLOW_PRESETS[0]).slice();
									next[i] = e.target.value;
									state.flowColors = next;
									applyComposer("flow");
									savePrefs();
									refresh();
								}
							}));
						})));
						out.push(row(FLOW_PRESETS.map(function (set, i) {
							return React.createElement("button", {
								key: "fp" + i, type: "button", className: "skc-btn", title: set.join(" → "),
								style: { width: "54px", background: "linear-gradient(90deg," + set.join(",") + ")" },
								onClick: function () { state.flowColors = set.slice(); applyComposer("flow"); savePrefs(); refresh(); }
							}, " ");
						})));
					}
					if (state.composer === "glow" || state.composer === "caret" || state.composer === "caretradiate") {
						var key = state.composer === "glow" ? "glowColor" : "caretColor";
						var label = state.composer === "glow" ? "光晕颜色" : "光标流光颜色";
						out.push(React.createElement("div", { className: "skc-section", key: "gl" }, label));
						out.push(row([React.createElement("label", {
							key: "gp", className: "skc-first-picker", title: label, style: { background: state[key] }
						}, React.createElement("input", {
							type: "color", "aria-label": label, value: state[key],
							onChange: function (e) { state[key] = e.target.value; applyComposer(state.composer); savePrefs(); refresh(); }
						}))].concat(SINGLE.map(function (c) {
							var on = state[key] === c;
							return React.createElement("button", {
								key: "g" + c, type: "button", className: "skc-square" + (on ? " skc-on" : ""), title: c, "aria-label": label + c,
								style: { background: c },
								onClick: function () { state[key] = c; applyComposer(state.composer); savePrefs(); refresh(); }
							}, on ? mark() : null);
						}))));
					}
					return out.length ? React.createElement("div", { className: "skc-panel", key: "ccfg" }, out) : null;
				};

				var composerPanel = React.createElement("div", { className: "skc-panel", "data-panel": "composer", role: "tabpanel", key: "composer" }, [
					// 子分类：静态 / 动态 / 自定义
					React.createElement("div", { className: "skc-tabs skc-subtabs", role: "tablist", key: "st" },
						[["static", "静态风格"], ["dynamic", "动态风格"], ["custom", "自定义风格"]].map(function (p) {
							return React.createElement("button", {
								key: p[0], type: "button", role: "tab",
								className: "skc-tab" + (state.composerTab === p[0] ? " skc-on" : ""),
								"data-composer-cat": p[0],
								"aria-selected": state.composerTab === p[0] ? "true" : "false",
								onClick: function () { state.composerTab = p[0]; savePrefs(); refresh(); }
							}, p[1]);
						})),
					React.createElement("div", { className: "skc-hint", key: "hh" },
						state.composerTab === "dynamic"
							? "带 CSS 动画；系统开启「减少动态效果」时动画会自动关闭。"
							: (state.composerTab === "custom"
								? "上传图片，按输入框比例裁切，自动加蒙版保证文字可读。"
								: "纯视觉改造，不影响输入、发送等任何行为。预览与真实效果一致。")),
					// 自定义分类不渲染网格卡：面板本身已含预览，避免上下两处重复表达同一件事
					state.composerTab === "custom" ? null : React.createElement("div", { className: "skc-cprev-grid", key: "g" },
						COMPOSER_STYLES.filter(function (st) {
							return (st.cat || "static") === state.composerTab;
						}).map(function (st) {
							return React.createElement("button", {
								key: st.id, type: "button",
								className: "skc-cprev" + (state.composer === st.id ? " skc-on" : ""),
								"data-composer-style": st.id,
								"aria-pressed": state.composer === st.id,
								title: st.hint,
								onClick: function () { applyComposer(st.id); refresh(); }
							}, [
								React.createElement("div", { className: "skc-cprev-head", key: "h" }, [
									React.createElement("span", { key: "n", className: "skc-cprev-name" }, st.name),
									state.composer === st.id ? mark() : null
								]),
								React.createElement("div", { key: "p" }, composerPreview(st)),
								React.createElement("div", { key: "d", className: "skc-cprev-hint" }, st.hint)
							]);
						})
					),
					state.composerTab === "custom" ? null : composerColorRows(),
					state.composerTab === "custom" ? null : React.createElement("div", { className: "skc-row", key: "r" }, [
						React.createElement("button", {
							key: "off", type: "button", className: "skc-btn",
							onClick: function () { applyComposer(null); refresh(); }
						}, "恢复宿主默认")
					]),
					// 自定义分类下常驻上传与裁切区
					state.composerTab === "custom" ? composerImagePanel() : null,
					state.notice ? React.createElement("div", { className: "skc-hint", key: "nt" }, state.notice) : null
				]);

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
							React.createElement("input", { type: "checkbox", checked: state.bgOn !== false, "aria-label": "背景开关", onChange: function (e) { state.bgOn = e.target.checked; if (state.bgOn) startSlides(); else stopSlides(); applyBg(true); refresh(); } }),
							React.createElement("span", null, "启用背景")),
						React.createElement("label", { key: "pick", className: "skc-btn skc-upload", title: "选择图片 / 动图 / 视频" },
							"选择文件",
							React.createElement("input", {
								type: "file", className: "skc-bgfile", accept: "image/*,video/mp4,video/webm,video/*", "aria-label": "选择背景文件",
								onChange: function (e) {
									var list = snapshotFiles(e.target && e.target.files);
									if (e.target) e.target.value = "";
									onPickFile(list[0]);
									refresh();
								}
							})),
						React.createElement("button", { key: "clear", type: "button", className: "skc-btn", onClick: function () { clearBackground(); refresh(); }, disabled: !state.bgUrl }, "清除背景"),
						React.createElement("button", { key: "diag", type: "button", className: "skc-btn", onClick: function () { runDiagnostics(); refresh(); } }, "检测"),
						React.createElement("button", { key: "reset", type: "button", className: "skc-btn", onClick: function () { resetAll(); refresh(); } }, "恢复默认")
					]),
					state.bgName ? React.createElement("div", { className: "skc-bgname", key: "name" }, "当前：" + state.bgName + (state.bgKind === "video" ? "（视频）" : "（图片）")) : null,
					// 文件夹轮播
					React.createElement("div", { className: "skc-section", key: "ss" }, "文件夹轮播"),
					row([
						React.createElement("label", { key: "dirpick", className: "skc-btn skc-upload", title: "选择一个文件夹作为轮播源" },
							"选择文件夹",
							React.createElement("input", {
								type: "file", className: "skc-bgdir", webkitdirectory: "true", directory: "true", multiple: true,
								// 目录选择框不加 accept：Chromium 在 webkitdirectory + accept 组合下可能把目录项全过滤掉，
								// 过滤交给 onPickFolder 自己按 MIME/扩展名判断。
								"aria-label": "选择背景文件夹",
								onChange: function (e) {
									var list = snapshotFiles(e.target && e.target.files);
									if (e.target) e.target.value = "";
									onPickFolder(list);
									refresh();
								}
							})),
						// 兜底：个别平台目录选择框不可用时，可以多选图片（Ctrl+A 全选一个文件夹）。
						React.createElement("label", { key: "filespick", className: "skc-btn skc-upload", title: "多选图片作为轮播源" },
							"多选图片",
							React.createElement("input", {
								type: "file", className: "skc-bgfiles", multiple: true, accept: "image/*", "aria-label": "多选背景图片",
								onChange: function (e) {
									var list = snapshotFiles(e.target && e.target.files);
									if (e.target) e.target.value = "";
									onPickFolder(list);
									refresh();
								}
							})),
						React.createElement("span", { key: "iv", className: "skc-hint" }, "间隔 " + state.slideInterval + "s"),
						React.createElement("input", {
							key: "ivr", type: "range", className: "skc-range", min: "5", max: "300", step: "5",
							"aria-label": "切换间隔", value: state.slideInterval,
							onChange: function (e) {
								state.slideInterval = Math.max(5, Math.min(300, Math.round(Number(e.target.value) || 30)));
								savePrefs();
								if (state.slideOn) startSlides();
								refresh();
							}
						}),
						React.createElement("button", { key: "prev", type: "button", className: "skc-btn", "aria-label": "上一张", disabled: slides.length < 2, onClick: function () { applySlideAt(state.slideIndex - 1, true); refresh(); } }, "上一张"),
						React.createElement("button", { key: "next", type: "button", className: "skc-btn", "aria-label": "下一张", disabled: slides.length < 2, onClick: function () { applySlideAt(state.slideIndex + 1, true); refresh(); } }, "下一张"),
						React.createElement("button", { key: "clearslides", type: "button", className: "skc-btn", onClick: function () { clearSlides(); refresh(); }, disabled: !slides.length }, "清除幻灯片")
					]),
					state.slideCount ? React.createElement("div", { className: "skc-bgname", key: "slidename" },
						"幻灯片 " + state.slideCount + " 张 · 第 " + (state.slideIndex + 1) + " 张" + (state.slideName ? " · " + state.slideName : "") + (state.slideOn ? "" : " · 已暂停")
					) : null,
					state.folderInfo ? React.createElement("div", { className: "skc-hint", key: "folderinfo" }, state.folderInfo) : null,
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

				// 文本消息框：预设卡 + 用户/AI 两种气泡的实时预览
				var msgPreview = function (st) {
					var uBubble = { maxWidth: "72%", marginLeft: "auto", padding: "6px 10px", fontSize: "11px", lineHeight: "1.5", color: "var(--dsw-alias-label-primary)" };
					var aBlock = { maxWidth: "92%", marginRight: "auto", padding: "6px 10px", fontSize: "11px", lineHeight: "1.5", color: "var(--dsw-alias-label-secondary)", marginTop: "6px" };
					if (st.id === "bubble") {
						uBubble.borderRadius = "12px";
						uBubble.background = "color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, var(--dsw-alias-bg-layer-1))";
						uBubble.border = "1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 24%, transparent)";
						aBlock.borderRadius = "10px";
						aBlock.background = "var(--dsw-alias-bg-layer-1)";
						aBlock.border = "1px solid var(--dsw-alias-border-l1)";
					} else if (st.id === "card") {
						uBubble.borderRadius = "10px";
						uBubble.background = "var(--dsw-alias-bg-layer-1)";
						uBubble.border = "1px solid var(--dsw-alias-border-l2)";
						uBubble.boxShadow = "0 3px 10px rgba(0,0,0,.07)";
						aBlock.borderLeft = "2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent)";
					} else if (st.id === "glass") {
						uBubble.borderRadius = "12px";
						uBubble.background = "color-mix(in srgb, var(--dsw-alias-bg-layer-1) 55%, transparent)";
						uBubble.border = "1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 70%, transparent)";
						uBubble.backdropFilter = "blur(8px)";
						aBlock.borderRadius = "10px";
						aBlock.background = "color-mix(in srgb, var(--dsw-alias-bg-layer-1) 42%, transparent)";
						aBlock.border = "1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 55%, transparent)";
						aBlock.backdropFilter = "blur(6px)";
					} else if (st.id === "terminal") {
						uBubble.borderRadius = "4px";
						uBubble.background = "#1B1B1D";
						uBubble.color = "#EDEDEA";
						uBubble.fontFamily = "var(--dsw-font-mono,Consolas,monospace)";
						aBlock.borderRadius = "4px";
						aBlock.background = "color-mix(in srgb, var(--dsw-alias-bg-layer-1) 75%, transparent)";
						aBlock.border = "1px solid var(--dsw-alias-border-l2)";
						aBlock.borderLeft = "3px solid var(--dsw-alias-brand-primary)";
						aBlock.fontFamily = "var(--dsw-font-mono,Consolas,monospace)";
					} else if (st.id === "outline") {
						uBubble.borderRadius = "10px";
						uBubble.border = "1px solid var(--dsw-alias-border-l2)";
						aBlock.borderRadius = "10px";
						aBlock.border = "1px solid var(--dsw-alias-border-l1)";
					} else if (st.id === "tint") {
						uBubble.borderRadius = "11px";
						uBubble.background = "color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, var(--dsw-alias-bg-layer-1))";
						aBlock.borderRadius = "11px";
						aBlock.background = "color-mix(in srgb, var(--dsw-alias-bg-layer-2) 70%, var(--dsw-alias-bg-layer-1))";
					}
					return React.createElement("div", { className: "skc-msgprev", style: { display: "flex", flexDirection: "column", gap: "2px", padding: "2px" } }, [
						React.createElement("div", { key: "u", style: uBubble }, "用户的这句话长这样"),
						React.createElement("div", { key: "a", style: aBlock }, "AI 的回复长这样，两种消息视觉上能分清。")
					]);
				};
				var msgPanel = React.createElement("div", { className: "skc-panel", "data-panel": "msg", role: "tabpanel", key: "msg" }, [
					React.createElement("div", { className: "skc-section", key: "t" }, "文本消息框"),
					React.createElement("div", { className: "skc-cprev-grid", key: "g" },
						MSG_STYLES.map(function (st) {
							return React.createElement("button", {
								key: st.id, type: "button",
								className: "skc-cprev" + (state.msgStyle === st.id ? " skc-on" : ""),
								"data-msg-style": st.id,
								"aria-pressed": state.msgStyle === st.id,
								title: st.hint,
								onClick: function () { applyMsgStyle(st.id); refresh(); }
							}, [
								React.createElement("div", { className: "skc-cprev-head", key: "h" }, [
									React.createElement("span", { key: "n", className: "skc-cprev-name" }, st.name),
									state.msgStyle === st.id ? mark() : null
								]),
								React.createElement("div", { key: "p" }, msgPreview(st)),
								React.createElement("div", { key: "d", className: "skc-cprev-hint" }, st.hint)
							]);
						})
					),
					React.createElement("div", { className: "skc-row", key: "r" }, [
						React.createElement("button", {
							key: "off", type: "button", className: "skc-btn",
							onClick: function () { applyMsgStyle(null); refresh(); }
						}, "恢复宿主默认")
					])
				]);

				var panels = { style: stylePanel, header: headerPanel, composer: composerPanel, msg: msgPanel, bg: bgPanel, color: colorPanel, font: fontPanel };
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

			bindCaretEvents();

			slotsSvc.inject("settings.section", function () {
				return slotsSvc.register({ name: "settings.section", id: "skinc-page", order: 31, label: "外观皮肤" }, function () { return React.createElement(Page); });
			});

			// ---------------------------------------------------------------------------
			// 结构验证（最小可用）：往会话头部动作区插一个只读指示器。
			//
			// 这是 89 个插槽里的第一个试验点，用来验证三件事：
			//   1) inject → register → dispose 的生命周期是否干净
			//   2) 插槽 props 的组成：OwnerOf + keyProps + SlotInjectFace + scopeProps
			//      注意 inject 返回的 hooks 会被宿主改写成 useXxx（见 SlotInjectFace），
			//      所以这里只依赖宿主无条件传的 sessionId，不依赖未声明的服务。
			//   3) 卸载时不留残留（dispose 由 slots.inject 自动挂在插件 fiber 上）
			//
			// conversation.session.header.actions 是 list 型、session 作用域：
			// 每个会话一个实例，宿主把 sessionId 传进来。
			// ---------------------------------------------------------------------------
			function HeaderBadge(props) {
				var sid = props && props.sessionId;
				if (!sid) return null;
				// 宿主会话 id 形如 `session-<uuid>`（brandString(`session-${randomUUID()}`)），
				// 直接 slice(0,8) 会只截到 "session-" 前缀，所以先剥掉前缀再取短码。
				var s = String(sid);
				var body = s.indexOf("session-") === 0 ? s.slice(8) : s;
				var short = body.slice(0, 8);
				return React.createElement("span", {
					className: "skc-hdr-badge",
					title: "会话 " + s,
					"data-skc": "header-badge",
					"data-skc-session": s
				}, [
					React.createElement("span", { className: "skc-hdr-dot", key: "d" }),
					React.createElement("span", { key: "t" }, short)
				]);
			}
			var hdrCss = insertCss(
				".skc-hdr-badge{display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 8px;border-radius:999px;" +
				"border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);" +
				"color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1;white-space:nowrap;" +
				"font-family:var(--dsw-font-mono,ui-monospace,monospace);user-select:none}" +
				".skc-hdr-dot{width:5px;height:5px;border-radius:50%;background:var(--dsw-alias-brand-primary);flex:none}"
			);
			slotsSvc.inject("conversation.session.header.actions", function () {
				return slotsSvc.register({
					name: "conversation.session.header.actions",
					id: "skinc-header-badge",
					order: 90
				}, HeaderBadge);
			});

			ctx.effect(function () {
				return function () {
					if (typeof document !== "undefined" && document.removeEventListener) document.removeEventListener("visibilitychange", onVisibility);
					stopSlides();
					unbindCaretEvents();
					removeCaretFx();
					removeFx();
					removeSlideFx();
					rerender = null;
					removeMediaLayer();
					revokeUrl();
					drop("tokens"); drop("root"); drop("style"); drop("font"); drop("bg"); drop("radius"); drop("composer"); drop("header"); drop("msg");
					if (typeof hdrCss === "function") hdrCss();
					css();
				};
			});
		}

		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});
