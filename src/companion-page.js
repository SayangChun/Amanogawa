import { saya } from "./data/saya.js";
import { quotesArchive } from "./data/quotes.js";
import {
  greetings,
  companionLines,
  timerPresets,
  timerDoneLines,
  dialogues,
  STORAGE_KEY,
} from "./data/companion.js";
import {
  esc,
  imgSrc,
  bindImageFallbacks,
  initStarfield,
  bindHeader,
  renderSiteHeader,
  renderSiteFooter,
  bindReveal,
} from "./shared.js";

const app = document.querySelector("#app");

/** @typedef {{ firstVisit: string, lastVisitDate: string, streak: number, totalVisits: number, lastDialogueId?: string }} CompanionState */

// ---------- utils ----------

function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDay(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dayDiff(a, b) {
  const ms = parseDay(b) - parseDay(a);
  return Math.round(ms / 86400000);
}

function pickRandom(list, avoidId) {
  if (!list.length) return null;
  if (list.length === 1) return list[0];
  let item = list[Math.floor(Math.random() * list.length)];
  if (avoidId != null) {
    let guard = 0;
    while ((item.id === avoidId || item.text === avoidId) && guard < 8) {
      item = list[Math.floor(Math.random() * list.length)];
      guard += 1;
    }
  }
  return item;
}

/** 时段：5–10 晨 · 10–16 午 · 16–20 傍晚 · 20–24 夜 · 0–5 深夜 */
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

// ---------- storage ----------

function defaultState() {
  const t = todayKey();
  return {
    firstVisit: t,
    lastVisitDate: "",
    streak: 0,
    totalVisits: 0,
    lastDialogueId: dialogues[0]?.id,
  };
}

function loadRawState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}

/** 进入页面时结算回访；同日不重复计 streak / totalVisits */
function touchVisit() {
  const state = loadRawState();
  const today = todayKey();
  if (state.lastVisitDate === today) {
    return state;
  }
  if (!state.lastVisitDate) {
    state.streak = 1;
    state.totalVisits = 1;
    state.firstVisit = today;
  } else {
    const diff = dayDiff(state.lastVisitDate, today);
    state.streak = diff === 1 ? (state.streak || 0) + 1 : 1;
    state.totalVisits = (state.totalVisits || 0) + 1;
  }
  state.lastVisitDate = today;
  saveState(state);
  return state;
}

// ---------- line pool ----------

function buildLinePool() {
  const fromCompanion = companionLines.map((l) => ({
    id: l.id,
    text: l.text,
    badge: "陪伴",
    mood: l.mood,
  }));
  const fromQuotes = quotesArchive
    .filter((q) => q.category === "saya")
    .map((q) => ({
      id: `q-${q.id}`,
      text: q.text,
      badge: q.badge || "星语",
      mood: "star",
    }));
  return [...fromCompanion, ...fromQuotes];
}

const linePool = buildLinePool();

// ---------- page state ----------

const visit = touchVisit();
const period = timePeriod();
const greeting = pickRandom(greetings[period] || greetings.night);

let currentLine = pickRandom(linePool);
let lastLineId = currentLine?.id;

let activeDialogueId = visit.lastDialogueId && dialogues.some((d) => d.id === visit.lastDialogueId)
  ? visit.lastDialogueId
  : dialogues[0]?.id;
let dialogueNodeId = dialogues.find((d) => d.id === activeDialogueId)?.start || "n0";

// timer
let timerPresetId = timerPresets[1]?.id || "15";
let timerTotalMs = (timerPresets.find((p) => p.id === timerPresetId)?.minutes || 15) * 60 * 1000;
let timerRemainMs = timerTotalMs;
let timerRunning = false;
let timerPaused = false;
let timerEnded = false;
let timerDoneText = "";
let timerRaf = 0;
let timerLastTs = 0;

// ---------- render helpers ----------

function visitSubtitle() {
  if (visit.totalVisits <= 1) {
    return "第一次来到这里。今晚，我们从一起看星星开始。";
  }
  const parts = [`这是第 ${visit.totalVisits} 次来看星`];
  if (visit.streak >= 2) {
    parts.push(`已连续 ${visit.streak} 天`);
  }
  return `${parts.join(" · ")}。`;
}

function formatMmSs(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function timerProgress() {
  if (timerTotalMs <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - timerRemainMs / timerTotalMs));
}

function getDialogue() {
  return dialogues.find((d) => d.id === activeDialogueId) || dialogues[0];
}

function getNode() {
  const d = getDialogue();
  return d?.nodes?.[dialogueNodeId] || null;
}

