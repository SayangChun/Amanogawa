/**
 * 夜空氛围 BGM · 双星夜曲
 *
 * 策略：页面内原生 <audio autoplay loop> + 尽早 play()，
 * 在浏览器允许本站有声自动播放时，刷新后无需点击即可出声。
 *
 * 说明：Chrome/Safari/Firefox 会拦截「未授权站点」的有声自动播放。
 * 一旦用户允许本站声音（地址栏站点设置），或本站媒体参与度足够，即可真正免手势自动播。
 */

const STORAGE_KEY = "amanogawa-bgm";
const DEFAULT_VOLUME = 0.4;
const PREFS_VERSION = 3;
const BGM_SRC = new URL("../assets/bgm/night-sky.wav", import.meta.url).href;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function defaultPrefs() {
  return { enabled: true, volume: DEFAULT_VOLUME, v: PREFS_VERSION };
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        enabled: prefs.enabled !== false,
        volume: clamp(Number(prefs.volume) || DEFAULT_VOLUME, 0, 1),
        v: PREFS_VERSION,
      }),
    );
  } catch {
    /* private mode */
  }
}

function loadPrefs() {
  const defaults = defaultPrefs();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      savePrefs(defaults);
      return { ...defaults };
    }
    const data = JSON.parse(raw);
    const volume = clamp(
      data.volume == null || Number.isNaN(Number(data.volume)) ? DEFAULT_VOLUME : Number(data.volume),
      0,
      1,
    );
    if (data.v !== PREFS_VERSION) {
      const migrated = { enabled: true, volume: volume > 0 ? volume : DEFAULT_VOLUME, v: PREFS_VERSION };
      savePrefs(migrated);
      return migrated;
    }
    return {
      enabled: data.enabled === false ? false : true,
      volume: volume > 0 ? volume : DEFAULT_VOLUME,
      v: PREFS_VERSION,
    };
  } catch {
    savePrefs(defaults);
    return { ...defaults };
  }
}

function applyUi(ui, phase) {
  const playing = phase === "playing";
  const blocked = phase === "blocked";
  ui.root.dataset.playing = playing ? "1" : "0";
  ui.root.dataset.pending = blocked ? "1" : "0";
  ui.toggle.setAttribute("aria-pressed", playing || blocked ? "true" : "false");
  if (playing) {
    ui.toggle.setAttribute("aria-label", "暂停背景音乐");
    ui.label.textContent = "夜空 · 播放中";
  } else if (blocked) {
    // 不提示「轻触」——持续自动重试；仅作状态反馈
    ui.toggle.setAttribute("aria-label", "正在自动播放背景音乐");
    ui.label.textContent = "夜空 · 播放中";
  } else {
    ui.toggle.setAttribute("aria-label", "播放背景音乐");
    ui.label.textContent = "夜空 · 已静音";
  }
}

function mountControl(volume) {
  let root = document.getElementById("bgm-control");
  if (!root) {
    root = document.createElement("div");
    root.id = "bgm-control";
    root.className = "bgm-control";
    root.innerHTML = `
      <button type="button" class="bgm-toggle" aria-pressed="true" aria-label="暂停背景音乐" title="双星夜曲 · 背景氛围">
        <span class="bgm-icon" aria-hidden="true">
          <svg class="bgm-icon-note" viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path d="M9 18V6.4l10-2.2V16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="7" cy="18" r="2.4" fill="currentColor"/>
            <circle cx="17" cy="16" r="2.4" fill="currentColor"/>
          </svg>
          <span class="bgm-icon-bars" aria-hidden="true"><i></i><i></i><i></i></span>
        </span>
        <span class="bgm-label">夜空 · 播放中</span>
      </button>
      <label class="bgm-volume">
        <span class="visually-hidden">音量</span>
        <input type="range" min="0" max="100" step="1" value="${Math.round(clamp(volume, 0, 1) * 100)}" aria-label="背景音乐音量" />
      </label>
    `;
    document.body.appendChild(root);
  }
  return {
    root,
    toggle: root.querySelector(".bgm-toggle"),
    label: root.querySelector(".bgm-label"),
    volume: root.querySelector('input[type="range"]'),
  };
}

/** 确保页面上有可自动播放的 audio 节点 */
function ensureAudioElement() {
  let audio = document.getElementById("bgm-audio");
  if (!audio) {
    audio = document.createElement("audio");
    audio.id = "bgm-audio";
    document.body.appendChild(audio);
  }
  audio.setAttribute("autoplay", "");
  audio.setAttribute("loop", "");
  audio.setAttribute("playsinline", "");
  audio.setAttribute("webkit-playsinline", "");
  audio.setAttribute("preload", "auto");
  audio.loop = true;
  audio.autoplay = true;
  audio.playsInline = true;
  audio.preload = "auto";
  audio.hidden = true;
  audio.controls = false;
  // 使用稳定静态资源，便于浏览器预加载与自动播放判定
  if (!audio.src || !String(audio.src).includes("night-sky.wav")) {
    audio.src = BGM_SRC;
  }
  return audio;
}

let started = false;

