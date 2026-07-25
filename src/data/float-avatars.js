/**
 * 浮窗头像池：多张官方立绘 / 表情差分，各自标定面部裁切
 * x / y：object-position 与 transform-origin（%）
 * scale：放大倍数，越大越只剩脸
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
  // 主立绘（全身）
  { id: "portrait", src: `${O}/saya-portrait.png`, x: 41, y: 6, scale: 3.35 },
  { id: "uniform", src: `${O}/saya-uniform.jpg`, x: 50, y: 9, scale: 3.2 },
  { id: "coat", src: `${O}/saya-coat.jpg`, x: 50, y: 8, scale: 3.15 },
  { id: "telescope", src: `${O}/saya-fd-telescope.png`, x: 42, y: 7, scale: 3.2 },

  // IF 夏服表情差分（构图接近，略调）
  { id: "if-summer", src: `${O}/saya-if-summer.png`, x: 48, y: 8, scale: 3.15 },
  { id: "if-smile", src: `${O}/saya-if-summer-smile.png`, x: 48, y: 8, scale: 3.15 },
  { id: "if-shy", src: `${O}/saya-if-summer-shy.png`, x: 48, y: 8, scale: 3.15 },
  { id: "if-soft", src: `${O}/saya-if-summer-soft.png`, x: 48, y: 8, scale: 3.15 },
  { id: "if-pout", src: `${O}/saya-if-summer-pout.png`, x: 48, y: 8, scale: 3.15 },
  { id: "if-teary", src: `${O}/saya-if-summer-teary.png`, x: 48, y: 8, scale: 3.15 },
  { id: "if-nightgown", src: `${O}/saya-if-nightgown.png`, x: 48, y: 9, scale: 3.1 },
  { id: "if-swimsuit", src: `${O}/saya-if-swimsuit.png`, x: 48, y: 8, scale: 3.1 },

  // 已是头像 / 半身，轻裁即可
  { id: "icon-if", src: `${O}/saya-icon-if.png`, x: 50, y: 38, scale: 1.22 },
  { id: "if-header", src: `${O}/saya-if-header.jpg`, x: 52, y: 28, scale: 1.55 },
  { id: "q-solo", src: `${O}/cg-if-q-saya-solo.jpg`, x: 68, y: 26, scale: 1.85 },
];
