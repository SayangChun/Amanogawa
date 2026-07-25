/**
 * float.html 入口：独立小窗 / 直接访问调试页
 */

import { mountFloatCompanion } from "./float-companion.js";

const handle = mountFloatCompanion(window, { mode: "page" });

// expose for debugging
window.__sayaFloat = handle;
