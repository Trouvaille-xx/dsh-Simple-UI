# 内置预设背景

这 7 张壁纸随插件分发，由宿主 `webServer` 的 `/dsh-simple-ui/bg/` 路由提供（白名单，只有下列文件名可访问）。

| 文件 | 名称 | 原始尺寸 |
|---|---|---|
| `ink-bamboo.jpg` / `-thumb` | 墨竹 | 3840×2160 |
| `xilian.jpg` / `-thumb` | 昔涟 | 3840×2160 |
| `peach.jpg` / `-thumb` | 桃花 | 3840×2160 |
| `red-plum.jpg` / `-thumb` | 红梅 | 3840×2160 |
| `sunset-bird.jpg` / `-thumb` | 落霞孤鹜 | 1536×1024 |
| `snow-plum.jpg` / `-thumb` | 雪梅 | 3840×2160 |
| `ink-lady.jpg` / `-thumb` | 水墨仕女 | 1920×1080 |

处理方式：全尺寸统一压到最长边 1920（JPEG q82，渐进式，共约 1.0 MB）；缩略图宽 360（JPEG q76，共约 56 KB），用于设置页 4 列网格。

## 版权说明

图片由仓库作者提供并同意随插件分发。其中 `ink-lady` 的原文件来自壁纸站点下载（原文件名含站点名），
若需严格版权合规，请自行确认来源授权，或直接删除该文件并从以下两处移除对应条目：

- `lib/index.js` 的 `BG_IDS`
- `lib/client.js` 的 `BG_PRESETS`

删除后其余预设不受影响。
