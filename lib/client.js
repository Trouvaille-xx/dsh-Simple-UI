window.__ModuleLoader__.load({
	id: "dsh-simple-ui",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		var React = require("react");

		// ---------------------------------------------------------------------------
		// 宿主构建哈希类名（唯一来源，勿在别处散落）
		// 来源：DSH Web 客户端构建产物里的 CSS Modules 哈希类名。
		// 这些哈希会随 DSH 升级整体变化，因此在这里集中登记：预置皮肤 CSS 里只写
		// __H_<语义键>__ 占位符，插入前由 expandHostSelectors 解析成
		// :is(宿主哈希, 语义兜底...)。
		//   - 哈希仍命中宿主时，与原实现完全一致；
		//   - 哈希失效时，只用 fallbacks 里的语义选择器（aside/header/main 等）；
		//   - 没有安全兜底的（如消息卡片装饰），哈希失效后规则自然不命中，降级为宿主
		//     默认样式，不会破版。
		// 新增皮肤 CSS 时优先写语义选择器；确需宿主结构时，只在本表登记语义键。
		// ---------------------------------------------------------------------------
		var HOST_SELECTORS = {
			frame: { hash: ".pI_x6G_frame", fallbacks: [] },
			sidebarCol: { hash: ".pI_x6G_sidebarCol", fallbacks: [] },
			centerCol: { hash: ".pI_x6G_centerCol", fallbacks: ["main"] },
			detailsCol: { hash: ".pI_x6G_detailsCol", fallbacks: [] },
			ledgerRoot: { hash: ".qBU-ya_root", fallbacks: [] },
			ledger: { hash: ".qBU-ya_ledger", fallbacks: [] },
			split: { hash: ".Y0dWHa_split", fallbacks: [] },
			chatRoot: { hash: ".wSkVaW_root", fallbacks: [] },
			viewArea: { hash: ".wSkVaW_viewArea", fallbacks: ["main"] },
			scrollBody: { hash: ".wSkVaW_scrollBody", fallbacks: [] },
			composerSeat: { hash: ".wSkVaW_composerSeat", fallbacks: [] },
			composerStack: { hash: ".wSkVaW_composerStack", fallbacks: [] },
			chatHeader: { hash: ".wSkVaW_header", fallbacks: ["header"] },
			chatTab: { hash: ".wSkVaW_tab", fallbacks: [] },
			markdownRoot: { hash: ".Md3f7G_root", fallbacks: [] },
			markdownScroll: { hash: ".Md3f7G_scroll", fallbacks: ["main"] },
			paneRoot: { hash: ".ydkMvW_root", fallbacks: [] },
			sidebar: { hash: ".hHd-Xa_root", fallbacks: ["aside"] },
			card: { hash: ".uV2eYG_card", fallbacks: [] },
			primaryBtn: { hash: ".uV2eYG_primary", fallbacks: [] },
			overlayRoot: { hash: ".fV0t5q_root", fallbacks: [] }
		};

		var HOST_SLOT = /__H_([A-Za-z0-9_]+)__/g;
		var expandHostSelectors = function (css) {
			return String(css).replace(HOST_SLOT, function (whole, key) {
				var meta = HOST_SELECTORS[key];
				if (!meta) return whole;
				return ":is(" + [meta.hash].concat(meta.fallbacks || []).join(",") + ")";
			});
		};

		// 所有注入的样式都从这里走，保证哈希类名解析只有一条通路。
		function insertCss(css) {
			var tag = document.createElement("style");
			if (typeof tag.setAttribute === "function") tag.setAttribute("data-plugin", "dsh-simple-ui");
			tag.textContent = expandHostSelectors(css);
			(document.head || document.documentElement).appendChild(tag);
			return function () { if (tag.parentNode) tag.parentNode.removeChild(tag); };
		}

		// 离线字体栈：全部本地优先，不引用任何网络字体。
		// 中文正文统一兜底到 Windows/macOS 常见字体，保证不会缺字。
		var FONT_CN = "\"Microsoft YaHei\",\"PingFang SC\",\"Noto Sans SC\",\"Source Han Sans SC\",\"Hiragino Sans GB\",\"Heiti SC\",SimHei,SimSun";
		var FONT_EN = "\"Segoe UI\",\"Helvetica Neue\",Arial,Roboto,sans-serif";
		var FONT_MONO = "Consolas,\"Cascadia Mono\",\"Courier New\",monospace";

		// 基础样式：不引用任何网络字体 / 字体文件，0ms 首屏、不阻塞渲染。
		var BASE_CSS = ".skc-page{display:flex;flex-direction:column;gap:12px;padding:16px 4px;color:var(--dsw-alias-label-primary)}" +
			".skc-title{font-size:16px;font-weight:700}" +
			".skc-row{display:flex;flex-wrap:wrap;gap:6px}" +
			".skc-square{position:relative;width:44px;height:44px;min-width:44px;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;cursor:pointer;overflow:hidden}" +
			".skc-square.skc-on,.skc-preset.skc-on,.skc-font.skc-on{outline:3px solid var(--dsw-alias-state-warn-primary);outline-offset:2px}" +
			".skc-mark{position:absolute;right:-5px;top:-8px;width:16px;height:16px;border-radius:8px;background:var(--dsw-alias-state-success-primary);color:#fff;text-align:center}" +
			".skc-preset{position:relative;width:118px;height:54px;border:1px solid rgba(255,255,255,.25);border-radius:8px;font-weight:600;cursor:pointer}" +
			".skc-section{font-size:12px;color:var(--dsw-alias-label-secondary);margin-top:8px}" +
			".skc-upload{display:flex;align-items:center;justify-content:center}" +
			".skc-upload input{display:none}" +
			".skc-bgtoggle{display:flex;align-items:center;gap:6px;height:44px;padding:0 2px;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer}.skc-bgtoggle input{accent-color:var(--dsw-alias-brand-primary);width:15px;height:15px;margin:0;cursor:pointer}" +
			".skc-font{position:relative;width:118px;height:42px;padding:0 6px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;cursor:pointer}" +
			".skc-custom{background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red)!important;display:flex;align-items:center;justify-content:center}" +
			".skc-custom .skc-plus{color:#fff;font-size:22px;font-weight:700;line-height:1;text-shadow:0 1px 2px rgba(0,0,0,.6);pointer-events:none}" +
			".skc-custom input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:0;padding:0}" +
			".skc-first-picker{position:relative;width:44px;height:44px;min-width:44px;display:flex;align-items:center;justify-content:center;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;cursor:pointer;overflow:hidden;box-shadow:inset 0 0 0 2px rgba(255,255,255,.22)}.skc-first-picker::after{content:'\u2197';position:absolute;right:2px;bottom:0;color:#fff;font-size:11px;font-weight:700;text-shadow:0 1px 2px #000;pointer-events:none}.skc-first-picker input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:0;padding:0}" +
			".skc-btn{height:32px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;cursor:pointer}" +
			".skc-btn:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2)}" +
			".skc-btn:disabled{opacity:.45;cursor:not-allowed}" +
			".skc-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:6px}" +
			".skc-hint{font-size:11px;line-height:1.5;color:var(--dsw-alias-label-secondary)}" +
			".skc-square:focus-visible,.skc-preset:focus-visible,.skc-font:focus-visible,.skc-first-picker:focus-visible,.skc-bgtoggle input:focus-visible,.skc-btn:focus-visible,.skc-custom input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}";

		var inject = ["theme", "slots"];

		function apply(ctx) {
			var theme = ctx.theme || ctx.get("theme");
			var slotsSvc = ctx.slots || ctx.get("slots");
			if (!theme || !slotsSvc) return;

			var STORE_PREFS = "dsh-simple-ui.preset.v1";
			var STORE_BG = "dsh-simple-ui.bg.v1";
			var MAX_BG_CHARS = 1536 * 1024;

			var state = { preset: null, main: null, accent: null, neutral: null, label: null, cn: null, en: null, bg: null, bgOn: true, bgPersisted: true };

			// localStorage 可能在隐私模式/沙箱里不可用或写满，全部访问都要容错。
			var ls = function () {
				try { if (typeof window !== "undefined" && window.localStorage) return window.localStorage; } catch (e) {}
				try { if (typeof localStorage !== "undefined" && localStorage) return localStorage; } catch (e) {}
				return null;
			};
			var storageGet = function (k) {
				var s = ls();
				if (!s) return null;
				try { return s.getItem(k); } catch (e) { return null; }
			};
			var storageSet = function (k, v) {
				var s = ls();
				if (!s) return false;
				try { s.setItem(k, v); return true; } catch (e) { return false; }
			};
			var storageDel = function (k) {
				var s = ls();
				if (!s) return;
				try { s.removeItem(k); } catch (e) {}
			};

			var css = insertCss(BASE_CSS);
			var layer = { tokens: null, root: null, style: null, font: null, bg: null };
			var quiet = false;

			var drop = function (name) {
				if (layer[name]) {
					try { layer[name](); } catch (e) {}
					layer[name] = null;
				}
			};
			// 缺陷 1：所有皮肤层（:root !important 块 + 预设 STYLE 层）必须一起清，
			// 否则先选主色再点预设时旧主色会压住预设品牌色。
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

			var STYLE_GOV = "body::after{content:\"\";position:fixed;left:0;right:0;top:0;height:5px;background:linear-gradient(90deg,#A00810,#D93A3F);z-index:2147483000;pointer-events:none}__H_sidebar__{border-right:1px solid rgba(190,10,16,.16)!important}__H_card__{border-top:3px solid #BE0A10!important;border-radius:6px!important;box-shadow:0 2px 10px rgba(0,0,0,.07)!important}__H_card__::after{content:\"红白页\";position:absolute;right:16px;top:6px;transform:rotate(8deg);font-size:11px;line-height:1;color:#BE0A10;border:2px solid rgba(190,10,16,.5);border-radius:4px;padding:3px 5px;opacity:.75;pointer-events:none;font-weight:700}__H_chatHeader__{border-bottom:2px solid #BE0A10!important;background:linear-gradient(180deg,#FFFFFF,#FAF5F4)!important}h1,h2,h3,h4{font-family:\"Noto Serif SC\",\"SimSun\",serif!important;letter-spacing:.02em}button{transition:transform .12s ease,box-shadow .12s ease!important}button:active{transform:translateY(1px)!important}";
			var STYLE_NIGHTCITY = "html{background:#080808!important}__H_frame__{background:linear-gradient(135deg,#080808 0%,#17120b 52%,#120616 100%)!important}__H_sidebar__{background:linear-gradient(180deg,#080808,#181007)!important;border-right:3px solid #FCEE0A!important;position:relative}__H_sidebar__::before{content:\"NIGHT CITY // 2077\";display:block;margin:12px 10px 7px;padding:7px 8px;background:#FCEE0A;color:#080808;font-family:monospace;font-size:11px;font-weight:900;letter-spacing:.13em;clip-path:polygon(0 0,100% 0,94% 100%,0 100%)}__H_sidebar__::after{content:\"NET.STATUS : ONLINE\";display:block;margin:auto 10px 12px;padding-top:8px;border-top:1px solid rgba(252,238,10,.65);color:#FCEE0A;font-family:monospace;font-size:9px;letter-spacing:.18em}__H_sidebar__ button,__H_sidebar__ a{border-left:3px solid transparent!important;transition:transform .16s ease,background .16s ease,border-color .16s ease!important}__H_sidebar__ button:hover,__H_sidebar__ a:hover{background:#FCEE0A!important;color:#080808!important;border-left-color:#FF2A86!important;transform:translateX(5px) skewX(-4deg)}__H_chatHeader__{background:rgba(8,8,8,.96)!important;border-bottom:2px solid #FCEE0A!important}__H_chatTab__:after{background:#FCEE0A!important}__H_card__{background:linear-gradient(110deg,#11110d,#1a100d 70%,#170817)!important;border:1px solid #FCEE0A!important;border-left:5px solid #FCEE0A!important;box-shadow:7px 7px 0 #FF2A86,0 0 24px rgba(252,238,10,.18)!important}__H_card__::before{content:\"// CHANNEL_01 · INPUT READY\";display:block;margin:-2px 12px 7px;padding-bottom:5px;border-bottom:1px solid rgba(252,238,10,.75);color:#FCEE0A;font-family:monospace;font-size:10px;letter-spacing:.2em}__H_primaryBtn__{background:#FCEE0A!important;color:#080808!important;border-radius:0!important;box-shadow:3px 3px 0 #FF2A86!important;transition:transform .14s ease,box-shadow .14s ease!important}__H_primaryBtn__:hover:not(:disabled){background:#FFF45C!important;transform:translate(-2px,-2px)!important;box-shadow:5px 5px 0 #FF2A86!important}__H_markdownScroll__>*{border-left:2px solid rgba(252,238,10,.25);padding-left:8px;transition:transform .18s ease,border-color .18s ease;animation:skcCyberIn .32s cubic-bezier(.2,.8,.2,1)}__H_markdownScroll__>*:hover{border-left-color:#FF2A86;transform:translateX(4px)}@keyframes skcCyberIn{from{opacity:0;transform:translateX(-10px);filter:brightness(1.8)}to{opacity:1;transform:none;filter:brightness(1)}}@keyframes skcCyberScan{0%{transform:translateY(-120px);opacity:0}12%{opacity:1}88%{opacity:1}100%{transform:translateY(110vh);opacity:0}}body::after{content:\"\";position:fixed;left:0;right:0;top:0;height:100px;background:linear-gradient(180deg,transparent,rgba(252,238,10,.07),transparent);animation:skcCyberScan 6s linear infinite;pointer-events:none;z-index:2147482000}button:focus-visible,a:focus-visible{outline:2px solid #FCEE0A!important;outline-offset:3px!important}@media(prefers-reduced-motion:reduce){body::after,__H_markdownScroll__>*{animation:none!important}__H_sidebar__ button,__H_sidebar__ a,__H_primaryBtn__{transition:none!important}}__H_sidebar__{background:linear-gradient(145deg,rgba(252,238,10,.12) 0 2%,transparent 2% 42%,rgba(255,42,134,.12) 42% 43%,transparent 43%),repeating-linear-gradient(0deg,transparent 0 23px,rgba(252,238,10,.07) 24px),linear-gradient(180deg,#080808,#181007)!important;box-shadow:inset -1px 0 rgba(255,42,134,.8)!important}__H_chatRoot__{position:relative;isolation:isolate}__H_chatRoot__::before{content:\"\";position:absolute;inset:15px 18px 86px;border:1px solid rgba(252,238,10,.22);clip-path:polygon(0 0,24px 0,24px 2px,calc(100% - 24px) 2px,calc(100% - 24px) 0,100% 0,100% 22px,calc(100% - 2px) 22px,calc(100% - 2px) calc(100% - 22px),100% calc(100% - 22px),100% 100%,calc(100% - 24px) 100%,calc(100% - 24px) calc(100% - 2px),24px calc(100% - 2px),24px 100%,0 100%,0 calc(100% - 22px),2px calc(100% - 22px),2px 22px,0 22px);pointer-events:none;z-index:5}__H_composerSeat__{position:relative}__H_composerSeat__::after{content:\"\";position:absolute;right:94px;top:-11px;width:92px;height:21px;background:linear-gradient(90deg,#FCEE0A 0 8%,transparent 8% 12%,#FF2A86 12% 25%,transparent 25% 29%,#FCEE0A 29% 47%,transparent 47% 51%,#FF2A86 51% 58%,transparent 58% 62%,#FCEE0A 62% 83%,transparent 83% 87%,#FF2A86 87% 100%);clip-path:polygon(0 45%,7% 45%,7% 10%,18% 10%,18% 65%,32% 65%,32% 0,49% 0,49% 42%,61% 42%,61% 18%,74% 18%,74% 70%,87% 70%,87% 32%,100% 32%,100% 100%,0 100%);filter:drop-shadow(0 0 4px rgba(252,238,10,.55));pointer-events:none}__H_chatHeader__{background-image:repeating-linear-gradient(90deg,transparent 0 18px,rgba(252,238,10,.32) 19px 20px)!important;background-size:auto 2px!important;background-repeat:repeat-x!important;background-position:left bottom!important}";
			var STYLE_NEWS = "*,*::before,*::after{border-radius:0!important}__H_card__{border:1px solid #1A1A1A!important;box-shadow:5px 5px 0 rgba(26,26,26,.85)!important}__H_card__::before{content:\"THE DAILY DSH · 晨报\";display:block;text-align:center;font-family:\"Noto Serif SC\",\"SimSun\",serif;font-size:11px;letter-spacing:.35em;color:#1A1A1A;border-bottom:1px solid #1A1A1A;padding-bottom:5px;margin:-4px 10px 10px}__H_markdownScroll__ p{text-align:justify!important}__H_markdownScroll__ a{text-decoration:underline!important;text-underline-offset:2px}__H_markdownScroll__ img{filter:grayscale(100%) contrast(105%)!important}button{transition:transform .1s ease!important}button:active{transform:translate(1px,1px)!important}__H_sidebar__{border-right:1px solid #1A1A1A!important;background:#F5F0E3!important}__H_sidebar__::before{content:\"\";display:block;height:7px;border-top:1px solid #1A1A1A;border-bottom:3px double #1A1A1A;margin:10px 12px 4px}__H_sidebar__::after{content:\"DSH 晨报 · 第壹版\";display:block;text-align:center;font-family:\"Noto Serif SC\",\"SimSun\",serif;font-size:10px;letter-spacing:.28em;color:#1A1A1A;border-top:1px solid #1A1A1A;padding:8px 0;margin:auto 12px 10px}__H_sidebar__ button,__H_sidebar__ a{font-family:\"Noto Serif SC\",\"SimSun\",serif!important}__H_sidebar__ button:hover{background:rgba(26,26,26,.06)!important;text-decoration:underline!important;text-underline-offset:3px}__H_sidebar__ [aria-current],__H_sidebar__ [aria-selected=\"true\"],__H_sidebar__ [data-active=\"true\"]{box-shadow:inset 4px 0 0 #1A1A1A!important;font-weight:700!important}";
			var STYLE_SKETCH = "html{background:#EEE9DF!important}body{background-image:repeating-linear-gradient(24deg,rgba(55,52,46,.035) 0 1px,transparent 1px 8px),repeating-linear-gradient(-29deg,rgba(55,52,46,.025) 0 1px,transparent 1px 11px)!important}__H_frame__{background:rgba(247,244,237,.9)!important}__H_sidebar__{background:repeating-linear-gradient(-35deg,rgba(45,43,39,.045) 0 1px,transparent 1px 8px),#E8E2D7!important;border-right:2px solid #3D3933!important;box-shadow:3px 0 0 rgba(61,57,51,.18),7px 0 0 rgba(61,57,51,.06)!important;position:relative}__H_sidebar__::before{content:\"SKETCHBOOK\";display:block;margin:13px 12px 8px;padding:5px 2px;border-bottom:2px solid #3D3933;color:#3D3933;font-family:\"LXGW WenKai\",cursive;font-size:16px;font-weight:700;letter-spacing:.08em;transform:rotate(-1.2deg)}__H_sidebar__::after{content:\"PAGE 01 · DSH\";display:block;margin:auto 12px 12px;padding-top:7px;border-top:1px dashed #6B665D;color:#6B665D;font-family:monospace;font-size:9px;letter-spacing:.16em}__H_sidebar__ button,__H_sidebar__ a{font-family:\"LXGW WenKai\",\"Noto Serif SC\",serif!important;transition:transform .14s ease,background .14s ease!important}__H_sidebar__ button:hover,__H_sidebar__ a:hover{background:rgba(61,57,51,.08)!important;transform:translateX(3px) rotate(-.4deg)}__H_sidebar__ [aria-current],__H_sidebar__ [aria-selected=\"true\"],__H_sidebar__ [data-active=\"true\"]{box-shadow:inset 3px 0 0 #3D3933!important;font-weight:700!important}__H_chatHeader__{background:rgba(247,244,237,.92)!important;border-bottom:1px solid #6B665D!important}__H_card__{background:rgba(252,250,245,.96)!important;border:1px solid #3D3933!important;border-radius:2px!important;box-shadow:2px 2px 0 rgba(61,57,51,.75),5px 4px 0 rgba(61,57,51,.16)!important;transform:rotate(-.18deg);transition:transform .18s ease,box-shadow .18s ease!important}__H_card__:hover{transform:rotate(.1deg) translateY(-2px)!important;box-shadow:3px 4px 0 rgba(61,57,51,.78),7px 7px 0 rgba(61,57,51,.14)!important}__H_card__::before{content:\"SKETCHBOOK / PAGE 01\";display:block;margin:-2px 10px 8px;padding-bottom:5px;border-bottom:1px dashed #6B665D;color:#5A554D;font-family:monospace;font-size:9px;letter-spacing:.2em}__H_primaryBtn__{background:#3D3933!important;color:#F7F4ED!important;border-radius:2px!important;box-shadow:2px 2px 0 #9B9386!important;transition:transform .12s ease!important}__H_primaryBtn__:active{transform:translate(2px,2px)!important}__H_markdownScroll__>*{border-left:1px solid rgba(61,57,51,.32);padding-left:8px;transition:transform .14s ease}__H_markdownScroll__>*:hover{transform:translateX(3px)}__H_markdownScroll__ img{filter:grayscale(100%) contrast(88%) sepia(18%)!important}@media(prefers-reduced-motion:reduce){__H_card__,__H_sidebar__ button,__H_sidebar__ a,__H_markdownScroll__>*{transition:none!important}}";
			// 预设里的字体同样本地优先：目标字体缺失时用同风格本地近似（如宋体/楷体/等宽），
			// 再兜底到公共字体栈，保证中文正文不缺字。调色板与 STYLE_* 视觉串不变。
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
			// 字体选项全部本地优先；像素/花体本机大概率没有，先给近似字体，再由公共兜底保证中英文不缺字。
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

			var presetById = function (id) {
				for (var i = 0; i < presets.length; i++) { if (presets[i][0] === id) return presets[i]; }
				return null;
			};

			var savePrefs = function () {
				if (quiet) return;
				var snap = {};
				Object.keys(tokens).forEach(function (k) { snap[k] = tokens[k]; });
				var data = {
					v: 1, preset: state.preset, main: state.main, accent: state.accent, neutral: state.neutral,
					label: state.label, cn: state.cn, en: state.en, bgOn: state.bgOn !== false, tokens: snap
				};
				storageSet(STORE_PREFS, JSON.stringify(data));
			};

			// 字体覆盖收窄：排除代码、图标字体、SVG/math，避免把等宽/图标一起改掉。
			var applyFont = function (cn, en) {
				state.cn = cn || null;
				state.en = en || null;
				drop("font");
				if (!cn && !en) { savePrefs(); return; }
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
				savePrefs();
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
				clearStyleLayers();
				applyTokens();
				savePrefs();
			};

			var applyNeutral = function (v) {
				state.preset = null; state.neutral = v;
				setTokens("--dsw-alias-bg-base", v);
				setTokens("--dsw-alias-bg-layer-1", v);
				setTokens("--dsw-alias-bg-layer-2", v);
				setTokens("--dsw-specific-sidebar-fill", v);
				clearStyleLayers();
				applyTokens();
				savePrefs();
			};

			var applyLabel = function (v) {
				state.preset = null; state.label = v;
				setTokens("--dsw-alias-label-primary", v);
				setTokens("--dsw-alias-label-secondary", v);
				setTokens("--dsw-alias-label-tertiary", v);
				clearStyleLayers();
				applyTokens();
				savePrefs();
			};

			var applyPreset = function (x) {
				state.preset = x[0]; state.main = null; state.accent = null; state.neutral = null; state.label = null;
				state.cn = x[6]; state.en = x[7];
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
				applyFont(state.cn, state.en);
				if (x[8]) layer.style = insertCss(x[8]);
				savePrefs();
			};

			var applyBg = function (save) {
				drop("bg");
				if (state.bg && state.bgOn !== false) {
					var u = state.bg;
					var l = "linear-gradient(rgba(255,255,255,.42),rgba(255,255,255,.42)),url(\"" + u + "\")";
					var d = "linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)),url(\"" + u + "\")";
					layer.bg = insertCss("html{background-color:var(--dsw-alias-bg-base)!important}body{background-image:" + l + "!important;background-position:center!important;background-size:cover!important;background-attachment:fixed!important;background-repeat:no-repeat!important}__H_frame__,__H_sidebarCol__,__H_centerCol__,__H_detailsCol__,__H_ledgerRoot__,__H_ledger__,__H_split__,__H_chatRoot__,__H_viewArea__,__H_scrollBody__,__H_composerSeat__,__H_composerStack__,__H_markdownRoot__,__H_markdownScroll__,__H_paneRoot__{background-color:transparent!important;background-image:none!important}__H_sidebar__{background-color:transparent!important}__H_overlayRoot__{background-color:var(--dsw-alias-bg-layer-1)!important;background-image:none!important}@media(prefers-color-scheme:dark){body{background-image:" + d + "!important}}html body [role=dialog][aria-modal=true],html body dialog[open],__H_centerCol__ [role=dialog],__H_ledgerRoot__ [role=dialog]{background:var(--dsw-alias-bg-layer-1)!important;background-image:none!important;backdrop-filter:none!important}");
				}
				if (save) savePrefs();
			};

			var compressImage = function (src, maxEdge, quality, done) {
				try {
					var img = new Image();
					img.onload = function () {
						try {
							var w = img.naturalWidth || img.width;
							var h = img.naturalHeight || img.height;
							if (!w || !h) { done(null); return; }
							var scale = Math.min(1, maxEdge / Math.max(w, h));
							var cw = Math.max(1, Math.round(w * scale));
							var ch = Math.max(1, Math.round(h * scale));
							var canvas = document.createElement("canvas");
							canvas.width = cw;
							canvas.height = ch;
							var g = canvas.getContext("2d");
							if (!g) { done(null); return; }
							g.drawImage(img, 0, 0, cw, ch);
							done(canvas.toDataURL("image/jpeg", quality));
						} catch (e) { done(null); }
					};
					img.onerror = function () { done(null); };
					img.src = src;
				} catch (e) { done(null); }
			};

			var storeBg = function (url, done) {
				var finish = function () {
					applyBg(true);
					if (done) done();
				};
				var commit = function (finalUrl) {
					state.bg = finalUrl;
					if (storageSet(STORE_BG, finalUrl)) {
						state.bgPersisted = true;
						finish();
						return;
					}
					// 配额不足：先尝试再压一档；仍写不进去就只保留本次会话（界面仍可用）。
					storageDel(STORE_BG);
					compressImage(finalUrl, 1280, 0.62, function (retry) {
						if (retry && retry.length < finalUrl.length && storageSet(STORE_BG, retry)) {
							state.bg = retry;
							state.bgPersisted = true;
						} else {
							state.bgPersisted = false;
							storageDel(STORE_BG);
						}
						finish();
					});
				};
				if (url.length <= MAX_BG_CHARS) { commit(url); return; }
				compressImage(url, 1920, 0.82, function (small) {
					if (!small) { commit(url); return; }
					if (small.length <= MAX_BG_CHARS) { commit(small); return; }
					compressImage(url, 1280, 0.7, function (smaller) { commit(smaller || small); });
				});
			};

			var upload = function (f, done) {
				if (!f) { if (done) done(); return; }
				try {
					var r = new FileReader();
					r.onload = function () { storeBg(String(r.result || ""), done); };
					r.onerror = function () { if (done) done(); };
					r.readAsDataURL(f);
				} catch (e) { if (done) done(); }
			};

			var clearBackground = function () {
				state.bg = null;
				state.bgPersisted = true;
				storageDel(STORE_BG);
				applyBg(true);
			};

			var restoreState = function () {
				quiet = true;
				try {
					var raw = storageGet(STORE_PREFS);
					var data = null;
					if (raw) { try { data = JSON.parse(raw); } catch (e) { data = null; } }
					if (data && typeof data === "object") {
						state.preset = typeof data.preset === "string" ? data.preset : null;
						state.main = typeof data.main === "string" ? data.main : null;
						state.accent = typeof data.accent === "string" ? data.accent : null;
						state.neutral = typeof data.neutral === "string" ? data.neutral : null;
						state.label = typeof data.label === "string" ? data.label : null;
						state.cn = typeof data.cn === "string" ? data.cn : null;
						state.en = typeof data.en === "string" ? data.en : null;
						state.bgOn = data.bgOn !== false;
						Object.keys(tokens).forEach(function (k) { delete tokens[k]; });
						if (data.tokens && typeof data.tokens === "object") {
							Object.keys(data.tokens).forEach(function (k) { if (typeof data.tokens[k] === "string") tokens[k] = data.tokens[k]; });
						}
					}
					var storedBg = storageGet(STORE_BG);
					if (storedBg) { state.bg = storedBg; state.bgPersisted = true; }
					clearStyleLayers();
					applyTokens();
					var p = presetById(state.preset);
					if (p && p[8]) layer.style = insertCss(p[8]);
					if (state.main) layer.root = insertCss(rootCssFor(state.main));
					if (state.cn || state.en) applyFont(state.cn, state.en);
					applyBg(false);
				} finally {
					quiet = false;
				}
			};

			var resetAll = function () {
				quiet = true;
				try {
					storageDel(STORE_PREFS);
					storageDel(STORE_BG);
					state.preset = null; state.main = null; state.accent = null; state.neutral = null; state.label = null;
					state.cn = null; state.en = null; state.bg = null; state.bgOn = true; state.bgPersisted = true;
					Object.keys(tokens).forEach(function (k) { delete tokens[k]; });
					drop("tokens");
					clearStyleLayers();
					drop("font");
					drop("bg");
				} finally {
					quiet = false;
				}
			};

			var mark = function () { return React.createElement("span", { className: "skc-mark" }, "✓"); };
			var sq = function (v, t, on, fn) {
				return React.createElement("button", {
					key: t, type: "button", className: "skc-square" + (on ? " skc-on" : ""), title: t,
					"aria-label": t, "aria-pressed": !!on, style: { background: v },
					onClick: function () { fn(v); }
				}, on ? mark() : null);
			};
			var custom = function (t, fn) {
				return React.createElement("label", { key: t, className: "skc-square skc-custom", title: t },
					React.createElement("span", { className: "skc-plus" }, "+"),
					React.createElement("input", { type: "color", "aria-label": t, onChange: function (e) { fn(e.target.value); } }));
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
				var p = React.useState(state.preset), m = React.useState(state.main), a = React.useState(state.accent), n = React.useState(state.neutral), l = React.useState(state.label), cn = React.useState(state.cn), en = React.useState(state.en), b = React.useState(state.bgOn !== false), rev = React.useState(0);
				var refresh = function () { rev[1](function (x) { return x + 1; }); };
				var cp = function (x) { p[1](x[0]); m[1](null); a[1](null); n[1](null); l[1](null); cn[1](x[6]); en[1](x[7]); applyPreset(x); };
				var cm = function (v) { p[1](null); m[1](v); applyColor(v); };
				var ca = function (v) { p[1](null); a[1](v); applyAccent(v); };
				var cnPick = function (v) { p[1](null); n[1](v); applyNeutral(v); };
				var lb = function (v) { p[1](null); l[1](v); applyLabel(v); };
				var ccn = function (v) { cn[1](v); applyFont(v, state.en); };
				var cen = function (v) { en[1](v); applyFont(state.cn, v); };
				var onFile = function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ""; upload(f, refresh); };
				var onClearBg = function () { clearBackground(); refresh(); };
				var onReset = function () {
					resetAll();
					p[1](null); m[1](null); a[1](null); n[1](null); l[1](null); cn[1](null); en[1](null); b[1](true);
					refresh();
				};
				var onBgToggle = function (e) { state.bgOn = e.target.checked; b[1](e.target.checked); applyBg(true); };
				var up = React.createElement("label", { key: "upload", className: "skc-square skc-upload", title: "上传背景图片" },
					React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, "aria-hidden": "true" },
						React.createElement("path", { d: "M12 16V4" }),
						React.createElement("path", { d: "m7 9 5-5 5 5" }),
						React.createElement("path", { d: "M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" })),
					React.createElement("input", { type: "file", accept: "image/*", "aria-label": "上传背景图片", onChange: onFile }));
				var firstPicker = function (value, title, fn) {
					return React.createElement("label", { key: title, className: "skc-first-picker", title: title, style: { background: value || "linear-gradient(135deg,#ffd900,#ff7a00,#3ee6e0,#8b5cf6)" } },
						React.createElement("input", { type: "color", "aria-label": title, value: value || "#ffffff", onChange: function (e) { fn(e.target.value); } }));
				};
				var bgToggle = React.createElement("label", { key: "bgswitch", className: "skc-bgtoggle", title: "关闭后恢复标准背景" },
					React.createElement("input", { type: "checkbox", checked: b[0], "aria-label": "图片背景开关", onChange: onBgToggle }),
					React.createElement("span", null, "图片背景"));
				var clearBgBtn = React.createElement("button", { key: "clearbg", type: "button", className: "skc-btn", onClick: onClearBg, disabled: !state.bg }, "清除背景图");
				var resetBtn = React.createElement("button", { key: "reset", type: "button", className: "skc-btn", onClick: onReset }, "恢复默认");
				var bgHint = state.bg && state.bgPersisted === false ? React.createElement("div", { key: "bghint", className: "skc-hint" }, "背景图较大，已自动压缩；浏览器存储空间不足时仅在本次会话生效。") : null;
				return React.createElement("div", { className: "skc-page" }, [
					React.createElement("div", { className: "skc-title", key: "t" }, "外观皮肤"),
					React.createElement("div", { className: "skc-section", key: "p" }, "预设风格 · 组合控制"),
					row(presets.map(function (x) {
						return React.createElement("button", {
							key: x[0], type: "button", className: "skc-preset" + (p[0] === x[0] ? " skc-on" : ""), title: x[1],
							"aria-label": x[1], "aria-pressed": p[0] === x[0],
							style: { background: "linear-gradient(135deg," + x[2] + "," + x[3] + ")", color: x[4] },
							onClick: function () { cp(x); }
						}, x[1], p[0] === x[0] ? mark() : null);
					})),
					React.createElement("div", { className: "skc-section", key: "b" }, "背景配置"),
					row([bgToggle, up, clearBgBtn]),
					bgHint,
					React.createElement("div", { className: "skc-section", key: "m" }, "主色配置"),
					row([].concat([firstPicker(m[0], "自由选择主色", cm)], main.slice(1).map(function (v, i) { return sq(v, "主色" + (i + 1), m[0] === v, cm); })), custom("自定义主色", cm)),
					React.createElement("div", { className: "skc-section", key: "a" }, "辅助色配置"),
					row([].concat([firstPicker(a[0], "自由选择辅助色", ca)], accent.slice(1).map(function (v, i) { return sq(v, "辅助色" + (i + 1), a[0] === v, ca); })), custom("自定义辅助色", ca)),
					React.createElement("div", { className: "skc-section", key: "n" }, "中性色配置"),
					row([].concat([firstPicker(n[0], "自由选择中性色", cnPick)], neutral.slice(1).map(function (v, i) { return sq(v, "中性色" + (i + 1), n[0] === v, cnPick); })), custom("自定义中性色", cnPick)),
					React.createElement("div", { className: "skc-section", key: "lb" }, "字体颜色配置"),
					row([].concat([firstPicker(l[0], "自由选择字体颜色", lb)], label.slice(1).map(function (v, i) { return sq(v, "字体色" + (i + 1), l[0] === v, lb); })), custom("自定义字体色", lb)),
					React.createElement("div", { className: "skc-section", key: "cn" }, "中文字体"),
					row(fontsCn.map(function (x) { return ft(x[1], x[0], cn[0] === x[1], ccn); })),
					React.createElement("div", { className: "skc-section", key: "en" }, "英文字体"),
					row(fontsEn.map(function (x) { return ft(x[1], x[0], en[0] === x[1], cen); })),
					React.createElement("div", { className: "skc-actions", key: "actions" }, [resetBtn])
				]);
			}

			restoreState();

			slotsSvc.inject("settings.section", function () {
				return slotsSvc.register({ name: "settings.section", id: "skinc-page", order: 31, label: "外观皮肤" }, function () { return React.createElement(Page); });
			});

			ctx.effect(function () {
				return function () {
					css();
					drop("tokens");
					drop("root");
					drop("style");
					drop("font");
					drop("bg");
				};
			});
		}

		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});
