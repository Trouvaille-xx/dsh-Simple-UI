// 生成插件市场索引 market/index.json（DSH plugin-market 索引格式 v1）。
// 用法：node tools/make-market-index.mjs
// 需要：在仓库根目录运行，且工作区已提交（用 HEAD 的 commit 固定版本来源）。
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const repoUrl = "https://github.com/Trouvaille-xx/dsh-Simple-UI";

let commit = "";
try {
  commit = execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
  const dirty = execSync("git status --porcelain", { cwd: root, encoding: "utf8" }).trim();
  if (dirty) {
    console.warn("[warn] 工作区有未提交改动；索引会固定到上一个提交。请先 commit 再生成。");
  }
} catch (e) {
  console.error("无法读取 git commit，请在仓库内运行");
  process.exit(1);
}

const index = {
  format: 1,
  title: {
    en: "Simple UI by Trouvaille",
    zh: "Trouvaille 的 Simple UI",
  },
  description: {
    en: "Appearance skins for the DeepSeek Harness web client: six presets with light and dark palettes, thirteen header styles, seventeen composer styles, plus colour, font and background controls. Offline, persistent, and upgrade-safe.",
    zh: "DeepSeek Harness Web 客户端外观皮肤：六套预设（含深浅色）、十三种顶栏风格、十七种输入框风格，加上主色 / 字体 / 背景独立定制。离线可用、设置持久化、宿主升级不破版。",
  },
  metadata: {
    categories: {
      appearance: { title: { en: "Appearance", zh: "外观皮肤" } },
    },
    labels: {},
  },
  plugins: [
    {
      name: pkg.name,
      title: { en: "Simple UI · Appearance", zh: "Simple UI · 外观皮肤" },
      description: {
        en: "Six presets with light and dark palettes, thirteen header styles and seventeen composer styles for the DSH web UI, plus primary / neutral / text colours, Chinese and English fonts, and a background image. Settings persist locally; no web fonts.",
        zh: "给 DSH Web UI 的六套预设（含深浅色）、十三种顶栏风格、十七种输入框风格，支持主色 / 中性色 / 字体色、中英文字体、背景图。设置存在本地，刷新后仍在；不加载任何网络字体。",
      },
      author: "Trouvaille-xx",
      repository: { url: repoUrl },
      metadata: {
        category: "appearance",
        keywords: ["dsh-plugin", "deepseek-harness", "theme", "skin", "appearance"],
        labels: [],
      },
      versions: [
        {
          version: pkg.version,
          publishTimestamp: Math.floor(Date.now() / 1000),
          source: { type: "git", url: repoUrl, commit },
          // 不声明 engines.dsh：DSH 的预发布版本号在 semver 下匹配很脆，
          // 留空表示不限制；README 里注明实际验证过的版本。
          engines: {},
        },
      ],
    },
  ],
};

const outDir = path.join(root, "market");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, "index.json");
fs.writeFileSync(out, JSON.stringify(index, null, 2) + "\n");
console.log("written:", path.relative(root, out), `(${pkg.name}@${pkg.version} @ ${commit.slice(0, 7)})`);