// ---------- shell render ----------

function renderPresence() {
  return `
  <section class="section companion-hero" id="presence">
    <div class="companion-hero-grid">
      <div class="glass companion-presence">
        <p class="eyebrow">
          <span class="dot blue"></span>
          <span>Companion · ${esc(periodLabels[period] || "夜晚")}</span>
          <span class="dot amber"></span>
        </p>
        <h1 class="companion-title">今晚，一起看星星</h1>
        <p class="companion-greeting">「${esc(greeting?.text || "……你来了。")}」</p>
        <p class="companion-visit">${esc(visitSubtitle())}</p>
        <p class="companion-hint">不用赶路。问候、星语、计时与小对话——慢慢挑一样就好。</p>
        <div class="companion-jump">
          <a class="btn btn-ghost" href="#starline">今日星语</a>
          <a class="btn btn-ghost" href="#stargaze">一起看星星</a>
          <a class="btn btn-ghost" href="#dialogue">小对话</a>
        </div>
      </div>
      <div class="companion-portrait glass">
        <img
          src="${imgSrc(saya.heroImage, saya.name)}"
          alt="${esc(saya.name)}"
          width="640"
          height="848"
          loading="eager"
          decoding="async"
          data-fallback="${esc(saya.name)}"
        />
        <div class="companion-portrait-meta">
          <span class="eye-chip blue">Blue</span>
          <span class="eye-chip amber">Amber</span>
          <span class="companion-portrait-name">${esc(saya.name)}</span>
        </div>
      </div>
    </div>
  </section>`;
}

function renderStarline() {
  const line = currentLine;
  return `
  <section class="section" id="starline">
    <div class="section-head gallery-head">
      <div>
        <p class="eyebrow">Starline</p>
        <h2>今日星语</h2>
        <p class="section-desc">一句一句换，像从夜空里捞起细碎的光。</p>
      </div>
      <button type="button" class="btn btn-primary" id="line-refresh">换一句</button>
    </div>
    <article class="glass companion-bubble" id="line-bubble" data-mood="${esc(line?.mood || "soft")}">
      <p class="companion-bubble-text">「${esc(line?.text || "……")}」</p>
      <span class="companion-bubble-badge">${esc(line?.badge || "陪伴")}</span>
    </article>
  </section>`;
}

function renderTimer() {
  const progress = timerProgress();
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);
  const status = timerEnded
    ? "完成"
    : timerRunning
      ? timerPaused
        ? "已暂停"
        : "进行中"
      : "未开始";

  return `
  <section class="section" id="stargaze">
    <div class="section-head">
      <p class="eyebrow">Stargaze</p>
      <h2>一起看星星</h2>
      <p class="section-desc">选一段时长，安静地待着。切到后台会自动暂停。</p>
    </div>
    <div class="glass companion-timer">
      <div class="timer-presets" role="group" aria-label="时长预设">
        ${timerPresets
          .map(
            (p) => `
          <button
            type="button"
            class="filter-btn timer-preset${p.id === timerPresetId ? " is-active" : ""}"
            data-preset="${esc(p.id)}"
            ${timerRunning && !timerPaused ? "disabled" : ""}
          >
            ${esc(p.label)}
            <em class="filter-count">${p.minutes} 分</em>
          </button>`,
          )
          .join("")}
      </div>
      <div class="timer-face">
        <div class="timer-ring-wrap" aria-hidden="true">
          <svg class="timer-ring" viewBox="0 0 120 120">
            <circle class="timer-ring-bg" cx="60" cy="60" r="${r}" />
            <circle
              class="timer-ring-fg"
              cx="60" cy="60" r="${r}"
              stroke-dasharray="${c.toFixed(2)}"
              stroke-dashoffset="${offset.toFixed(2)}"
            />
          </svg>
          <div class="timer-readout">
            <strong id="timer-display">${formatMmSs(timerRemainMs)}</strong>
            <span id="timer-status">${esc(status)}</span>
          </div>
        </div>
        <div class="timer-actions">
          <button type="button" class="btn btn-primary" id="timer-toggle">
            ${timerRunning && !timerPaused ? "暂停" : timerEnded ? "再来一次" : "开始"}
          </button>
          <button type="button" class="btn btn-ghost" id="timer-reset" ${!timerRunning && !timerEnded && timerRemainMs === timerTotalMs ? "disabled" : ""}>
            重置
          </button>
        </div>
      </div>
      <p class="timer-done-line ${timerEnded ? "is-visible" : ""}" id="timer-done" ${timerEnded ? "" : "hidden"}>
        ${timerEnded ? esc(timerDoneText) : ""}
      </p>
    </div>
  </section>`;
}

