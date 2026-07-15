/**
 * 好感度核心：存储、加分、阶段、toast / 仪表 HTML
 * 独立于陪伴页；任意页面可 import 后调用 gainAffinity。
 */

import { esc } from "./shared.js";
import {
  AFFINITY_MAX,
  AFFINITY_STORAGE_KEY,
  COMPANION_STORAGE_KEY_LEGACY,
  affinityStages,
  affinityRules,
  affinityLevelUpLines,
  affinityUnlockLines,
} from "./data/affinity.js";

export {
  AFFINITY_MAX,
  AFFINITY_STORAGE_KEY,
  affinityStages,
  affinityRules,
  affinityLevelUpLines,
  affinityUnlockLines,
} from "./data/affinity.js";

// ---------- calendar ----------

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ---------- pure helpers ----------

export function clampAffinity(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(AFFINITY_MAX, Math.round(v)));
}

export function getAffinityStage(value) {
  let stage = affinityStages[0];
  for (const s of affinityStages) {
    if (value >= s.min) stage = s;
  }
  return stage;
}

export function stageProgress(value) {
  const stages = affinityStages;
  const stage = getAffinityStage(value);
  const idx = stages.findIndex((s) => s.id === stage.id);
  const next = stages[idx + 1];
  const floor = stage.min;
  const ceil = next ? next.min : AFFINITY_MAX;
  const span = Math.max(1, ceil - floor);
  const within = Math.min(span, Math.max(0, value - floor));
  return {
    stage,
    next,
    within,
    span,
    ratio: next ? within / span : 1,
    overall: value / AFFINITY_MAX,
  };
}

export function emptyDailyAffinity() {
  return {
    affinityVisit: 0,
    gesture: 0,
    starGift: 0,
    companionVisit: 0,
    interact: 0,
    timer: 0,
    dialogueChoice: 0,
    dialogueComplete: 0,
  };
}

export function sourceLabel(source) {
  return affinityRules[source]?.label || "好感";
}

// ---------- storage ----------

function defaultState() {
  return {
    affinity: 0,
    affinityDay: "",
    affinityDaily: emptyDailyAffinity(),
    completedDialogues: [],
    firstTouch: "",
    migratedFromCompanion: false,
  };
}

function readLegacyCompanionAffinity() {
  try {
    const raw = localStorage.getItem(COMPANION_STORAGE_KEY_LEGACY);
    if (!raw) return null;
    const old = JSON.parse(raw);
    if (old == null || typeof old !== "object") return null;
    if (old.affinity == null && !old.affinityDay && !old.completedDialogues) return null;
    const daily = old.affinityDaily || {};
    return {
      affinity: clampAffinity(old.affinity ?? 0),
      affinityDay: old.affinityDay || "",
      affinityDaily: {
        ...emptyDailyAffinity(),
        companionVisit: daily.visit || daily.companionVisit || 0,
        interact: daily.interact || 0,
        timer: daily.timer || 0,
        dialogueChoice: daily.dialogueChoice || 0,
        dialogueComplete: daily.dialogueComplete || 0,
      },
      completedDialogues: Array.isArray(old.completedDialogues) ? old.completedDialogues : [],
      firstTouch: old.firstVisit || todayKey(),
      migratedFromCompanion: true,
    };
  } catch {
    return null;
  }
}

export function loadAffinityState() {
  try {
    const raw = localStorage.getItem(AFFINITY_STORAGE_KEY);
    if (!raw) {
      const legacy = readLegacyCompanionAffinity();
      if (legacy) {
        saveAffinityState(legacy);
        return legacy;
      }
      return defaultState();
    }
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      affinityDaily: { ...base.affinityDaily, ...(parsed.affinityDaily || {}) },
      completedDialogues: Array.isArray(parsed.completedDialogues)
        ? parsed.completedDialogues
        : [],
      affinity: clampAffinity(parsed.affinity ?? 0),
    };
  } catch {
    return defaultState();
  }
}

