/**
 * 浮窗头像池：多张官方立绘 / 表情差分，各自标定面部裁切
 * x / y：object-position 与 transform-origin（%）
 * scale：放大倍数，越大越只剩脸
 *
 * 调参原则：圆形窗内应完整呈现脸（发顶/刘海 → 下巴），
 * 全身分镜 scale 不宜超过 ~2.9；已是半身/头像的图用更低 scale。
 */

const O = "./assets/gallery/official";

/**
 * @typedef {{
 *   id: string,
 *   src: string,
 *   x: number,
 *   y: number,
 *   scale: number,
 * }} FloatAvatar
 */

/** @type {FloatAvatar[]} */
export const floatAvatars = [
  // 主立绘（全身）— 略降 scale，保证发顶与下巴都进圆
  { id: "portrait", src: `${O}/saya-portrait.png`, x: 42, y: 7, scale: 2.85 },
  { id: "uniform", src: `${O}/saya-uniform.jpg`, x: 50, y: 8.5, scale: 2.75 },
  { id: "coat", src: `${O}/saya-coat.jpg`, x: 50, y: 8.5, scale: 2.7 },
  { id: "telescope", src: `${O}/saya-fd-telescope.png`, x: 43, y: 7, scale: 2.8 },

  // IF 夏服表情差分（构图接近，统一参数）
  { id: "if-summer", src: `${O}/saya-if-summer.png`, x: 48, y: 7, scale: 2.45 },
  { id: "if-smile", src: `${O}/saya-if-summer-smile.png`, x: 48, y: 7, scale: 2.45 },
  { id: "if-shy", src: `${O}/saya-if-summer-shy.png`, x: 48, y: 7, scale: 2.45 },
  { id: "if-soft", src: `${O}/saya-if-summer-soft.png`, x: 48, y: 7, scale: 2.45 },
  { id: "if-pout", src: `${O}/saya-if-summer-pout.png`, x: 48, y: 7, scale: 2.45 },
  { id: "if-teary", src: `${O}/saya-if-summer-teary.png`, x: 48, y: 7, scale: 2.45 },
  { id: "if-nightgown", src: `${O}/saya-if-nightgown.png`, x: 48, y: 7, scale: 2.45 },
  // 泳装立绘人物偏右，需单独标定 x
  { id: "if-swimsuit", src: `${O}/saya-if-swimsuit.png`, x: 65, y: 6, scale: 2.1 },

  // 已是头像 / 半身 / 横幅
  { id: "icon-if", src: `${O}/saya-icon-if.png`, x: 50, y: 40, scale: 1.12 },
  // 官网横幅：脸在右侧
  { id: "if-header", src: `${O}/saya-if-header.jpg`, x: 79, y: 38, scale: 1.5 },
  { id: "q-solo", src: `${O}/cg-if-q-saya-solo.jpg`, x: 70, y: 36, scale: 1.45 },
];