function renderDialogue() {
  const d = getDialogue();
  const node = getNode();
  const choices = node?.choices || [];
  const isEnd = !choices.length;

  return `
  <section class="section" id="dialogue">
    <div class="section-head">
      <p class="eyebrow">Dialogue</p>
      <h2>小对话</h2>
      <p class="section-desc">短短几句分支对话。气质整理向，非游戏剧本原句。</p>
    </div>
    <div class="glass companion-dialogue">
      <div class="dialogue-tabs" role="tablist" aria-label="对话主题">
        ${dialogues
          .map(
            (item) => `
          <button
            type="button"
            role="tab"
            class="filter-btn${item.id === activeDialogueId ? " is-active" : ""}"
            data-dialogue="${esc(item.id)}"
            aria-selected="${item.id === activeDialogueId}"
          >${esc(item.title)}</button>`,
          )
          .join("")}
      </div>
      <div class="dialogue-stage" id="dialogue-stage">
        <p class="dialogue-speaker">${esc(node?.speaker || saya.name)}</p>
        <p class="dialogue-text">「${esc(node?.text || "……")}」</p>
        ${
          isEnd
            ? `
          <div class="dialogue-choices">
            <button type="button" class="btn btn-primary" data-dialogue-restart>再聊一次</button>
            <button type="button" class="btn btn-ghost" data-dialogue-next-script>换一段</button>
          </div>`
            : `
          <div class="dialogue-choices">
            ${choices
              .map(
                (c, i) => `
              <button type="button" class="dialogue-choice" data-choice-next="${esc(c.next)}">
                ${esc(c.label)}
              </button>`,
              )
              .join("")}
          </div>`
        }
      </div>
    </div>
  </section>`;
}

function renderPage() {
  app.innerHTML = `
    ${renderSiteHeader({ active: "companion", base: "." })}
    <main class="page companion-page">
      ${renderPresence()}
      ${renderStarline()}
      ${renderTimer()}
      ${renderDialogue()}
    </main>
    ${renderSiteFooter(saya)}
  `;
  bindImageFallbacks(app);
  bindHeader("companion");
  bindReveal(app);
  syncTimerDom();
}

// ---------- timer logic ----------

function stopTimerLoop() {
  if (timerRaf) {
    cancelAnimationFrame(timerRaf);
    timerRaf = 0;
  }
  timerLastTs = 0;
}

function tickTimer(ts) {
  if (!timerRunning || timerPaused) return;
  if (!timerLastTs) timerLastTs = ts;
  const delta = ts - timerLastTs;
  timerLastTs = ts;
  timerRemainMs -= delta;
  if (timerRemainMs <= 0) {
    timerRemainMs = 0;
    timerRunning = false;
    timerPaused = false;
    timerEnded = true;
    timerDoneText = pickRandom(timerDoneLines.map((t, i) => ({ id: String(i), text: t })))?.text || timerDoneLines[0];
    stopTimerLoop();
    syncTimerDom();
    return;
  }
  syncTimerDom();
  timerRaf = requestAnimationFrame(tickTimer);
}

function startTimer() {
  if (timerEnded) {
    resetTimer(false);
  }
  timerRunning = true;
  timerPaused = false;
  timerEnded = false;
  timerDoneText = "";
  stopTimerLoop();
  timerRaf = requestAnimationFrame(tickTimer);
  syncTimerDom();
}

function pauseTimer() {
  timerPaused = true;
  stopTimerLoop();
  syncTimerDom();
}

function resetTimer(sync = true) {
  stopTimerLoop();
  const preset = timerPresets.find((p) => p.id === timerPresetId) || timerPresets[0];
  timerTotalMs = (preset?.minutes || 15) * 60 * 1000;
  timerRemainMs = timerTotalMs;
  timerRunning = false;
  timerPaused = false;
  timerEnded = false;
  timerDoneText = "";
  if (sync) syncTimerDom();
}

function setPreset(id) {
  if (timerRunning && !timerPaused) return;
  timerPresetId = id;
  resetTimer(true);
}

