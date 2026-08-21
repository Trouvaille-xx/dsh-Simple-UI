window.__ModuleLoader__.load({
	id: "dsh-skin-longterm",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		var React = require("react");

		var SKINS = /*__SKINS_DATA__*/[{"id":"stardew-valley","name":"星露谷 · 像素田园","scheme":"light","tokens":{"--dsw-alias-bg-base":"#F7F1DC","--dsw-alias-bg-layer-1":"#FDF9EA","--dsw-alias-bg-layer-2":"#F6ECD0","--dsw-alias-bg-overlay":"#FCF7E8","--dsw-alias-border-l1":"rgba(74,59,42,0.10)","--dsw-alias-border-l2":"rgba(74,59,42,0.18)","--dsw-alias-brand-primary":"#D9B061","--dsw-alias-label-primary":"#4A3B2A","--dsw-alias-label-secondary":"#6B5636","--dsw-alias-state-error-primary":"#C0392B","--dsw-alias-state-success-primary":"#7CB85F","--dsw-alias-state-warn-primary":"#E3C47A","--dsw-specific-sidebar-fill":"#F5EAD2"}},{"id":"winter-festival","name":"冬星节 · 冬日","scheme":"light","tokens":{"--dsw-alias-bg-base":"#EDF3F8","--dsw-alias-bg-layer-1":"#F5FAFF","--dsw-alias-bg-layer-2":"#E3EDF5","--dsw-alias-bg-overlay":"#EFF5FA","--dsw-alias-border-l1":"rgba(43,52,66,0.14)","--dsw-alias-border-l2":"rgba(43,52,66,0.24)","--dsw-alias-brand-primary":"#74B5D6","--dsw-alias-label-primary":"#2B3442","--dsw-alias-label-secondary":"#5A6B7E","--dsw-alias-state-error-primary":"#D64545","--dsw-alias-state-success-primary":"#4A7C59","--dsw-alias-state-warn-primary":"#FF8C42","--dsw-specific-sidebar-fill":"#D8E2EC"}},{"id":"spring-bloom","name":"春季 · 播种季","scheme":"light","tokens":{"--dsw-alias-bg-base":"#EDF3F6","--dsw-alias-bg-layer-1":"#F7FAF7","--dsw-alias-bg-layer-2":"#E4EBED","--dsw-alias-bg-overlay":"#F1F5F4","--dsw-alias-border-l1":"rgba(70,55,21,0.14)","--dsw-alias-border-l2":"rgba(70,55,21,0.24)","--dsw-alias-brand-primary":"#D9A8B5","--dsw-alias-label-primary":"#2E3A42","--dsw-alias-label-secondary":"#5A6B7E","--dsw-alias-state-error-primary":"#B97A8C","--dsw-alias-state-success-primary":"#86B57A","--dsw-alias-state-warn-primary":"#D8C078","--dsw-specific-sidebar-fill":"#E3EAEE"}},{"id":"retro-crt","name":"复古终端 · CRT","scheme":"dark","tokens":{"--dsw-alias-bg-base":"#080D08","--dsw-alias-bg-layer-1":"#0C130C","--dsw-alias-bg-layer-2":"#0E160E","--dsw-alias-bg-overlay":"#0D120D","--dsw-alias-border-l1":"rgba(51,255,102,0.10)","--dsw-alias-border-l2":"rgba(51,255,102,0.18)","--dsw-alias-brand-primary":"#33FF66","--dsw-alias-label-primary":"#D7FFE0","--dsw-alias-label-secondary":"#8FE8A8","--dsw-alias-state-error-primary":"#FF5A4E","--dsw-alias-state-success-primary":"#33FF66","--dsw-alias-state-warn-primary":"#FFB000","--dsw-specific-sidebar-fill":"#050805"}},{"id":"neon-arcade","name":"街机 · 霓虹","scheme":"dark","tokens":{"--dsw-alias-bg-base":"#0C0824","--dsw-alias-bg-layer-1":"#140D36","--dsw-alias-bg-layer-2":"#18103E","--dsw-alias-bg-overlay":"#100A2E","--dsw-alias-border-l1":"rgba(124,92,240,0.14)","--dsw-alias-border-l2":"rgba(124,92,240,0.24)","--dsw-alias-brand-primary":"#22D3EE","--dsw-alias-label-primary":"#EFEAFE","--dsw-alias-label-secondary":"#A79FD0","--dsw-alias-state-error-primary":"#FB7185","--dsw-alias-state-success-primary":"#4ADE80","--dsw-alias-state-warn-primary":"#FDE047","--dsw-specific-sidebar-fill":"#0C0824"}}];

		function insertCss(css) {
			var tag = document.createElement("style");
			tag.textContent = css;
			document.head.appendChild(tag);
			return function () { if (tag.parentNode) tag.parentNode.removeChild(tag); };
		}

		var BASE_CSS = "@import url(\"https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;700&family=LXGW+WenKai:wght@400;700&family=ZCOOL+KuaiLe&family=DotGothic16&family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap\");" +
			"@font-face{font-family:\"Fusion Pixel SC\";font-style:normal;font-display:swap;font-weight:400;src:url(\"https://cdn.jsdelivr.net/fontsource/fonts/fusion-pixel-12px-proportional-sc@5.3.0/latin-400-normal.woff2\") format(\"woff2\")}" +
			".skc-page{display:flex;flex-direction:column;gap:12px;padding:16px 4px;color:var(--dsw-alias-label-primary)}" +
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
			".skc-custom .skc-plus{color:#fff;font-size:22px;font-weight:700;line-height:1;text-shadow:0 1px 2px rgba(0,0,0,.6);pointer-events:none}" +
			".skc-custom input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:0;padding:0}" +
			".skc-first-picker{position:relative;width:44px;height:44px;min-width:44px;display:flex;align-items:center;justify-content:center;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;cursor:pointer;overflow:hidden;box-shadow:inset 0 0 0 2px rgba(255,255,255,.22)}.skc-first-picker::after{content:'↗';position:absolute;right:2px;bottom:0;color:#fff;font-size:11px;font-weight:700;text-shadow:0 1px 2px #000;pointer-events:none}.skc-first-picker input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:0;padding:0}";

		var inject = ["theme", "slots"];

		function apply(ctx) {
			var theme = ctx.theme || ctx.get("theme");
			var slotsSvc = ctx.slots || ctx.get("slots");
			if (!theme || !slotsSvc) return;
			var unreg = SKINS.map(function (s) {
				return theme.register({ id: s.id, colorScheme: s.scheme, tokens: s.tokens || {} });
			});

			var state = { preset: null, main: null, accent: null, neutral: null, label: null, cn: null, en: null, bg: null, bgOn: true };
			var css = insertCss(BASE_CSS);

			var colorLayer = null, bg = null, fontCss = null, colorCss = null, styleLayer = null;
			var clearStyle = function () { if (styleLayer) { styleLayer(); styleLayer = null; } };
			var tok = function (v) { return { light: v, dark: v }; };
			var tokens = {};
			var setTokens = function (k, v) { tokens[k] = v; };
			var applyTokens = function () {
				if (colorLayer) colorLayer();
				var y = {};
				Object.keys(tokens).forEach(function (k) { y[k] = tok(tokens[k]); });
				if (Object.keys(y).length) colorLayer = theme.overrideTokens("dsh-skin-longterm", y);
			};

			var applyColor = function (v) {
				clearStyle();
				state.preset = null; state.main = v;
				["--dsw-alias-brand-primary", "--dsw-alias-brand-text", "--dsw-alias-button-primary-fill", "--dsw-alias-button-primary-hover", "--dsw-alias-button-info-fill", "--dsw-alias-button-info-hover", "--dsw-alias-state-business-primary", "--dsw-specific-sidebar-nav-item-active-accent"].forEach(function (k) { setTokens(k, v); });
				applyTokens();
				if (colorCss) colorCss();
				colorCss = insertCss(":root{--dsw-alias-brand-primary:" + v + "!important;--dsw-alias-brand-text:" + v + "!important;--dsw-alias-button-primary-fill:" + v + "!important;--dsw-alias-button-primary-hover:" + v + "!important;--dsw-alias-button-info-fill:" + v + "!important;--dsw-alias-button-info-hover:" + v + "!important;--dsw-alias-state-business-primary:" + v + "!important;--dsw-specific-sidebar-nav-item-active-accent:" + v + "!important}");
			};

			var applyAccent = function (v) {
				clearStyle();
				state.preset = null; state.accent = v;
				setTokens("--dsw-specific-sidebar-nav-item-active", v);
				applyTokens();
			};

			var applyNeutral = function (v) {
				clearStyle();
				state.preset = null; state.neutral = v;
				setTokens("--dsw-alias-bg-base", v);
				setTokens("--dsw-alias-bg-layer-1", v);
				setTokens("--dsw-alias-bg-layer-2", v);
				setTokens("--dsw-specific-sidebar-fill", v);
				applyTokens();
			};

			var applyLabel = function (v) {
				clearStyle();
				state.preset = null; state.label = v;
				setTokens("--dsw-alias-label-primary", v);
				setTokens("--dsw-alias-label-secondary", v);
				setTokens("--dsw-alias-label-tertiary", v);
				applyTokens();
			};

			var applyPreset = function (x) {
				clearStyle();
				state.preset = x[0]; state.main = null; state.accent = null; state.neutral = null;
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
				applyTokens();
				applyFont(x[6], x[7]);
				if (x[8]) styleLayer = insertCss(x[8]);
			};

			var applyFont = function (cn, en) {
				if (fontCss) fontCss();
				fontCss = insertCss(":root{--dsw-font-family:" + (cn || "system-ui") + "," + (en || "sans-serif") + ",sans-serif!important;--ds-font-family-code:" + (en || "monospace") + ",monospace!important}body{font-family:" + (cn || "system-ui") + "," + (en || "sans-serif") + ",sans-serif!important}body>div,body>div *{font-family:" + (cn || "system-ui") + "," + (en || "sans-serif") + ",sans-serif!important}code,pre{font-family:" + (en || "monospace") + ",monospace!important}");
			};

			var applyBg = function () {
				if (!state.bg || state.bgOn === false) { if (bg) { bg(); bg = null; } return; }
				var u = state.bg;
				var l = "linear-gradient(rgba(255,255,255,.42),rgba(255,255,255,.42)),url(\"" + u + "\")";
				var d = "linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)),url(\"" + u + "\")";
				if (bg) bg();
				bg = insertCss("html{background-color:var(--dsw-alias-bg-base)!important}body{background-image:" + l + "!important;background-position:center!important;background-size:cover!important;background-attachment:fixed!important;background-repeat:no-repeat!important}.pI_x6G_frame,.pI_x6G_sidebarCol,.pI_x6G_centerCol,.pI_x6G_detailsCol,.qBU-ya_root,.qBU-ya_ledger,.Y0dWHa_split,.wSkVaW_root,.wSkVaW_viewArea,.wSkVaW_scrollBody,.wSkVaW_composerSeat,.wSkVaW_composerStack,.Md3f7G_root,.Md3f7G_scroll,.ydkMvW_root{background-color:transparent!important;background-image:none!important}.hHd-Xa_root{background-color:transparent!important}.fV0t5q_root{background-color:var(--dsw-alias-bg-layer-1)!important;background-image:none!important}@media(prefers-color-scheme:dark){body{background-image:" + d + "!important}}html body [role=dialog][aria-modal=true],.pI_x6G_centerCol [role=dialog],.qBU-ya_root [role=dialog]{background:var(--dsw-alias-bg-layer-1)!important;background-image:none!important;backdrop-filter:none!important}");
			};

			var upload = function (f) {
				if (!f) return;
				var r = new FileReader();
				r.onload = function () { state.bg = String(r.result); applyBg(); };
				r.readAsDataURL(f);
			};

			var mark = function () { return React.createElement("span", { className: "skc-mark" }, "✓"); };
			var sq = function (v, t, on, fn) { return React.createElement("button", { key: t, className: "skc-square" + (on ? " skc-on" : ""), title: t, style: { background: v }, onClick: function () { fn(v); } }, on ? mark() : null); };
			var custom = function (t, fn) { return React.createElement("label", { key: t, className: "skc-square skc-custom", title: t }, React.createElement("span", { className: "skc-plus" }, "+"), React.createElement("input", { type: "color", onChange: function (e) { fn(e.target.value); } })); };
			var ft = function (v, t, on, fn) { return React.createElement("button", { key: t, className: "skc-font" + (on ? " skc-on" : ""), title: t, style: { fontFamily: v }, onClick: function () { fn(v); } }, t, on ? mark() : null); };
			var row = function (x) { return React.createElement("div", { className: "skc-row" }, x); };
			var STYLE_GOV = "body::after{content:\"\";position:fixed;left:0;right:0;top:0;height:5px;background:linear-gradient(90deg,#A00810,#D93A3F);z-index:2147483000;pointer-events:none}.hHd-Xa_root{border-right:1px solid rgba(190,10,16,.16)!important}.uV2eYG_card{border-top:3px solid #BE0A10!important;border-radius:6px!important;box-shadow:0 2px 10px rgba(0,0,0,.07)!important}.uV2eYG_card::after{content:\"红白页\";position:absolute;right:16px;top:6px;transform:rotate(8deg);font-size:11px;line-height:1;color:#BE0A10;border:2px solid rgba(190,10,16,.5);border-radius:4px;padding:3px 5px;opacity:.75;pointer-events:none;font-weight:700}.wSkVaW_header{border-bottom:2px solid #BE0A10!important;background:linear-gradient(180deg,#FFFFFF,#FAF5F4)!important}h1,h2,h3,h4{font-family:\"Noto Serif SC\",\"SimSun\",serif!important;letter-spacing:.02em}button{transition:transform .12s ease,box-shadow .12s ease!important}button:active{transform:translateY(1px)!important}";
			var STYLE_NIGHTCITY = "html{background:#080808!important}.pI_x6G_frame{background:linear-gradient(135deg,#080808 0%,#17120b 52%,#120616 100%)!important}.hHd-Xa_root{background:linear-gradient(180deg,#080808,#181007)!important;border-right:3px solid #FCEE0A!important;position:relative}.hHd-Xa_root::before{content:\"NIGHT CITY // 2077\";display:block;margin:12px 10px 7px;padding:7px 8px;background:#FCEE0A;color:#080808;font-family:monospace;font-size:11px;font-weight:900;letter-spacing:.13em;clip-path:polygon(0 0,100% 0,94% 100%,0 100%)}.hHd-Xa_root::after{content:\"NET.STATUS : ONLINE\";display:block;margin:auto 10px 12px;padding-top:8px;border-top:1px solid rgba(252,238,10,.65);color:#FCEE0A;font-family:monospace;font-size:9px;letter-spacing:.18em}.hHd-Xa_root button,.hHd-Xa_root a{border-left:3px solid transparent!important;transition:transform .16s ease,background .16s ease,border-color .16s ease!important}.hHd-Xa_root button:hover,.hHd-Xa_root a:hover{background:#FCEE0A!important;color:#080808!important;border-left-color:#FF2A86!important;transform:translateX(5px) skewX(-4deg)}.wSkVaW_header{background:rgba(8,8,8,.96)!important;border-bottom:2px solid #FCEE0A!important}.wSkVaW_tab:after{background:#FCEE0A!important}.uV2eYG_card{background:linear-gradient(110deg,#11110d,#1a100d 70%,#170817)!important;border:1px solid #FCEE0A!important;border-left:5px solid #FCEE0A!important;box-shadow:7px 7px 0 #FF2A86,0 0 24px rgba(252,238,10,.18)!important}.uV2eYG_card::before{content:\"// CHANNEL_01 · INPUT READY\";display:block;margin:-2px 12px 7px;padding-bottom:5px;border-bottom:1px solid rgba(252,238,10,.75);color:#FCEE0A;font-family:monospace;font-size:10px;letter-spacing:.2em}.uV2eYG_primary{background:#FCEE0A!important;color:#080808!important;border-radius:0!important;box-shadow:3px 3px 0 #FF2A86!important;transition:transform .14s ease,box-shadow .14s ease!important}.uV2eYG_primary:hover:not(:disabled){background:#FFF45C!important;transform:translate(-2px,-2px)!important;box-shadow:5px 5px 0 #FF2A86!important}.Md3f7G_scroll>*{border-left:2px solid rgba(252,238,10,.25);padding-left:8px;transition:transform .18s ease,border-color .18s ease;animation:skcCyberIn .32s cubic-bezier(.2,.8,.2,1)}.Md3f7G_scroll>*:hover{border-left-color:#FF2A86;transform:translateX(4px)}@keyframes skcCyberIn{from{opacity:0;transform:translateX(-10px);filter:brightness(1.8)}to{opacity:1;transform:none;filter:brightness(1)}}@keyframes skcCyberScan{0%{transform:translateY(-120px);opacity:0}12%{opacity:1}88%{opacity:1}100%{transform:translateY(110vh);opacity:0}}body::after{content:\"\";position:fixed;left:0;right:0;top:0;height:100px;background:linear-gradient(180deg,transparent,rgba(252,238,10,.07),transparent);animation:skcCyberScan 6s linear infinite;pointer-events:none;z-index:2147482000}button:focus-visible,a:focus-visible{outline:2px solid #FCEE0A!important;outline-offset:3px!important}@media(prefers-reduced-motion:reduce){body::after,.Md3f7G_scroll>*{animation:none!important}.hHd-Xa_root button,.hHd-Xa_root a,.uV2eYG_primary{transition:none!important}}.hHd-Xa_root{background:linear-gradient(145deg,rgba(252,238,10,.12) 0 2%,transparent 2% 42%,rgba(255,42,134,.12) 42% 43%,transparent 43%),repeating-linear-gradient(0deg,transparent 0 23px,rgba(252,238,10,.07) 24px),linear-gradient(180deg,#080808,#181007)!important;box-shadow:inset -1px 0 rgba(255,42,134,.8)!important}.wSkVaW_root{position:relative;isolation:isolate}.wSkVaW_root::before{content:\"\";position:absolute;inset:15px 18px 86px;border:1px solid rgba(252,238,10,.22);clip-path:polygon(0 0,24px 0,24px 2px,calc(100% - 24px) 2px,calc(100% - 24px) 0,100% 0,100% 22px,calc(100% - 2px) 22px,calc(100% - 2px) calc(100% - 22px),100% calc(100% - 22px),100% 100%,calc(100% - 24px) 100%,calc(100% - 24px) calc(100% - 2px),24px calc(100% - 2px),24px 100%,0 100%,0 calc(100% - 22px),2px calc(100% - 22px),2px 22px,0 22px);pointer-events:none;z-index:5}.wSkVaW_composerSeat{position:relative}.wSkVaW_composerSeat::after{content:\"\";position:absolute;right:94px;top:-11px;width:92px;height:21px;background:linear-gradient(90deg,#FCEE0A 0 8%,transparent 8% 12%,#FF2A86 12% 25%,transparent 25% 29%,#FCEE0A 29% 47%,transparent 47% 51%,#FF2A86 51% 58%,transparent 58% 62%,#FCEE0A 62% 83%,transparent 83% 87%,#FF2A86 87% 100%);clip-path:polygon(0 45%,7% 45%,7% 10%,18% 10%,18% 65%,32% 65%,32% 0,49% 0,49% 42%,61% 42%,61% 18%,74% 18%,74% 70%,87% 70%,87% 32%,100% 32%,100% 100%,0 100%);filter:drop-shadow(0 0 4px rgba(252,238,10,.55));pointer-events:none}.wSkVaW_header{background-image:repeating-linear-gradient(90deg,transparent 0 18px,rgba(252,238,10,.32) 19px 20px)!important;background-size:auto 2px!important;background-repeat:repeat-x!important;background-position:left bottom!important}";
			var STYLE_NEWS = "*,*::before,*::after{border-radius:0!important}.uV2eYG_card{border:1px solid #1A1A1A!important;box-shadow:5px 5px 0 rgba(26,26,26,.85)!important}.uV2eYG_card::before{content:\"THE DAILY DSH · 晨报\";display:block;text-align:center;font-family:\"Noto Serif SC\",\"SimSun\",serif;font-size:11px;letter-spacing:.35em;color:#1A1A1A;border-bottom:1px solid #1A1A1A;padding-bottom:5px;margin:-4px 10px 10px}.Md3f7G_scroll p{text-align:justify!important}.Md3f7G_scroll a{text-decoration:underline!important;text-underline-offset:2px}.Md3f7G_scroll img{filter:grayscale(100%) contrast(105%)!important}button{transition:transform .1s ease!important}button:active{transform:translate(1px,1px)!important}.hHd-Xa_root{border-right:1px solid #1A1A1A!important;background:#F5F0E3!important}.hHd-Xa_root::before{content:\"\";display:block;height:7px;border-top:1px solid #1A1A1A;border-bottom:3px double #1A1A1A;margin:10px 12px 4px}.hHd-Xa_root::after{content:\"DSH 晨报 · 第壹版\";display:block;text-align:center;font-family:\"Noto Serif SC\",\"SimSun\",serif;font-size:10px;letter-spacing:.28em;color:#1A1A1A;border-top:1px solid #1A1A1A;padding:8px 0;margin:auto 12px 10px}.hHd-Xa_root button,.hHd-Xa_root a{font-family:\"Noto Serif SC\",\"SimSun\",serif!important}.hHd-Xa_root button:hover{background:rgba(26,26,26,.06)!important;text-decoration:underline!important;text-underline-offset:3px}.hHd-Xa_root [aria-current],.hHd-Xa_root [aria-selected=\"true\"],.hHd-Xa_root [data-active=\"true\"]{box-shadow:inset 4px 0 0 #1A1A1A!important;font-weight:700!important}";
			var STYLE_SKETCH = "html{background:#EEE9DF!important}body{background-image:repeating-linear-gradient(24deg,rgba(55,52,46,.035) 0 1px,transparent 1px 8px),repeating-linear-gradient(-29deg,rgba(55,52,46,.025) 0 1px,transparent 1px 11px)!important}.pI_x6G_frame{background:rgba(247,244,237,.9)!important}.hHd-Xa_root{background:repeating-linear-gradient(-35deg,rgba(45,43,39,.045) 0 1px,transparent 1px 8px),#E8E2D7!important;border-right:2px solid #3D3933!important;box-shadow:3px 0 0 rgba(61,57,51,.18),7px 0 0 rgba(61,57,51,.06)!important;position:relative}.hHd-Xa_root::before{content:\"SKETCHBOOK\";display:block;margin:13px 12px 8px;padding:5px 2px;border-bottom:2px solid #3D3933;color:#3D3933;font-family:\"LXGW WenKai\",cursive;font-size:16px;font-weight:700;letter-spacing:.08em;transform:rotate(-1.2deg)}.hHd-Xa_root::after{content:\"PAGE 01 · DSH\";display:block;margin:auto 12px 12px;padding-top:7px;border-top:1px dashed #6B665D;color:#6B665D;font-family:monospace;font-size:9px;letter-spacing:.16em}.hHd-Xa_root button,.hHd-Xa_root a{font-family:\"LXGW WenKai\",\"Noto Serif SC\",serif!important;transition:transform .14s ease,background .14s ease!important}.hHd-Xa_root button:hover,.hHd-Xa_root a:hover{background:rgba(61,57,51,.08)!important;transform:translateX(3px) rotate(-.4deg)}.hHd-Xa_root [aria-current],.hHd-Xa_root [aria-selected=\"true\"],.hHd-Xa_root [data-active=\"true\"]{box-shadow:inset 3px 0 0 #3D3933!important;font-weight:700!important}.wSkVaW_header{background:rgba(247,244,237,.92)!important;border-bottom:1px solid #6B665D!important}.uV2eYG_card{background:rgba(252,250,245,.96)!important;border:1px solid #3D3933!important;border-radius:2px!important;box-shadow:2px 2px 0 rgba(61,57,51,.75),5px 4px 0 rgba(61,57,51,.16)!important;transform:rotate(-.18deg);transition:transform .18s ease,box-shadow .18s ease!important}.uV2eYG_card:hover{transform:rotate(.1deg) translateY(-2px)!important;box-shadow:3px 4px 0 rgba(61,57,51,.78),7px 7px 0 rgba(61,57,51,.14)!important}.uV2eYG_card::before{content:\"SKETCHBOOK / PAGE 01\";display:block;margin:-2px 10px 8px;padding-bottom:5px;border-bottom:1px dashed #6B665D;color:#5A554D;font-family:monospace;font-size:9px;letter-spacing:.2em}.uV2eYG_primary{background:#3D3933!important;color:#F7F4ED!important;border-radius:2px!important;box-shadow:2px 2px 0 #9B9386!important;transition:transform .12s ease!important}.uV2eYG_primary:active{transform:translate(2px,2px)!important}.Md3f7G_scroll>*{border-left:1px solid rgba(61,57,51,.32);padding-left:8px;transition:transform .14s ease}.Md3f7G_scroll>*:hover{transform:translateX(3px)}.Md3f7G_scroll img{filter:grayscale(100%) contrast(88%) sepia(18%)!important}@media(prefers-reduced-motion:reduce){.uV2eYG_card,.hHd-Xa_root button,.hHd-Xa_root a,.Md3f7G_scroll>*{transition:none!important}}";


			var presets = [
				["claude", "[CC]", "#FAF9F5", "#FFFFFF", "#3D3929", "#C96442", "\"Noto Sans SC\"", "Inter"],
				["apple", "Apple 银灰", "#F5F5F7", "#FFFFFF", "#1D1D1F", "#007AFF", "\"PingFang SC\"", "\"SF Pro Display\""],
				["deep", "深空蓝终端", "#0B1E33", "#122840", "#E8EFF7", "#4D6BFE", "system-ui", "\"JetBrains Mono\""],
				["neon", "霓虹黑紫", "#120B24", "#231443", "#F4EAFE", "#EC4899", "system-ui", "Silkscreen"],
				["nightcity", "夜之城 2077", "#080808", "#15110B", "#F5F1D8", "#FCEE0A", "\"Noto Sans SC\"", "\"JetBrains Mono\"", STYLE_NIGHTCITY],
    ["gov", "红白页", "#F5F6F8", "#FFFFFF", "#262626", "#BE0A10", "\"Noto Serif SC\"", "\"Source Sans 3\"", STYLE_GOV],
				["news", "报纸版面", "#F7F3E9", "#FDFBF3", "#1A1A1A", "#1A1A1A", "\"Noto Serif SC\"", "Georgia", STYLE_NEWS],
				["sketch", "素描线稿", "#EEE9DF", "#F7F4ED", "#3D3933", "#3D3933", "\"LXGW WenKai\"", "\"IBM Plex Mono\"", STYLE_SKETCH],
			];
			var main = ["#4D6BFE", "#2F5AF3", "#14B8A6", "#10B981", "#F97316", "#F43F5E", "#8B5CF6", "#EC4899", "#F59E0B", "#6366F1"];
			var accent = ["#38BDF8", "#34D399", "#2DD4BF", "#F9A8D4", "#A78BFA", "#FDBA74", "#FDE047", "#FB7185", "#22D3EE", "#94A3B8"];
			var neutral = ["#FFFFFF", "#F8F9FA", "#F1F3F5", "#E9ECEF", "#DEE2E6", "#E7F0F8", "#E8F3EE", "#F3EDF8", "#FBEDEF", "#F4F1EA"];
			var label = ["#1D1D1F", "#333333", "#3D3929", "#4A3B2A", "#2B3442", "#5A6B7E", "#E8EFF7", "#F4EAFE", "#FFFFFF", "#94A3B8"];
			var fontsCn = [
				["系统默认", "system-ui"], ["苹方", "\"PingFang SC\""], ["微软雅黑", "\"Microsoft YaHei\""],
				["思源黑体", "\"Noto Sans SC\""], ["思源宋体", "\"Noto Serif SC\""], ["霞鹜文楷", "\"LXGW WenKai\""],
				["鸿蒙黑体", "\"HarmonyOS Sans SC\",\"Noto Sans SC\""], ["星露谷像素", "\"Fusion Pixel SC\""]
			];
			var fontsEn = [
				["Inter", "Inter"], ["SF Pro", "\"SF Pro Display\""], ["Segoe UI", "\"Segoe UI\""],
				["Noto Sans", "\"Noto Sans\""], ["Source Sans", "\"Source Sans 3\""], ["IBM Plex", "\"IBM Plex Sans\""],
				["JetBrains Mono", "\"JetBrains Mono\""], ["星露谷像素", "Silkscreen"]
			];

			function Page() {
				var p = React.useState(state.preset), m = React.useState(state.main), a = React.useState(state.accent), n = React.useState(state.neutral), l = React.useState(state.label), cn = React.useState(state.cn), en = React.useState(state.en), b = React.useState(state.bgOn !== false);
				var cp = function (x) { p[1](x[0]); m[1](null); a[1](null); n[1](null); cn[1](x[6]); en[1](x[7]); applyPreset(x); };
				var cm = function (v) { p[1](null); m[1](v); applyColor(v); };
				var ca = function (v) { p[1](null); a[1](v); applyAccent(v); };
				var cnPick = function (v) { p[1](null); n[1](v); applyNeutral(v); };
				var lb = function (v) { p[1](null); l[1](v); applyLabel(v); };
				var ccn = function (v) { state.cn = v; cn[1](v); applyFont(v, state.en); };
				var cen = function (v) { state.en = v; en[1](v); applyFont(state.cn, v); };
				var up = React.createElement("label", { className: "skc-square skc-upload", title: "上传背景图片" },
					React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 },
						React.createElement("path", { d: "M12 16V4" }),
						React.createElement("path", { d: "m7 9 5-5 5 5" }),
						React.createElement("path", { d: "M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" })),
					React.createElement("input", { type: "file", accept: "image/*", onChange: function (e) { upload(e.target.files && e.target.files[0]); } }));
				var firstPicker = function (value, title, fn) { return React.createElement("label", { className: "skc-first-picker", title: title, style: { background: value || "linear-gradient(135deg,#ffd900,#ff7a00,#3ee6e0,#8b5cf6)" } }, React.createElement("input", { type: "color", value: value || "#ffffff", onChange: function (e) { fn(e.target.value); } })); };
				var bgToggle = React.createElement("label", { key: "bgswitch", className: "skc-bgtoggle", title: "关闭后恢复标准背景" },
					React.createElement("input", { type: "checkbox", checked: b[0], onChange: function (e) { state.bgOn = e.target.checked; b[1](e.target.checked); applyBg(); } }),
					React.createElement("span", null, "图片背景"));
				return React.createElement("div", { className: "skc-page" }, [
					React.createElement("div", { className: "skc-title", key: "t" }, "外观皮肤"),
					React.createElement("div", { className: "skc-section", key: "p" }, "预设风格 · 组合控制"),
					row(presets.map(function (x) {
						return React.createElement("button", { key: x[0], className: "skc-preset" + (p[0] === x[0] ? " skc-on" : ""), style: { background: "linear-gradient(135deg," + x[2] + "," + x[3] + ")", color: x[4] }, onClick: function () { cp(x); } }, x[1], p[0] === x[0] ? mark() : null);
					})),
					React.createElement("div", { className: "skc-section", key: "b" }, "背景配置"),
					row([bgToggle, up]),
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
					row(fontsEn.map(function (x) { return ft(x[1], x[0], en[0] === x[1], cen); }))
				]);
			}

			slotsSvc.inject("settings.section", function () {
				return slotsSvc.register({ name: "settings.section", id: "skinc-page", order: 31, label: "外观皮肤" }, function () { return React.createElement(Page); });
			});

			ctx.effect(function () {
				return function () {
					css();
					if (colorLayer) colorLayer();
					if (bg) bg();
					if (fontCss) fontCss();
					if (colorCss) colorCss();
					if (styleLayer) styleLayer();
					unreg.forEach(function (d) { d(); });
				};
			});
		}

		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});


