import { saya } from "./data/saya.js";
import { quotesArchive } from "./data/quotes.js";
import {
  greetings,
  birthdayGreetings,
  careTasks,
  companionLines,
  timerPresets,
  timerDoneLines,
  dialogues,
  interactions,
  STORAGE_KEY,
} from "./data/companion.js";
import {
  calmStates,
  breathPhases,
  calmGroundLines,
  calmMarginPlaceholder,
  calmCompleteLines,
  calmStepMeta,
} from "./data/calm.js";
import {
  gainAffinity,
  getAffinityValue,
  getAffinityStage,
  getUnlockedLines,
  ensureAffinityToastHost,
  onAffinityChange,
  applySiteAppearance,
  resolveFrameId,
  claimBirthdayGift,
  hasClaimedBirthdayGift,
} from "./affinity-core.js";
import { isBirthday, birthdayBannerCopy } from "./birthday.js";
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

/**
 * @typedef {{
 *   firstVisit: string,
 *   lastVisitDate: string,
 *   streak: number,
 *   totalVisits: number,
 *   lastDialogueId?: string,
 *   careDay?: string,
 *   careDone?: string[],
 *   calmDay?: string,
 *   calmCount?: number,
 * }} CompanionState
 */

// ---------- utils ----------

function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function availableInteractions(affinity = getAffinityValue()) {
  return interactions.filter((i) => (i.minAffinity ?? 0) <= affinity);
}

function availableDialogues(affinity = getAffinityValue()) {
  return dialogues.filter((d) => (d.minAffinity ?? 0) <= affinity);
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

// ---------- companion storage（不含好感） ----------

function defaultState() {
  const t = todayKey();
  return {
    firstVisit: t,
    lastVisitDate: "",
    streak: 0,
    totalVisits: 0,
    lastDialogueId: dialogues[0]?.id,
    careDay: "",
    careDone: [],
    calmDay: "",
    calmCount: 0,
  };
}

function loadRawState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      careDone: Array.isArray(parsed.careDone) ? parsed.careDone.map(String) : [],
      calmCount: Number.isFinite(Number(parsed.calmCount)) ? Number(parsed.calmCount) : 0,
    };
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  try {
    // 只持久化陪伴字段，避免把旧好感字段继续写回
    const slim = {
      firstVisit: state.firstVisit,
      lastVisitDate: state.lastVisitDate,
      streak: state.streak,
      totalVisits: state.totalVisits,
      lastDialogueId: state.lastDialogueId,
      careDay: state.careDay || "",
      careDone: Array.isArray(state.careDone) ? state.careDone : [],
      calmDay: state.calmDay || "",
      calmCount: state.calmCount || 0,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch {
    /* ignore quota / private mode */
  }
}

/** 跨日重置关心清单勾选 */
function ensureCareDay(state, today = todayKey()) {
  if (state.careDay !== today) {
    state.careDay = today;
    state.careDone = [];
  }
  return state;
}

/** 跨日重置心事安放次数 */
function ensureCalmDay(state, today = todayKey()) {
  if (state.calmDay !== today) {
    state.calmDay = today;
    state.calmCount = 0;
  }
  return state;
}

function getCalmCountToday() {
  const state = ensureCalmDay(loadRawState());
  return state.calmCount || 0;
}

function getCareDoneSet() {
  const state = ensureCareDay(loadRawState());
  return new Set(state.careDone || []);
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
  // 好感独立系统：陪伴日访加分
  gainAffinity("companionVisit");
  return loadRawState();
}

// ---------- line pool ----------

function buildLinePool(affinity = 0) {
  const fromCompanion = companionLines.map((l) => ({
    id: l.id,
    text: l.text,
    badge: "陪伴",
    mood: l.mood,
  }));
  const fromUnlock = getUnlockedLines(affinity).map((l) => ({
    id: l.id,
    text: l.text,
    badge: "心意",
    mood: l.mood,
  }));
  const fromQuotes = quotesArchive
    .filter((q) => q.category === "saya" || q.category === "ai")
    .map((q) => ({
      id: `q-${q.id}`,
      text: q.text,
      badge: q.category === "ai" ? "AI仿作" : q.badge || "星笺",
      mood: "star",
    }));
  return [...fromCompanion, ...fromUnlock, ...fromQuotes];
}

let linePool = [];

function rebuildLinePool() {
  linePool = buildLinePool(getAffinityValue());
}

// ---------- page state ----------

const visit = touchVisit();
rebuildLinePool();

const period = timePeriod();
const onBirthday = isBirthday();
const greeting = onBirthday
  ? pickRandom(birthdayGreetings)
  : pickRandom(greetings[period] || greetings.night);

let currentLine = pickRandom(linePool);
let lastLineId = currentLine?.id;

/** 随口互动：当前选中的互动与回复 */
let currentInteractionId = availableInteractions()[0]?.id || "";
let currentInteractionReply = null;
let lastInteractionReplyText = "";

/** 关心清单最近一次回复 */
let lastCareReply = null;

/**
 * 心事安放仪式状态
 * step: pick | hold | ground | release | done
 */
let calmStep = "pick";
let calmStateId = calmStates[0]?.id || "spin";
let calmMarginNote = "";
/** @type {{ text: string, mood?: string } | null} */
let calmHoldReply = null;
/** @type {{ text: string, mood?: string } | null} */
let calmReleaseReply = null;
/** @type {{ text: string } | null} */
let calmDoneLine = null;
let calmBreathPhaseIndex = 0;
let calmBreathCycle = 0;
let calmBreathRemainMs = 0;
let calmBreathRunning = false;
let calmBreathRaf = 0;
let calmBreathLastTs = 0;
let calmGroundSideLine = "";
const CALM_BREATH_TARGET_CYCLES = 3;

const openDialogues = () => availableDialogues();
let activeDialogueId =
  visit.lastDialogueId && openDialogues().some((d) => d.id === visit.lastDialogueId)
    ? visit.lastDialogueId
    : openDialogues()[0]?.id;
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
    return "第一次来到这里。……被当成局外人可不行，今晚从一起看星星开始。";
  }
  const parts = [`这是第 ${visit.totalVisits} 次来看星`];
  if (visit.streak >= 7) {
    parts.push(`已经连续 ${visit.streak} 天了，沙夜会认真记住的`);
  } else if (visit.streak >= 2) {
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
  const list = openDialogues();
  return list.find((d) => d.id === activeDialogueId) || list[0] || dialogues[0];
}

