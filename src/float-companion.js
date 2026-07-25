/**
 * 系统浮窗陪伴（极简）
 * 多图随机面部 + 陪伴话语；无互动清单 / 计时
 */

import { saya } from "./data/saya.js";
import { greetings, birthdayGreetings, companionLines } from "./data/companion.js";
import { floatAvatars } from "./data/float-avatars.js";
import {
  getAffinityValue,
  getAffinityStage,
  getUnlockedLines,
  resolveThemeId,
} from "./affinity-core.js";
import { isBirthday } from "./birthday.js";
import { esc, imgSrc, bindImageFallbacks } from "./shared.js";

function pickRandom(list, avoidId) {
  if (!list.length) return null;
  if (list.length === 1) return list[0];
  let item = list[Math.floor(Math.random() * list.length)];
  if (avoidId != null) {
    let guard = 0;
    while ((item.id === avoidId || item.text === avoidId) && guard < 10) {
      item = list[Math.floor(Math.random() * list.length)];
      guard += 1;
    }
  }
  return item;
}

function timePeriod(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 10) return "morning";
  if (h >= 10 && h < 16) return "afternoon";
  if (h >= 16 && h < 20) return "evening";
  if (h >= 20 && h < 24) return "night";
  return "late";
}

const periodLabels = {
  morning: "清晨",
  afternoon: "午后",
  evening: "傍晚",
  night: "夜晚",
  late: "深夜",
};

function buildLinePool(affinity = 0) {
  const fromCompanion = companionLines.map((l) => ({
    id: l.id,
    text: l.text,
    badge: "陪伴",
    mood: l.mood || "soft",
  }));
  const fromUnlock = getUnlockedLines(affinity).map((l) => ({
    id: l.id,
    text: l.text,
    badge: "心意",
    mood: l.mood || "soft",
  }));
  return [...fromCompanion, ...fromUnlock];
}

function applyAppearanceTo(doc) {
  if (!doc?.documentElement) return;
  const affinity = getAffinityValue();
  const theme = resolveThemeId(affinity);
  const rootEl = doc.documentElement;
  if (theme === "default") rootEl.removeAttribute("data-theme");
  else rootEl.setAttribute("data-theme", theme);
  rootEl.dataset.affinityStage = getAffinityStage(affinity).id;
}

function resolveAssetUrl(path, baseHref) {
  if (!path) return path;
  if (/^(data:|https?:|blob:)/i.test(path)) return path;
  try {
    return new URL(path, baseHref).href;
  } catch {
    return path;
  }
}

/**
 * @param {Window} targetWindow
 * @param {{ mode?: "pip" | "popup" | "page", baseUrl?: string }} [options]
 */
