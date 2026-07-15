# 天之川沙夜 · Amanogawa Saya

《仰望夜空的星辰》角色展示站。零依赖静态站点，以星空与异色瞳（蓝 / 橙黄）为视觉主轴。

## 功能

- **首页**：角色简介、档案、精选图、星笺、个人备注
- **完整图集页** `gallery.html`
  - 官方立绘（PULLTOP / Bangumi）
  - 官方 CG（官网 Gallery 中沙夜出场的公开图）
  - 社区同人（粉丝 / 第三方全年龄向创作）
  - AI 创作（本地文件夹自动扫描）
- **完整星笺页** `quotes.html`
  - 沙夜台词 / 关于她 / 星空名句 / **AI仿作**（按角色气质新写，明确标注非原台词）
  - 标注来源，可按分类筛选
- **陪伴页** `companion.html`
  - 按时段问候（晨 / 午 / 傍晚 / 夜 / 深夜）
  - **随口互动**（打招呼、吃醋、通い妻、观星等一键回应）
  - 随机星笺气泡、一起看星星计时
  - 回访连续天数（本机 localStorage）
  - 多主题分支小对话（气质整理向，非剧本逐字）
  - 行为会联动独立好感系统（入口卡片跳转好感页）
- **好感页** `affinity.html`（独立）
  - 0–100 好感度与星象阶段星图
  - 心意一拍 / 送星等本页互动
  - 已解锁心意句、今日各来源余量
  - 本机独立 localStorage；可从旧陪伴存储自动迁移

## 运行

```bash
npm start
```

- 首页：http://localhost:3000/
- 图集：http://localhost:3000/gallery.html
- 星笺：http://localhost:3000/quotes.html
- 陪伴：http://localhost:3000/companion.html
- 好感：http://localhost:3000/affinity.html

## 添加你的 AI 图

1. 把图片放进 `assets/gallery/ai/`
2. 支持 `jpg / jpeg / png / webp / gif`
3. 刷新图集页，切到 **AI 创作**

本地 `npm start` 会通过 `/api/ai-images` 自动扫描文件夹。  
纯静态部署时，可改为编辑 `src/data/ai-gallery.js` 手动登记。

## 目录

```
index.html / gallery.html / quotes.html / companion.html / affinity.html
server.js                 本地静态服务 + AI 图扫描 API
site.webmanifest          PWA 清单
vercel.json               部署路由
assets/
  gallery/
    official/             官方立绘 / CG
    community/            社区同人（全年龄向）
    ai/                   AI 创作（丢文件即可）
  favicon-*.png / icon-*  站点图标
src/
  main.js                 首页
  gallery-page.js         图集页
  quotes-page.js          星笺页
  companion-page.js       陪伴页
  affinity-page.js        好感页
  affinity-core.js        好感存储 / 加分 / toast（跨页共用）
  shared.js               星空 / 灯箱 / 导航共用
  styles.css
  data/
    saya.js               角色档案
    gallery-archive.js    图集清单 + 首页精选
    ai-gallery.js         AI 图手动清单（可选）
    quotes.js / notes.js
    companion.js          陪伴文案与小对话
    affinity.js           好感阶段 / 规则 / 心意互动
```

## 来源说明

- 官方立绘 / CG：PULLTOP《見上げてごらん、夜空の星を》官网公开素材
- IF 换装立绘 / 宣传图：PULLTOP《Interstellar Focus》官网公开素材
- 部分设定图：Bangumi 角色页
- 社区同人：粉丝 / 第三方公开创作（Danbooru / Pixiv / X 等），版权归原画师
- 图集仅收录全年龄向内容（已排除 H / 裸露等 18+ 场景）
- 仅供个人欣赏的同人向展示，请勿商业使用