function getNode() {
  const d = getDialogue();
  return d?.nodes?.[dialogueNodeId] || null;
}

function renderAffinityEntry() {
  const value = getAffinityValue();
  const stage = getAffinityStage(value);
  return `
  <a class="affinity-entry glass" href="./affinity.html" id="affinity-entry">
    <span class="affinity-entry-label">
      <span class="dot blue"></span>
      好感
      <span class="dot amber"></span>
    </span>
    <span class="affinity-entry-stage">${esc(stage.name)}</span>
    <span class="affinity-entry-value"><strong>${value}</strong> / 100</span>
    <span class="affinity-entry-go">查看心意轨迹 →</span>
  </a>`;
}

function renderBirthdayBanner() {
  const copy = birthdayBannerCopy();
  // 仅生日当天或 30 天内显示，避免常年占版面
  if (copy.kind === "countdown") return "";
  const claimed = hasClaimedBirthdayGift();
  const isToday = copy.kind === "today";
  return `
  <section class="birthday-banner glass${isToday ? " is-today" : ""}" id="birthday-banner" aria-label="生日">
    <div class="birthday-banner-copy">
      <p class="birthday-banner-kicker">${isToday ? "Birthday Night" : "Countdown"}</p>
      <h2 class="birthday-banner-title">${esc(copy.title)}</h2>
      <p class="birthday-banner-text">${esc(copy.text)}</p>
    </div>
    ${
      isToday
        ? `<button type="button" class="btn btn-primary" id="birthday-gift-btn" ${claimed ? "disabled" : ""}>
            ${claimed ? "今年的心意已收下" : "收下生日心意"}
          </button>`
        : ""
    }
  </section>`;
}

// ---------- shell render ----------

function renderPresence() {
  const stage = getAffinityStage(getAffinityValue());
  const frameId = resolveFrameId();
  const periodLabel = onBirthday ? "生日" : periodLabels[period] || "夜晚";
  return `
  <section class="section companion-hero" id="presence">
    ${renderBirthdayBanner()}
    <div class="companion-hero-grid">
      <div class="glass companion-presence">
        <p class="eyebrow">
          <span class="dot blue"></span>
          <span>Companion · ${esc(periodLabel)}</span>
          <span class="dot amber"></span>
        </p>
        <h1 class="companion-title">${onBirthday ? "生日快乐，沙夜" : "今晚，一起看星星"}</h1>
        <p class="companion-greeting">「${esc(greeting?.text || "……你来了。")}」</p>
        <p class="companion-visit">${esc(visitSubtitle())}</p>
        ${renderAffinityEntry()}
        <p class="companion-hint">不用赶路。心事安放、关心清单、随口互动、星笺、计时与小对话——慢慢挑一样就好。互动也会悄悄加深<a href="./affinity.html">好感</a>。</p>
        <div class="companion-jump">
          <a class="btn btn-ghost" href="#calm">心事安放</a>
          <a class="btn btn-ghost" href="#care">每日关心</a>
          <a class="btn btn-ghost" href="#interact">随口互动</a>
          <a class="btn btn-ghost" href="#starline">今日星笺</a>
          <a class="btn btn-ghost" href="#stargaze">一起看星星</a>
          <a class="btn btn-ghost" href="#dialogue">小对话</a>
          <a class="btn btn-primary" href="./affinity.html">好感页</a>
        </div>
      </div>
      <div class="companion-portrait glass portrait-frame portrait-frame--${esc(frameId)}">
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
          <a class="affinity-chip" href="./affinity.html" title="打开好感页">${esc(stage.short)}</a>
          <span class="companion-portrait-name">${esc(saya.name)}</span>
        </div>
      </div>
    </div>
  </section>`;
}