function syncTimerDom() {
  const display = document.querySelector("#timer-display");
  const statusEl = document.querySelector("#timer-status");
  const toggle = document.querySelector("#timer-toggle");
  const resetBtn = document.querySelector("#timer-reset");
  const doneEl = document.querySelector("#timer-done");
  const fg = document.querySelector(".timer-ring-fg");
  const presets = document.querySelectorAll("[data-preset]");

  if (display) display.textContent = formatMmSs(timerRemainMs);
  if (statusEl) {
    statusEl.textContent = timerEnded
      ? "完成"
      : timerRunning
        ? timerPaused
          ? "已暂停"
          : "进行中"
        : "未开始";
  }
  if (toggle) {
    toggle.textContent =
      timerRunning && !timerPaused ? "暂停" : timerEnded ? "再来一次" : timerPaused ? "继续" : "开始";
  }
  if (resetBtn) {
    const pristine = !timerRunning && !timerEnded && timerRemainMs === timerTotalMs;
    resetBtn.disabled = pristine;
  }
  if (doneEl) {
    if (timerEnded) {
      doneEl.hidden = false;
      doneEl.classList.add("is-visible");
      doneEl.textContent = timerDoneText;
    } else {
      doneEl.hidden = true;
      doneEl.classList.remove("is-visible");
      doneEl.textContent = "";
    }
  }
  if (fg) {
    const r = 54;
    const c = 2 * Math.PI * r;
    const progress = timerProgress();
    fg.setAttribute("stroke-dasharray", c.toFixed(2));
    fg.setAttribute("stroke-dashoffset", (c * (1 - progress)).toFixed(2));
  }
  presets.forEach((btn) => {
    const on = btn.dataset.preset === timerPresetId;
    btn.classList.toggle("is-active", on);
    btn.disabled = timerRunning && !timerPaused;
  });
}

// ---------- dialogue ----------

function selectDialogue(id, restart = true) {
  activeDialogueId = id;
  const d = getDialogue();
  if (restart) dialogueNodeId = d?.start || "n0";
  const state = loadRawState();
  state.lastDialogueId = id;
  saveState(state);
  refreshDialogueSection();
}

function advanceDialogue(nextId) {
  dialogueNodeId = nextId;
  refreshDialogueSection();
}

function restartDialogue() {
  const d = getDialogue();
  dialogueNodeId = d?.start || "n0";
  refreshDialogueSection();
}

function nextDialogueScript() {
  const idx = dialogues.findIndex((d) => d.id === activeDialogueId);
  const next = dialogues[(idx + 1) % dialogues.length];
  selectDialogue(next.id, true);
}

function refreshDialogueSection() {
  const section = document.querySelector("#dialogue");
  if (!section) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = renderDialogue();
  const next = wrap.firstElementChild;
  section.replaceWith(next);
  next.classList.add("reveal", "is-visible");
}

function refreshStarline() {
  currentLine = pickRandom(linePool, lastLineId);
  lastLineId = currentLine?.id;
  const bubble = document.querySelector("#line-bubble");
  if (!bubble || !currentLine) return;
  bubble.dataset.mood = currentLine.mood || "soft";
  bubble.querySelector(".companion-bubble-text").textContent = `「${currentLine.text}」`;
  bubble.querySelector(".companion-bubble-badge").textContent = currentLine.badge || "陪伴";
  bubble.classList.remove("is-pop");
  // force reflow for animation restart
  void bubble.offsetWidth;
  bubble.classList.add("is-pop");
}

// ---------- events（委托到 #app，避免局部重绘丢监听） ----------

function bindEvents() {
  app.addEventListener("click", (e) => {
    if (e.target.closest("#line-refresh")) {
      refreshStarline();
      return;
    }

    const preset = e.target.closest("[data-preset]");
    if (preset && !preset.disabled) {
      setPreset(preset.dataset.preset);
      return;
    }

    if (e.target.closest("#timer-toggle")) {
      if (timerEnded) {
        startTimer();
      } else if (timerRunning && !timerPaused) {
        pauseTimer();
      } else {
        startTimer();
      }
      return;
    }

    if (e.target.closest("#timer-reset")) {
      resetTimer(true);
      return;
    }

    const tab = e.target.closest("[data-dialogue]");
    if (tab) {
      selectDialogue(tab.dataset.dialogue, true);
      return;
    }

    const choice = e.target.closest("[data-choice-next]");
    if (choice) {
      advanceDialogue(choice.dataset.choiceNext);
      return;
    }

    if (e.target.closest("[data-dialogue-restart]")) {
      restartDialogue();
      return;
    }

    if (e.target.closest("[data-dialogue-next-script]")) {
      nextDialogueScript();
    }
  });
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden && timerRunning && !timerPaused) {
    pauseTimer();
  }
});

// ---------- boot ----------

bindEvents();
renderPage();
initStarfield();