export function mountFloatCompanion(targetWindow, options = {}) {
  const win = targetWindow;
  const doc = win.document;
  const mode = options.mode || "page";

  let baseUrl = options.baseUrl || "";
  if (!baseUrl) {
    try {
      const href = win.location?.href || "";
      if (href && !href.startsWith("about:")) baseUrl = href;
    } catch {
      /* ignore */
    }
  }
  if (!baseUrl) {
    try {
      baseUrl = window.location.href;
    } catch {
      baseUrl = "./";
    }
  }

  const root = doc.querySelector("#float-root") || doc.body;

  const period = timePeriod();
  const onBirthday = isBirthday();
  const greeting = onBirthday
    ? pickRandom(birthdayGreetings)
    : pickRandom(greetings[period] || greetings.night);

  const avatars = floatAvatars.length ? floatAvatars : [{ id: "fallback", src: saya.heroImage, x: 41, y: 6, scale: 3.35 }];
  let currentAvatar = pickRandom(avatars);
  let lastAvatarId = currentAvatar?.id;

  let linePool = buildLinePool(getAffinityValue());
  let currentLine = {
    id: "greet",
    text: greeting?.text || "……你来了。",
    badge: onBirthday ? "生日" : "问候",
    mood: "soft",
  };
  let lastLineId = currentLine.id;

  let idleTimer = 0;
  let alive = true;

  const reduceMotion =
    typeof win.matchMedia === "function" &&
    win.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function companionHref() {
    try {
      return new URL("./companion.html", baseUrl).href;
    } catch {
      return "./companion.html";
    }
  }

  function avatarSrc(avatar = currentAvatar) {
    return resolveAssetUrl(imgSrc(avatar?.src || saya.heroImage, saya.name), baseUrl);
  }

  function faceStyle(avatar = currentAvatar) {
    const x = Number.isFinite(avatar?.x) ? avatar.x : 50;
    const y = Number.isFinite(avatar?.y) ? avatar.y : 10;
    const scale = Number.isFinite(avatar?.scale) ? avatar.scale : 3;
    return `--face-x:${x}%;--face-y:${y}%;--face-scale:${scale}`;
  }

  function renderShell() {
    const periodLabel = onBirthday ? "生日" : periodLabels[period] || "夜晚";
    const av = currentAvatar;

    return `
    <div class="float-app" data-mode="${esc(mode)}">
      <header class="float-header">
        <p class="float-kicker">
          <span class="dot blue"></span>
          ${esc(periodLabel)}
          <span class="dot amber"></span>
        </p>
        ${
          mode !== "page"
            ? `<button type="button" class="float-icon-btn" data-float-close aria-label="关闭浮窗">×</button>`
            : ""
        }
      </header>

      <div class="float-main glass">
        <button
          type="button"
          class="float-portrait-btn"
          data-float-avatar
          title="换一张脸"
          aria-label="换一张沙夜的脸"
        >
          <div
            class="float-portrait"
            id="float-portrait"
            style="${faceStyle(av)}"
          >
            <img
              class="float-portrait-img"
              id="float-portrait-img"
              src="${esc(avatarSrc(av))}"
              alt="${esc(saya.name)}"
              width="280"
              height="280"
              decoding="async"
              data-fallback="${esc(saya.name)}"
            />
          </div>
        </button>

        <p class="float-name">${esc(saya.name)}</p>

        <article
          class="companion-bubble float-bubble is-pop"
          id="float-bubble"
          data-mood="${esc(currentLine.mood || "soft")}"
          aria-live="polite"
        >
          <p class="companion-bubble-text">「${esc(currentLine.text)}」</p>
          <span class="companion-bubble-badge">${esc(currentLine.badge || "陪伴")}</span>
        </article>

        <div class="float-toolbar">
          <button type="button" class="btn btn-ghost float-mini-btn" data-float-line>换一句</button>
          <button type="button" class="btn btn-ghost float-mini-btn" data-float-avatar>换一张</button>
          <a class="btn btn-primary float-mini-btn float-open-full" data-float-open-full href="${esc(companionHref())}">完整陪伴</a>
        </div>
      </div>
    </div>`;
  }

  function paint() {
    if (!alive) return;
    applyAppearanceTo(doc);
    root.innerHTML = renderShell();
    bindImageFallbacks(root);
  }

  function refreshAvatar() {
    const next = pickRandom(avatars, lastAvatarId);
    if (!next) return;
    currentAvatar = next;
    lastAvatarId = next.id;
    // 整页重绘更稳：PiP 下局部改 style/src 偶发不刷新
    paint();
  }

  function refreshLine({ alsoAvatar = false } = {}) {
    linePool = buildLinePool(getAffinityValue());
    const next = pickRandom(linePool, lastLineId);
    if (!next) return;
    currentLine = next;
    lastLineId = next.id;
    if (alsoAvatar) {
      const av = pickRandom(avatars, lastAvatarId);
      if (av) {
        currentAvatar = av;
        lastAvatarId = av.id;
      }
    }
    paint();
  }

  function openFullCompanion(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const href = companionHref();
    try {
      if (win.opener && !win.opener.closed) {
        win.opener.focus();
        win.opener.location.href = href;
        return;
      }
    } catch {
      /* ignore */
    }
    // PiP 没有可靠 opener 时，尝试操作主窗
    try {
      if (window !== win && window.location) {
        window.focus();
        window.location.href = href;
        return;
      }
    } catch {
      /* ignore */
    }
    try {
      win.open(href, "_blank", "noopener");
    } catch {
      try {
        win.location.href = href;
      } catch {
        /* ignore */
      }
    }
  }

  /**
   * 注意：Document PiP 与主窗是不同 JS realm，
   * `e.target instanceof Element` 会恒为 false，必须用 target 自身 API 判断。
   */
  function onClick(e) {
    const t = e.target;
    if (!t || typeof t.closest !== "function") return;

    if (t.closest("[data-float-close]")) {
      e.preventDefault();
      try {
        win.close();
      } catch {
        /* ignore */
      }
      return;
    }

    if (t.closest("[data-float-line]")) {
      e.preventDefault();
      // 换句时有概率也换脸
      refreshLine({ alsoAvatar: Math.random() < 0.35 });
      return;
    }

    if (t.closest("[data-float-avatar]")) {
      e.preventDefault();
      refreshAvatar();
      return;
    }

    if (t.closest("[data-float-open-full]")) {
      openFullCompanion(e);
    }
  }

  function startIdleRefresh() {
    if (reduceMotion) return;
    stopIdleRefresh();
    idleTimer = win.setInterval(() => {
      if (!alive || doc.hidden) return;
      refreshLine({ alsoAvatar: Math.random() < 0.5 });
    }, 4 * 60 * 1000);
  }

  function stopIdleRefresh() {
    if (idleTimer) {
      win.clearInterval(idleTimer);
      idleTimer = 0;
    }
  }

  // 挂到 document：capture 阶段，避免 PiP 内某些节点拦截冒泡
  doc.addEventListener("click", onClick, true);
  paint();
  startIdleRefresh();

  return {
    isActive: () => alive,
    unmount() {
      if (!alive) return;
      alive = false;
      stopIdleRefresh();
      doc.removeEventListener("click", onClick, true);
    },
  };
}