function getCalmState() {
  return calmStates.find((s) => s.id === calmStateId) || calmStates[0];
}

function getBreathPhase() {
  return breathPhases[calmBreathPhaseIndex] || breathPhases[0];
}

function renderCalmBreathVisual() {
  const phase = getBreathPhase();
  const phaseId = phase?.id || "in";
  const remainSec = Math.max(0, Math.ceil(calmBreathRemainMs / 1000));
  const totalSec = phase?.seconds || 4;
  const progress = totalSec > 0 ? 1 - calmBreathRemainMs / (totalSec * 1000) : 0;
  return `
    <div class="calm-breath" data-phase="${esc(phaseId)}" aria-live="polite">
      <div class="calm-breath-orbs" aria-hidden="true">
        <span class="calm-orb calm-orb-blue"></span>
        <span class="calm-orb calm-orb-amber"></span>
      </div>
      <div class="calm-breath-readout">
        <strong class="calm-breath-phase">${esc(phase?.label || "呼吸")}</strong>
        <span class="calm-breath-count">${remainSec}s</span>
        <p class="calm-breath-cue">${esc(phase?.cue || "")}</p>
      </div>
      <div class="calm-breath-bar" aria-hidden="true">
        <span class="calm-breath-bar-fill" style="width:${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%"></span>
      </div>
      <p class="calm-breath-meta">第 ${Math.min(calmBreathCycle + 1, CALM_BREATH_TARGET_CYCLES)} / ${CALM_BREATH_TARGET_CYCLES} 轮${
        calmBreathCycle >= 1 ? " · 可以进入下一步" : " · 至少完整一轮"
      }</p>
    </div>`;
}

