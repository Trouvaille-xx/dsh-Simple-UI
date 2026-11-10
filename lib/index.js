import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const name = "dsh-simple-ui";

// 内置预设背景图随插件分发（放在 assets/bg/），由宿主 webServer 提供 /dsh-simple-ui/bg/ 路由。
// 不塞进 client.js：7 张全尺寸壁纸约 1MB，base64 进 bundle 会让每次加载都多解析 1.4MB。
const BG_DIR = fileURLToPath(new URL("../assets/bg/", import.meta.url));
const BG_IDS = ["ink-bamboo", "xilian", "peach", "red-plum", "sunset-bird", "snow-plum", "ink-lady"];
const BG_FILES = {};
for (const id of BG_IDS) {
  BG_FILES[id + ".jpg"] = "image/jpeg";
  BG_FILES[id + "-thumb.jpg"] = "image/jpeg";
}

export function apply(ctx) {
  let registered = false;
  const disposers = [];

  function tryRegister() {
    if (registered) return;
    const ws = ctx.get("webServer");
    if (!ws || typeof ws.register !== "function") return;

    disposers.push(ws.register({
      kind: "prefix",
      path: "/dsh-simple-ui/bg",
      handler(req, res) {
        const path = (req.url || "").split("?")[0];
        let file = "";
        try { file = decodeURIComponent(path.split("/").pop() || ""); } catch (e) { file = ""; }
        // 白名单：只允许这 14 个文件名，杜绝路径穿越
        const type = Object.prototype.hasOwnProperty.call(BG_FILES, file) ? BG_FILES[file] : null;
        if (!type) {
          res.statusCode = 404;
          res.end("not found");
          return;
        }
        try {
          const bytes = readFileSync(join(BG_DIR, file));
          res.setHeader("Content-Type", type);
          res.setHeader("Content-Length", String(bytes.length));
          res.setHeader("Cache-Control", "public, max-age=604800, immutable");
          res.end(bytes);
        } catch (e) {
          res.statusCode = 404;
          res.end("missing");
        }
      },
    }));
    registered = true;
  }

  // bundle 的宿主半侧可能先于 webServer 服务就绪，轮询重试
  tryRegister();
  if (!registered && typeof setTimeout === "function") {
    let tries = 0;
    const poll = () => {
      if (registered || tries >= 120) return;
      tries += 1;
      tryRegister();
      if (!registered) setTimeout(poll, 1000);
    };
    setTimeout(poll, 300);
  }

  ctx.effect(() => () => {
    disposers.forEach((d) => { try { d(); } catch (e) { /* ignore */ } });
  });
}