export function initBgm() {
  if (typeof window === "undefined" || started) return;
  started = true;

  const prefs = loadPrefs();
  const ui = mountControl(prefs.volume);
  const audio = ensureAudioElement();

  /** @type {'playing'|'blocked'|'muted'} */
  let phase = prefs.enabled ? "playing" : "muted";
  let retryTimer = 0;
  let hardRetries = 0;

  const isAudible = () =>
    Boolean(audio && !audio.paused && !audio.ended && audio.readyState >= 2 && !audio.muted && audio.volume > 0);

  const syncUi = () => {
    if (!prefs.enabled) phase = "muted";
    else if (isAudible() || (audio && !audio.paused && prefs.enabled)) phase = "playing";
    else phase = "blocked";
    applyUi(ui, phase);
  };

  const stopRetry = () => {
    if (retryTimer) {
      window.clearInterval(retryTimer);
      retryTimer = 0;
    }
  };

  const tryPlay = async () => {
    if (!prefs.enabled) return false;

    audio.muted = false;
    audio.volume = clamp(prefs.volume, 0, 1);
    audio.autoplay = true;
    audio.loop = true;

    if (!audio.paused && !audio.ended) {
      syncUi();
      return true;
    }

    try {
      // 调用 play()：若浏览器允许本站有声自动播放，此处会成功（刷新免点击）
      const p = audio.play();
      if (p !== undefined) await p;
      if (!audio.paused) {
        stopRetry();
        syncUi();
        return true;
      }
    } catch {
      /* NotAllowedError：策略拦截 */
    }
    syncUi();
    return false;
  };

  const startAutoplayEngine = () => {
    if (!prefs.enabled) return;
    stopRetry();
    hardRetries = 0;

    // 立即与多时机尝试（覆盖解析/解码完成的不同时刻）
    const kicks = [0, 50, 120, 300, 600, 1000, 2000, 4000];
    kicks.forEach((ms) => {
      window.setTimeout(() => {
        if (prefs.enabled) tryPlay();
      }, ms);
    });

    // 持续轻量重试：一旦策略放行或资源就绪即可无点击起播
    retryTimer = window.setInterval(() => {
      if (!prefs.enabled) {
        stopRetry();
        return;
      }
      if (!audio.paused) {
        stopRetry();
        syncUi();
        return;
      }
      hardRetries += 1;
      tryPlay();
      // 最长积极重试约 60s，之后仍保留 visibility/pageshow 触发
      if (hardRetries > 120) stopRetry();
    }, 500);
  };

  const mute = () => {
    prefs.enabled = false;
    savePrefs(prefs);
    stopRetry();
    try {
      audio.pause();
    } catch {
      /* ignore */
    }
    // 去掉 autoplay，避免浏览器又拉起来
    audio.autoplay = false;
    audio.removeAttribute("autoplay");
    syncUi();
  };

  const enable = async () => {
    prefs.enabled = true;
    savePrefs(prefs);
    audio.setAttribute("autoplay", "");
    audio.autoplay = true;
    const ok = await tryPlay();
    if (!ok) startAutoplayEngine();
    syncUi();
  };

  ui.toggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (prefs.enabled && !audio.paused) mute();
    else enable();
  });

  ui.volume.addEventListener("input", () => {
    prefs.volume = clamp(Number(ui.volume.value) / 100, 0, 1);
    savePrefs(prefs);
    audio.volume = prefs.volume;
    if (prefs.enabled && audio.paused) tryPlay();
  });

  audio.addEventListener("playing", () => {
    stopRetry();
    syncUi();
  });
  audio.addEventListener("pause", () => {
    if (prefs.enabled) {
      syncUi();
      // 非用户静音导致的 pause（卡顿/策略）→ 再拉起
      window.setTimeout(() => {
        if (prefs.enabled && audio.paused) tryPlay();
      }, 200);
    }
  });
  audio.addEventListener("canplay", () => {
    if (prefs.enabled && audio.paused) tryPlay();
  });
  audio.addEventListener("canplaythrough", () => {
    if (prefs.enabled && audio.paused) tryPlay();
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && prefs.enabled) tryPlay();
  });
  window.addEventListener("pageshow", (ev) => {
    if (prefs.enabled) {
      // bfcache 恢复时强制再播
      if (ev.persisted) tryPlay();
      else tryPlay();
    }
  });
  window.addEventListener("focus", () => {
    if (prefs.enabled) tryPlay();
  });

  // 初始 UI：默认按「开启」展示
  applyUi(ui, prefs.enabled ? "playing" : "muted");
  audio.volume = clamp(prefs.volume, 0, 1);

  if (prefs.enabled) {
    audio.muted = false;
    audio.setAttribute("autoplay", "");
    audio.autoplay = true;
    startAutoplayEngine();
    tryPlay();
  } else {
    audio.autoplay = false;
    audio.removeAttribute("autoplay");
    try {
      audio.pause();
    } catch {
      /* ignore */
    }
    syncUi();
  }
}

// 尽早自启
if (typeof window !== "undefined") {
  const boot = () => {
    try {
      initBgm();
    } catch {
      /* ignore */
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
}