function renderCalm() {
  const meta = calmStepMeta[calmStep] || calmStepMeta.pick;
  const state = getCalmState();
  const todayCount = getCalmCountToday();
  const hold = calmHoldReply;
  const release = calmReleaseReply;
  const doneLine = calmDoneLine;

  let body = "";

  if (calmStep === "pick") {
    body = `
      <div class="calm-pick" role="group" aria-label="现在的感觉">
        ${calmStates
          .map(
            (s) => `
          <button
            type="button"
            class="calm-chip${s.id === calmStateId ? " is-active" : ""}"
            data-calm-state="${esc(s.id)}"
            title="${esc(s.hint || s.label)}"
          >
            <span class="calm-chip-icon">${esc(s.icon || "·")}</span>
            <span class="calm-chip-label">${esc(s.label)}</span>
            <span class="calm-chip-hint">${esc(s.hint || "")}</span>
          </button>`,
          )
          .join("")}
      </div>
      <label class="calm-margin">
        <span class="calm-margin-label">页边一行（可选）</span>
        <textarea
          id="calm-margin-input"
          class="calm-margin-input"
          rows="2"
          maxlength="80"
          placeholder="${esc(calmMarginPlaceholder)}"
        >${esc(calmMarginNote)}</textarea>
        <span class="calm-margin-hint">只存在本机浏览器，刷新前可改；不会上传到任何服务器。</span>
      </label>
      <div class="calm-actions">
        <button type="button" class="btn btn-primary" data-calm-start>……说给你听</button>
      </div>`;
  } else if (calmStep === "hold") {
    body = `
      <p class="calm-you">你 · ${esc(state?.label || "……")}</p>
      ${
        calmMarginNote
          ? `<p class="calm-margin-echo">页边：「${esc(calmMarginNote)}」</p>`
          : ""
      }
      <article class="companion-bubble calm-reply is-pop" data-mood="${esc(hold?.mood || "soft")}">
        <p class="companion-bubble-text">「${esc(hold?.text || "……我在听。")}」</p>
        <span class="companion-bubble-badge">沙夜</span>
      </article>
      <div class="calm-actions">
        <button type="button" class="btn btn-primary" data-calm-to-ground>好，我们落地</button>
        <button type="button" class="btn btn-ghost" data-calm-reset>重选感觉</button>
      </div>`;
  } else if (calmStep === "ground") {
    body = `
      <p class="calm-ground-hint">${esc(state?.groundHint || calmGroundLines[0])}</p>
      ${
        calmGroundSideLine
          ? `<p class="calm-ground-side">「${esc(calmGroundSideLine)}」</p>`
          : ""
      }
      ${renderCalmBreathVisual()}
      <div class="calm-actions">
        ${
          calmBreathRunning
            ? `<button type="button" class="btn btn-ghost" data-calm-breath-pause>暂停呼吸</button>`
            : `<button type="button" class="btn btn-primary" data-calm-breath-start>${
                calmBreathCycle > 0 || calmBreathRemainMs > 0 ? "继续呼吸" : "开始双星呼吸"
              }</button>`
        }
        <button
          type="button"
          class="btn btn-ghost"
          data-calm-to-release
          ${calmBreathCycle < 1 ? "disabled" : ""}
          title="${calmBreathCycle < 1 ? "请先完成至少一轮呼吸" : "进入抬头一步"}"
        >呼吸够了，抬头</button>
      </div>`;
  } else if (calmStep === "release") {
    body = `
      <div class="calm-release-stage${calmMarginNote ? " has-note" : ""}">
        <div class="calm-sky" aria-hidden="true">
          <span class="calm-sky-star s1"></span>
          <span class="calm-sky-star s2"></span>
          <span class="calm-sky-star s3"></span>
          <span class="calm-sky-star s4"></span>
          <span class="calm-sky-star s5"></span>
        </div>
        <p class="calm-release-note">
          ${
            calmMarginNote
              ? `页边已记下：「${esc(calmMarginNote)}」`
              : `页边写着：「${esc(state?.label || "此刻的心事")} · 已安放」`
          }
        </p>
      </div>
      <article class="companion-bubble calm-reply is-pop" data-mood="${esc(release?.mood || "soft")}">
        <p class="companion-bubble-text">「${esc(release?.text || "……抬头。")}」</p>
        <span class="companion-bubble-badge">沙夜</span>
      </article>
      <div class="calm-actions">
        <button type="button" class="btn btn-primary" data-calm-finish>安放好了</button>
      </div>`;
  } else {
    // done
    body = `
      <article class="companion-bubble calm-reply is-pop" data-mood="care">
        <p class="companion-bubble-text">「${esc(doneLine?.text || calmCompleteLines[0])}」</p>
        <span class="companion-bubble-badge">沙夜</span>
      </article>
      <p class="calm-done-summary">
        今日已安放 <strong>${todayCount}</strong> 次
        · 想继续安静待着，可以去
        <a href="#stargaze">一起看星星</a>
        或
        <a href="#care">关心清单</a>
      </p>
      <div class="calm-actions">
        <button type="button" class="btn btn-primary" data-calm-reset>再安放一次</button>
        <a class="btn btn-ghost" href="#stargaze">去看星星</a>
      </div>`;
  }

  return `
  <section class="section" id="calm">
    <div class="section-head">
      <p class="eyebrow">Calm</p>
      <h2>心事安放</h2>
      <p class="section-desc">焦虑或内耗时：先被接住，再跟着双星呼吸，把一行字写进页边、抬头看星。气质陪伴向，非医疗建议。完成仪式 +2 好感（日上限 4）。</p>
    </div>
    <div class="glass companion-calm" data-step="${esc(calmStep)}">
      <div class="calm-step-head">
        <p class="calm-step-eyebrow">${esc(meta.eyebrow)}</p>
        <h3 class="calm-step-title">${esc(meta.title)}</h3>
        <p class="calm-step-desc">${esc(meta.desc)}</p>
      </div>
      <div class="calm-progress" aria-hidden="true">
        ${["pick", "hold", "ground", "release", "done"]
          .map((s, i) => {
            const order = ["pick", "hold", "ground", "release", "done"];
            const cur = order.indexOf(calmStep);
            const cls = i < cur ? "is-done" : i === cur ? "is-current" : "";
            return `<span class="calm-dot ${cls}"></span>`;
          })
          .join("")}
      </div>
      ${body}
    </div>
  </section>`;
}

function renderCare() {
  const done = getCareDoneSet();
  const doneCount = careTasks.filter((t) => done.has(t.id)).length;
  const reply = lastCareReply;
  return `
  <section class="section" id="care">
    <div class="section-head">
      <p class="eyebrow">Care</p>
      <h2>通い妻关心清单</h2>
      <p class="section-desc">今天有没有好好照顾自己？勾选后她会回你一句。每日每项 +1 好感（上限 4）。</p>
    </div>
    <div class="glass companion-care">
      <div class="care-progress" aria-live="polite">
        今日已确认 <strong>${doneCount}</strong> / ${careTasks.length}
      </div>
      <ul class="care-list" role="list">
        ${careTasks
          .map((task) => {
            const checked = done.has(task.id);
            return `
          <li>
            <button
              type="button"
              class="care-item${checked ? " is-done" : ""}"
              data-care="${esc(task.id)}"
              aria-pressed="${checked}"
              ${checked ? "disabled" : ""}
            >
              <span class="care-check" aria-hidden="true">${checked ? "✓" : ""}</span>
              <span class="care-body">
                <span class="care-label">${esc(task.label)}</span>
                <span class="care-icon">${esc(task.icon || "")}</span>
              </span>
            </button>
          </li>`;
          })
          .join("")}
      </ul>
      <article
        class="companion-bubble care-reply${reply ? " is-pop" : ""}"
        id="care-bubble"
        data-mood="${esc(reply?.mood || "care")}"
      >
        <p class="companion-bubble-text" id="care-text">
          ${
            reply
              ? `「${esc(reply.text)}」`
              : doneCount === careTasks.length
                ? "「……今天的你，我记下了。好好的，比什么都重要。」"
                : "「不用一次做完。想到哪一项，就勾上哪一项。」"
          }
        </p>
        <span class="companion-bubble-badge">${reply || doneCount ? "沙夜" : "关心"}</span>
      </article>
    </div>
  </section>`;
}

