# 天之川沙夜 · Amanogawa Saya

《仰望夜空的星辰》角色展示站。零依赖静态站点，以星空与异色瞳（蓝 / 橙黄）为视觉主轴。

## 功能

- **首页主视觉**：星空背景、角色立绘、作品信息
- **关于她**：人物简介与性格特质卡片
- **角色档案**：生日、身高、CV 等设定与外链
- **图集**：分类筛选 + 灯箱浏览
- **星语 / 备注**：台词印象与个人书写

## 运行

```bash
npm start
```

浏览器打开 `http://localhost:3000`。也可直接用任意静态服务器打开项目根目录。

## 结构

```
index.html          入口
server.js           本地静态服务
src/
  main.js           渲染与交互
  styles.css        全站样式
  data/
    saya.js         角色档案
    gallery.js      图集
    quotes.js       星语
    notes.js        个人备注
```

## 换图

在 `src/data/gallery.js` / `saya.js` 中修改 `src` / `heroImage`。

推荐把图片放到本地，例如：

```
assets/gallery/uniform.jpg
```

然后写：

```js
src: "./assets/gallery/uniform.jpg"
```

当前默认使用 Bangumi 公开角色图作为占位，外网不可用时会自动切到星空 fallback 图。

## 后续可扩展

- 时间线 / 更多截图分类
- 本地图库与收藏
- 陪伴向小功能（问候、台词抽选等）
