/**
 * 系统浮窗启动器：优先 Document Picture-in-Picture，否则 window.open 独立小窗
 */

import { mountFloatCompanion } from "./float-companion.js";

const POPUP_NAME = "saya-float";
/** 极简浮窗：随机面部 + 话语 */
const PIP_W = 300;
const PIP_H = 440;

/** @type {Window | null} */
let pipWindow = null;
/** @type {Window | null} */
let popupWindow = null;
/** @type {{ unmount: () => void } | null} */
let pipMount = null;

export function canUseDocumentPiP() {
  return typeof window !== "undefined" && "documentPictureInPicture" in window;
}

export function isFloatCompanionActive() {
  if (pipWindow && !pipWindow.closed) return true;
  if (popupWindow && !popupWindow.closed) return true;
  // browser-managed PiP singleton
  try {
    const cur = window.documentPictureInPicture?.window;
    if (cur && !cur.closed) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function floatPageUrl() {
  return new URL("./float.html", window.location.href).href;
}

function copyStylesTo(targetDoc) {
  // Clone stylesheet links + inline styles from opener
  const base = new URL("./src/styles.css", window.location.href).href;
  const fonts = [
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Sans+SC:wght@300;400;500;600&family=Noto+Serif+SC:wght@400;500;600;700&display=swap",
  ];

  const head = targetDoc.head;
  // charset / viewport already present when we write shell

  fonts.forEach((href) => {
    const link = targetDoc.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    head.appendChild(link);
  });

  const styleLink = targetDoc.createElement("link");
  styleLink.rel = "stylesheet";
  styleLink.href = base;
  head.appendChild(styleLink);

  // Copy :root data-theme from main document if any
  try {
    const theme = document.documentElement.getAttribute("data-theme");
    if (theme) targetDoc.documentElement.setAttribute("data-theme", theme);
    const stage = document.documentElement.dataset.affinityStage;
    if (stage) targetDoc.documentElement.dataset.affinityStage = stage;
  } catch {
    /* ignore */
  }
}

function preparePipDocument(pipWin) {
  const doc = pipWin.document;
  doc.documentElement.lang = "zh-CN";
  doc.head.innerHTML = `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>浮窗陪伴 · 天之川沙夜</title>
    <meta name="theme-color" content="#050a18" />
  `;
  doc.body.className = "float-body";
  doc.body.innerHTML = `
    <div class="float-sky" aria-hidden="true"></div>
    <div id="float-root"></div>
  `;
  copyStylesTo(doc);
}

function cleanupPip() {
  const mount = pipMount;
  pipMount = null;
  pipWindow = null;
  if (mount) {
    try {
      mount.unmount();
    } catch {
      /* ignore */
    }
  }
}

function cleanupPopup() {
  popupWindow = null;
}

/**
 * @returns {Promise<{ ok: boolean, mode?: "pip" | "popup", error?: string }>}
 */
export async function openFloatCompanion({ preferPip = true } = {}) {
  // Focus existing
  if (pipWindow && !pipWindow.closed) {
    try {
      pipWindow.focus();
    } catch {
      /* ignore */
    }
    return { ok: true, mode: "pip" };
  }
  try {
    const cur = window.documentPictureInPicture?.window;
    if (cur && !cur.closed) {
      pipWindow = cur;
      try {
        cur.focus();
      } catch {
        /* ignore */
      }
      return { ok: true, mode: "pip" };
    }
  } catch {
    /* ignore */
  }

  if (popupWindow && !popupWindow.closed) {
    try {
      popupWindow.focus();
    } catch {
      /* ignore */
    }
    return { ok: true, mode: "popup" };
  }

  if (preferPip && canUseDocumentPiP()) {
    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width: PIP_W,
        height: PIP_H,
      });
      pipWindow = pip;
      preparePipDocument(pip);

      const onPageHide = () => {
        cleanupPip();
      };
      pip.addEventListener("pagehide", onPageHide, { once: true });

      pipMount = mountFloatCompanion(pip, {
        mode: "pip",
        baseUrl: window.location.href,
      });

      return { ok: true, mode: "pip" };
    } catch (err) {
      // fall through to popup
      console.warn("[float] Document PiP failed, falling back to popup", err);
    }
  }

  // popup fallback
  const features = `popup=yes,width=${PIP_W},height=${PIP_H},resizable=yes,scrollbars=yes`;
  const win = window.open(floatPageUrl(), POPUP_NAME, features);
  if (!win) {
    return {
      ok: false,
      error:
        "无法打开浮窗。请允许本站弹出窗口，或使用桌面版 Chrome / Edge 以获得置顶 PiP 体验。",
    };
  }
  popupWindow = win;
  win.addEventListener(
    "beforeunload",
    () => {
      cleanupPopup();
    },
    { once: true },
  );
  // poll closed state (beforeunload not always reliable for popups)
  const poll = window.setInterval(() => {
    if (!popupWindow || popupWindow.closed) {
      window.clearInterval(poll);
      cleanupPopup();
    }
  }, 1500);

  try {
    win.focus();
  } catch {
    /* ignore */
  }
  return { ok: true, mode: "popup" };
}

export function closeFloatCompanion() {
  const pip = pipWindow;
  cleanupPip();
  if (pip && !pip.closed) {
    try {
      pip.close();
    } catch {
      /* ignore */
    }
  }

  if (popupWindow && !popupWindow.closed) {
    try {
      popupWindow.close();
    } catch {
      /* ignore */
    }
  }
  popupWindow = null;
}

/**
 * Soft toast on main page when open fails
 * @param {string} message
 */
export function showFloatLaunchMessage(message) {
  let el = document.querySelector("#float-launch-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "float-launch-toast";
    el.className = "float-launch-toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.hidden = false;
  el.classList.remove("is-show");
  void el.offsetWidth;
  el.classList.add("is-show");
  window.setTimeout(() => {
    el.classList.remove("is-show");
    window.setTimeout(() => {
      el.hidden = true;
    }, 320);
  }, 3600);
}