function renderInteract() {
  const reply = currentInteractionReply;
  const pool = availableInteractions();
  const locked = interactions.filter((i) => (i.minAffinity ?? 0) > getAffinityValue());
  const active = pool.find((i) => i.id === currentInteractionId) || pool[0];
  return `
  <section class="section" id="interact">
    <div class="section-head">
      <p class="eyebrow">Interact</p>
      <h2>随口互动</h2>
      <p class="section-desc">点一句你想说的，沙夜会按她的性子接住——气质整理向，非剧本原句。部分句子随好感阶段解锁。</p>
    </div>
    <div class="glass companion-interact">
      <div class="interact-actions" role="group" aria-label="对沙夜说">
        ${pool
          .map(
            (item) => `
          <button
            type="button"
            class="interact-chip${item.id === currentInteractionId && reply ? " is-active" : ""}${item.minAffinity ? " is-unlock" : ""}"
            data-interact="${esc(item.id)}"
            title="${esc(item.hint || item.label)}"
          >
            <span class="interact-chip-label">${esc(item.label)}</span>
            ${item.hint ? `<span class="interact-chip-hint">${esc(item.hint)}</span>` : ""}
          </button>`,
          )
          .join("")}
      </div>
      ${
        locked.length
          ? `<p class="interact-locked-hint">还有 ${locked.length} 句随好感解锁（下一档约 ${locked[0].minAffinity}+）· <a href="./affinity.html#milestones">查看里程碑</a></p>`
          : ""
      }
      <article
        class="companion-bubble interact-reply${reply ? " is-pop" : ""}"
        id="interact-bubble"
        data-mood="${esc(reply?.mood || "soft")}"
      >
        <p class="interact-you">${
          reply
            ? `你 · ${esc(active?.label || "……")}`
            : "选上面任意一句，像在夜空下轻声开口。"
        }</p>
        <p class="companion-bubble-text" id="interact-text">
          ${reply ? `「${esc(reply.text)}」` : "「……我在听。」"}
        </p>
        <span class="companion-bubble-badge">${reply ? "沙夜" : "等待"}</span>
      </article>
      ${
        reply
          ? `<div class="interact-again">
              <button type="button" class="btn btn-ghost" data-interact-again>她再说一遍（换句）</button>
            </div>`
          : ""
      }
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
        <h2>今日星笺</h2>
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
  const list = openDialogues();
  const d = getDialogue();
  const node = getNode();
  const choices = node?.choices || [];
  const isEnd = !choices.length;
  const lockedDialogues = dialogues.filter((x) => (x.minAffinity ?? 0) > getAffinityValue());

  return `
  <section class="section" id="dialogue">
    <div class="section-head">
      <p class="eyebrow">Dialogue</p>
      <h2>小对话</h2>
      <p class="section-desc">多主题分支对话（观星、便当、吃醋、雨夜……）。气质整理向，非游戏剧本原句。高好感会多出隐藏主题。</p>
    </div>
    <div class="glass companion-dialogue">
      <div class="dialogue-tabs" role="tablist" aria-label="对话主题">
        ${list
          .map(
            (item) => `
          <button
            type="button"
            role="tab"
            class="filter-btn${item.id === activeDialogueId ? " is-active" : ""}${item.minAffinity ? " is-unlock" : ""}"
            data-dialogue="${esc(item.id)}"
            aria-selected="${item.id === activeDialogueId}"
          >${esc(item.title)}</button>`,
          )
          .join("")}
      </div>
      ${
        lockedDialogues.length
          ? `<p class="interact-locked-hint">隐藏对话 ${lockedDialogues.map((x) => `「${esc(x.title)}」需 ${x.minAffinity}+`).join(" · ")}</p>`
          : ""
      }
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
                (c) => `
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
  applySiteAppearance();
  app.innerHTML = `
    ${renderSiteHeader({ active: "companion", base: "." })}
    <main class="page companion-page">
      ${renderPresence()}
      ${renderCalm()}
      ${renderCare()}
      ${renderInteract()}
      ${renderStarline()}
      ${renderTimer()}
      ${renderDialogue()}
    </main>
    ${renderSiteFooter(saya)}
  `;
  ensureAffinityToastHost();
  bindImageFallbacks(app);
  bindHeader("companion");
  bindReveal(app);
  syncTimerDom();
}

function refreshAffinityEntry() {
  const host = document.querySelector("#affinity-entry");
  if (host) {
    const wrap = document.createElement("div");
    wrap.innerHTML = renderAffinityEntry();
    host.replaceWith(wrap.firstElementChild);
  }
  const chip = document.querySelector(".affinity-chip");
  if (chip) chip.textContent = getAffinityStage(getAffinityValue()).short;
  const portrait = document.querySelector(".companion-portrait");
  if (portrait) {
    portrait.className = `companion-portrait glass portrait-frame portrait-frame--${resolveFrameId()}`;
  }
}

function refreshCareSection() {
  const section = document.querySelector("#care");
  if (!section) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = renderCare();
  const next = wrap.firstElementChild;
  section.replaceWith(next);
  next.classList.add("reveal", "is-visible");
  const bubble = next.querySelector("#care-bubble");
  if (bubble && lastCareReply) {
    bubble.classList.remove("is-pop");
    void bubble.offsetWidth;
    bubble.classList.add("is-pop");
  }
}

// ---------- 心事安放 ----------

function stopCalmBreathLoop() {
  if (calmBreathRaf) {
    cancelAnimationFrame(calmBreathRaf);
    calmBreathRaf = 0;
  }
  calmBreathLastTs = 0;
}

function syncCalmBreathDom() {
  const root = document.querySelector(".calm-breath");
  if (!root || calmStep !== "ground") return;
  const phase = getBreathPhase();
  const phaseId = phase?.id || "in";
  const remainSec = Math.max(0, Math.ceil(calmBreathRemainMs / 1000));
  const totalSec = phase?.seconds || 4;
  const progress = totalSec > 0 ? 1 - calmBreathRemainMs / (totalSec * 1000) : 0;

  root.dataset.phase = phaseId;
  const phaseEl = root.querySelector(".calm-breath-phase");
  const countEl = root.querySelector(".calm-breath-count");
  const cueEl = root.querySelector(".calm-breath-cue");
  const fill = root.querySelector(".calm-breath-bar-fill");
  const meta = root.querySelector(".calm-breath-meta");
  if (phaseEl) phaseEl.textContent = phase?.label || "呼吸";
  if (countEl) countEl.textContent = `${remainSec}s`;
  if (cueEl) cueEl.textContent = phase?.cue || "";
  if (fill) fill.style.width = `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%`;
  if (meta) {
    meta.textContent = `第 ${Math.min(calmBreathCycle + 1, CALM_BREATH_TARGET_CYCLES)} / ${CALM_BREATH_TARGET_CYCLES} 轮${
      calmBreathCycle >= 1 ? " · 可以进入下一步" : " · 至少完整一轮"
    }`;
  }

  const releaseBtn = document.querySelector("[data-calm-to-release]");
  if (releaseBtn) {
    releaseBtn.disabled = calmBreathCycle < 1;
    releaseBtn.title = calmBreathCycle < 1 ? "请先完成至少一轮呼吸" : "进入抬头一步";
  }
}

function advanceCalmBreathPhase() {
  calmBreathPhaseIndex += 1;
  if (calmBreathPhaseIndex >= breathPhases.length) {
    calmBreathPhaseIndex = 0;
    calmBreathCycle += 1;
    if (calmBreathCycle === 1 || calmBreathCycle === CALM_BREATH_TARGET_CYCLES) {
      calmGroundSideLine =
        pickRandom(calmGroundLines.map((t, i) => ({ id: String(i), text: t })))?.text ||
        calmGroundLines[0];
      const side = document.querySelector(".calm-ground-side");
      if (side) {
        side.textContent = `「${calmGroundSideLine}」`;
      } else {
        refreshCalmSection({ preserveBreath: true });
        return;
      }
    }
  }
  const phase = getBreathPhase();
  calmBreathRemainMs = (phase?.seconds || 4) * 1000;
  syncCalmBreathDom();
}

function tickCalmBreath(ts) {
  if (!calmBreathRunning || calmStep !== "ground") return;
  if (!calmBreathLastTs) calmBreathLastTs = ts;
  const delta = ts - calmBreathLastTs;
  calmBreathLastTs = ts;
  calmBreathRemainMs -= delta;
  if (calmBreathRemainMs <= 0) {
    advanceCalmBreathPhase();
  } else {
    syncCalmBreathDom();
  }
  if (calmBreathRunning) {
    calmBreathRaf = requestAnimationFrame(tickCalmBreath);
  }
}

function startCalmBreath() {
  if (calmStep !== "ground") return;
  if (calmBreathRemainMs <= 0) {
    const phase = getBreathPhase();
    calmBreathRemainMs = (phase?.seconds || 4) * 1000;
  }
  calmBreathRunning = true;
  stopCalmBreathLoop();
  calmBreathRaf = requestAnimationFrame(tickCalmBreath);
  refreshCalmSection({ preserveBreath: true });
}

function pauseCalmBreath() {
  calmBreathRunning = false;
  stopCalmBreathLoop();
  refreshCalmSection({ preserveBreath: true });
}

function readMarginFromDom() {
  const input = document.querySelector("#calm-margin-input");
  if (input && "value" in input) {
    calmMarginNote = String(input.value || "").trim().slice(0, 80);
  }
}

function startCalmRitual() {
  readMarginFromDom();
  const state = getCalmState();
  if (!state) return;
  stopCalmBreathLoop();
  calmBreathRunning = false;
  calmHoldReply = pickRandom(
    (state.holdReplies || []).map((r, i) => ({
      id: `${state.id}-h-${i}`,
      text: r.text,
      mood: r.mood || "soft",
    })),
  );
  calmStep = "hold";
  refreshCalmSection();
}

function goCalmGround() {
  stopCalmBreathLoop();
  calmBreathRunning = false;
  calmBreathPhaseIndex = 0;
  calmBreathCycle = 0;
  calmBreathRemainMs = (breathPhases[0]?.seconds || 4) * 1000;
  calmGroundSideLine = "";
  calmStep = "ground";
  refreshCalmSection();
}

function goCalmRelease() {
  if (calmBreathCycle < 1) return;
  stopCalmBreathLoop();
  calmBreathRunning = false;
  const state = getCalmState();
  calmReleaseReply = pickRandom(
    (state?.releaseReplies || []).map((r, i) => ({
      id: `${state.id}-r-${i}`,
      text: r.text,
      mood: r.mood || "soft",
    })),
  );
  calmStep = "release";
  refreshCalmSection();
}

function finishCalmRitual() {
  stopCalmBreathLoop();
  calmBreathRunning = false;
  const state = ensureCalmDay(loadRawState());
  state.calmCount = (state.calmCount || 0) + 1;
  saveState(state);
  calmDoneLine = pickRandom(
    calmCompleteLines.map((t, i) => ({ id: String(i), text: t })),
  );
  calmStep = "done";
  gainAffinity("calmSession");
  refreshCalmSection();
}

function resetCalmRitual() {
  stopCalmBreathLoop();
  calmBreathRunning = false;
  calmStep = "pick";
  calmHoldReply = null;
  calmReleaseReply = null;
  calmDoneLine = null;
  calmBreathPhaseIndex = 0;
  calmBreathCycle = 0;
  calmBreathRemainMs = 0;
  calmGroundSideLine = "";
  // keep calmStateId & calmMarginNote so user can tweak
  refreshCalmSection();
}

/**
 * @param {{ preserveBreath?: boolean }} [opts]
 */
function refreshCalmSection(opts = {}) {
  const section = document.querySelector("#calm");
  if (!section) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = renderCalm();
  const next = wrap.firstElementChild;
  section.replaceWith(next);
  next.classList.add("reveal", "is-visible");
  const panel = next.querySelector(".companion-calm");
  if (panel) {
    panel.classList.add("reveal", "is-visible");
  }
  if (opts.preserveBreath && calmBreathRunning) {
    stopCalmBreathLoop();
    calmBreathRaf = requestAnimationFrame(tickCalmBreath);
  }
  const bubbles = next.querySelectorAll(".calm-reply");
  bubbles.forEach((bubble) => {
    bubble.classList.remove("is-pop");
    void bubble.offsetWidth;
    bubble.classList.add("is-pop");
  });
}

function toggleCareTask(taskId) {
  const task = careTasks.find((t) => t.id === taskId);
  if (!task) return;
  const state = ensureCareDay(loadRawState());
  const done = new Set(state.careDone || []);
  if (done.has(taskId)) return;
  done.add(taskId);
  state.careDone = [...done];
  saveState(state);
  const reply = pickRandom(
    task.replies.map((r, i) => ({ id: `${task.id}-${i}`, text: r.text, mood: r.mood || "care" })),
  );
  lastCareReply = reply;
  gainAffinity("careCheck");
  refreshCareSection();
}

function tryBirthdayGift() {
  const result = claimBirthdayGift();
  const btn = document.querySelector("#birthday-gift-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = result.applied > 0 ? "心意已收下" : "今年的心意已收下";
  }
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
    timerDoneText =
      pickRandom(timerDoneLines.map((t, i) => ({ id: String(i), text: t })))?.text ||
      timerDoneLines[0];
    stopTimerLoop();
    syncTimerDom();
    gainAffinity("timerDone", { presetId: timerPresetId });
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
      timerRunning && !timerPaused
        ? "暂停"
        : timerEnded
          ? "再来一次"
          : timerPaused
            ? "继续"
            : "开始";
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
  gainAffinity("dialogueChoice");
  refreshDialogueSection();
  const node = getNode();
  const isEnd = !(node?.choices?.length);
  if (isEnd) {
    gainAffinity("dialogueComplete", { dialogueId: activeDialogueId });
  }
}

function restartDialogue() {
  const d = getDialogue();
  dialogueNodeId = d?.start || "n0";
  refreshDialogueSection();
}

function nextDialogueScript() {
  const list = openDialogues();
  const idx = list.findIndex((d) => d.id === activeDialogueId);
  const next = list[(idx + 1) % list.length];
  if (next) selectDialogue(next.id, true);
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
  void bubble.offsetWidth;
  bubble.classList.add("is-pop");
}

function pickInteractionReply(interactionId, avoidText = "") {
  const item = interactions.find((i) => i.id === interactionId);
  if (!item?.replies?.length) return null;
  const pool = item.replies.map((r, i) => ({
    id: `${item.id}-${i}`,
    text: r.text,
    mood: r.mood || "soft",
  }));
  return pickRandom(pool, avoidText);
}

function runInteraction(interactionId, again = false) {
  const allowed = availableInteractions().some((i) => i.id === interactionId);
  if (!allowed) return;
  currentInteractionId = interactionId;
  const avoid = again ? lastInteractionReplyText : "";
  const reply = pickInteractionReply(interactionId, avoid);
  if (!reply) return;
  currentInteractionReply = reply;
  lastInteractionReplyText = reply.text;
  gainAffinity("interact");
  refreshInteractSection();
}

function refreshInteractSection() {
  const section = document.querySelector("#interact");
  if (!section) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = renderInteract();
  const next = wrap.firstElementChild;
  section.replaceWith(next);
  next.classList.add("reveal", "is-visible");
  const bubble = next.querySelector("#interact-bubble");
  if (bubble && currentInteractionReply) {
    bubble.classList.remove("is-pop");
    void bubble.offsetWidth;
    bubble.classList.add("is-pop");
  }
}

// ---------- events（委托到 #app，避免局部重绘丢监听） ----------

function bindEvents() {
  app.addEventListener("click", (e) => {
    if (e.target.closest("#line-refresh")) {
      refreshStarline();
      return;
    }

    const calmStateBtn = e.target.closest("[data-calm-state]");
    if (calmStateBtn) {
      calmStateId = calmStateBtn.dataset.calmState;
      readMarginFromDom();
      refreshCalmSection();
      return;
    }

    if (e.target.closest("[data-calm-start]")) {
      startCalmRitual();
      return;
    }

    if (e.target.closest("[data-calm-to-ground]")) {
      goCalmGround();
      return;
    }

    if (e.target.closest("[data-calm-breath-start]")) {
      startCalmBreath();
      return;
    }

    if (e.target.closest("[data-calm-breath-pause]")) {
      pauseCalmBreath();
      return;
    }

    if (e.target.closest("[data-calm-to-release]")) {
      goCalmRelease();
      return;
    }

    if (e.target.closest("[data-calm-finish]")) {
      finishCalmRitual();
      return;
    }

    if (e.target.closest("[data-calm-reset]")) {
      resetCalmRitual();
      return;
    }

    const careBtn = e.target.closest("[data-care]");
    if (careBtn && !careBtn.disabled) {
      toggleCareTask(careBtn.dataset.care);
      return;
    }

    if (e.target.closest("#birthday-gift-btn")) {
      tryBirthdayGift();
      return;
    }

    const interactBtn = e.target.closest("[data-interact]");
    if (interactBtn) {
      runInteraction(interactBtn.dataset.interact, false);
      return;
    }

    if (e.target.closest("[data-interact-again]")) {
      if (currentInteractionId) runInteraction(currentInteractionId, true);
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
  if (document.hidden && calmBreathRunning) {
    pauseCalmBreath();
  }
});

onAffinityChange((evt) => {
  refreshAffinityEntry();
  applySiteAppearance();
  if (evt.leveled) {
    rebuildLinePool();
    // 升阶可能解锁新互动 / 对话
    const pool = availableInteractions();
    if (pool.length && !pool.some((i) => i.id === currentInteractionId)) {
      currentInteractionId = pool[0].id;
    }
    refreshInteractSection();
    const dlist = openDialogues();
    if (dlist.length && !dlist.some((d) => d.id === activeDialogueId)) {
      selectDialogue(dlist[0].id, true);
    } else {
      refreshDialogueSection();
    }
  }
});

// ---------- boot ----------

bindEvents();
renderPage();
initStarfield();