export function saveAffinityState(state) {
  try {
    localStorage.setItem(AFFINITY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

export function getAffinityValue() {
  return clampAffinity(loadAffinityState().affinity || 0);
}

/** 跨日重置每日累计 */
export function ensureAffinityDay(state, today = todayKey()) {
  if (state.affinityDay !== today) {
    state.affinityDay = today;
    state.affinityDaily = emptyDailyAffinity();
  }
  return state;
}

/**
 * @param {ReturnType<typeof loadAffinityState>} state
 * @param {string} bucket
 * @param {number} want
 * @param {number} cap
 */
function applyBucketGain(state, bucket, want, cap) {
  ensureAffinityDay(state);
  const daily = state.affinityDaily;
  const used = daily[bucket] || 0;
  const room = Math.max(0, cap - used);
  const applied = Math.max(0, Math.min(want, room, AFFINITY_MAX - (state.affinity || 0)));
  if (applied <= 0) return 0;
  daily[bucket] = used + applied;
  state.affinity = clampAffinity((state.affinity || 0) + applied);
  return applied;
}

/** @type {((evt: AffinityEvent) => void)[]} */
const listeners = [];

/**
 * @typedef {{
 *   source: string,
 *   amount: number,
 *   before: number,
 *   after: number,
 *   leveled: boolean,
 *   stage: (typeof affinityStages)[number],
 *   line?: string,
 * }} AffinityEvent
 */

/** 订阅好感变化（页面可刷新 UI） */
export function onAffinityChange(fn) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

function emit(evt) {
  for (const fn of listeners) {
    try {
      fn(evt);
    } catch {
      /* ignore subscriber errors */
    }
  }
  if (evt.amount > 0 || evt.leveled) {
    showAffinityToast(evt);
  }
}

/**
 * 统一加分入口
 * @param {keyof typeof affinityRules | string} source
 * @param {{ presetId?: string, dialogueId?: string, silent?: boolean }} [meta]
 * @returns {{ applied: number, leveled: boolean, after: number, event: AffinityEvent | null }}
 */
export function gainAffinity(source, meta = {}) {
  const rule = affinityRules[source];
  const state = loadAffinityState();
  ensureAffinityDay(state);
  if (!state.firstTouch) state.firstTouch = todayKey();

  const before = clampAffinity(state.affinity || 0);
  const stageBefore = getAffinityStage(before);
  let applied = 0;

  if (!rule) {
    return { applied: 0, leveled: false, after: before, event: null };
  }

  if (source === "timerDone") {
    const pts = rule.byPreset?.[meta.presetId] ?? 2;
    applied = applyBucketGain(state, rule.bucket, pts, rule.dailyCap);
  } else if (source === "dialogueComplete") {
    const id = meta.dialogueId || "";
    const already = id && (state.completedDialogues || []).includes(id);
    if (!already) {
      applied = applyBucketGain(state, rule.bucket, rule.points, rule.dailyCap);
      if (applied > 0 && id) {
        state.completedDialogues = [...(state.completedDialogues || []), id];
      }
    }
  } else {
    applied = applyBucketGain(state, rule.bucket, rule.points, rule.dailyCap);
  }

  const after = clampAffinity(state.affinity || 0);
  const stageAfter = getAffinityStage(after);
  const leveled = stageAfter.id !== stageBefore.id && after > before;
  saveAffinityState(state);

  /** @type {AffinityEvent | null} */
  let event = null;
  if (applied > 0 || leveled) {
    event = {
      source,
      amount: applied,
      before,
      after,
      leveled,
      stage: stageAfter,
      line: leveled ? affinityLevelUpLines[stageAfter.id] || "" : "",
    };
    if (!meta.silent) emit(event);
  }

  return { applied, leveled, after, event };
}

/** 今日各来源剩余额度（用于好感页展示） */
export function getDailyRemaining() {
  const state = loadAffinityState();
  ensureAffinityDay(state);
  const daily = state.affinityDaily;
  /** @type {Record<string, { used: number, cap: number, left: number, label: string, group: string, hint: string }>} */
  const out = {};
  for (const [key, rule] of Object.entries(affinityRules)) {
    const used = daily[rule.bucket] || 0;
    const cap = rule.dailyCap;
    out[key] = {
      used,
      cap,
      left: Math.max(0, cap - used),
      label: rule.label,
      group: rule.group,
      hint: rule.hint || "",
    };
  }
  return out;
}

export function getUnlockedLines(affinity = getAffinityValue()) {
  return affinityUnlockLines.filter((l) => affinity >= l.min);
}

// ---------- UI snippets ----------

export function renderAffinityMeterHtml({
  value = getAffinityValue(),
  id = "affinity-meter",
  compact = false,
} = {}) {
  const { stage, next, overall, within, span } = stageProgress(value);
  const pct = Math.round(overall * 100);
  const stagePct = Math.round((next ? within / span : 1) * 100);
  const nextHint = next
    ? `距「${next.name}」还需 ${Math.max(0, next.min - value)}`
    : "已是银河的约定";

  return `
  <div class="affinity-meter${compact ? " is-compact" : ""}" id="${esc(id)}" aria-label="好感度 ${value}">
    <div class="affinity-meter-head">
      <span class="affinity-label">
        <span class="dot blue"></span>
        好感度
        <span class="dot amber"></span>
      </span>
      <span class="affinity-value">
        <strong>${value}</strong>
        <span class="affinity-max">/ ${AFFINITY_MAX}</span>
      </span>
    </div>
    <div class="affinity-track" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${AFFINITY_MAX}">
      <div class="affinity-fill" style="width: ${pct}%"></div>
    </div>
    <div class="affinity-meta">
      <span class="affinity-stage" data-stage="${esc(stage.id)}">${esc(stage.name)}</span>
      <span class="affinity-next">${esc(nextHint)}</span>
    </div>
    ${compact ? "" : `<p class="affinity-desc">${esc(stage.desc)}</p>`}
    <div class="affinity-stage-bar" title="当前阶段进度 ${stagePct}%">
      <div class="affinity-stage-fill" style="width: ${stagePct}%"></div>
    </div>
  </div>`;
}

let toastTimer = 0;

export function ensureAffinityToastHost() {
  let el = document.querySelector("#affinity-toast");
  if (el) return el;
  el = document.createElement("div");
  el.id = "affinity-toast";
  el.className = "affinity-toast";
  el.hidden = true;
  el.setAttribute("aria-live", "polite");
  document.body.appendChild(el);
  return el;
}

/** @param {AffinityEvent} evt */
export function showAffinityToast(evt) {
  if (typeof document === "undefined") return;
  const el = ensureAffinityToastHost();
  if (!el) return;

  if (evt.leveled && evt.stage) {
    el.innerHTML = `
      <p class="affinity-toast-title">好感提升 · ${esc(evt.stage.name)}</p>
      <p class="affinity-toast-line">「${esc(evt.line || "……你会一直来的吧。")}」</p>
      <p class="affinity-toast-pts">${evt.after} / ${AFFINITY_MAX}</p>`;
    el.dataset.level = "up";
  } else {
    el.innerHTML = `
      <p class="affinity-toast-title">${esc(sourceLabel(evt.source))} · +${evt.amount}</p>
      <p class="affinity-toast-pts">好感 ${evt.after} / ${AFFINITY_MAX} · ${esc(evt.stage?.name || "")}</p>`;
    el.dataset.level = "gain";
  }

  el.hidden = false;
  el.classList.remove("is-show");
  void el.offsetWidth;
  el.classList.add("is-show");

  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    el.classList.remove("is-show");
    window.setTimeout(() => {
      el.hidden = true;
    }, 320);
  }, evt.leveled ? 4200 : 2400);
}
