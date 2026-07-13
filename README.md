# 天之川沙夜 · Amanogawa Saya

《仰望夜空的星辰》角色展示站。零依赖静态站点，以星空与异色瞳（蓝 / 橙黄）为视觉主轴。

## 功能

- **首页**：角色简介、档案、精选图、星语、个人备注
- **完整图集页** `gallery.html`
  - 官方立绘（PULLTOP / Bangumi）
  - 官方 CG（官网 Gallery 中沙夜出场的公开图）
  - AI 创作（本地文件夹自动扫描）

## 运行

```bash
npm start
```

- 首页：http://localhost:3000/
- 图集：http://localhost:3000/gallery.html

## 添加你的 AI 图

1. 把图片放进 `assets/gallery/ai/`
2. 支持 `jpg / jpeg / png / webp / gif`
3. 刷新图集页，切到 **AI 创作**

本地 `npm start` 会通过 `/api/ai-images` 自动扫描文件夹。  
纯静态部署时，可改为编辑 `src/data/ai-gallery.js` 手动登记。

## 目录

```
index.html              首页
gallery.html            完整图集
server.js               本地静态服务 + AI 图扫描 API
assets/gallery/
  official/             官方图片缓存
  ai/                   你的 AI 创作（丢文件即可）
src/
  main.js               首页逻辑
  gallery-page.js       图集页逻辑
  shared.js             星空 / 灯箱 / 导航共用
  styles.css
  data/
    saya.js             角色档案
    gallery-archive.js  官方图清单 + 首页精选
    ai-gallery.js       AI 图手动清单（可选）
    quotes.js / notes.js
```

## 来源说明

- 官方立绘 / CG：PULLTOP《見上げてごらん、夜空の星を》官网公开素材
- 部分设定图：Bangumi 角色页
- 图集仅收录全年龄向内容（已排除 H / 裸露等 18+ 场景）
- 仅供个人欣赏的同人向展示，请勿商业使用
