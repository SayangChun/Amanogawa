/**
 * 陪伴页 localStorage：回访 / 关心 / 心事次数等
 * 与好感系统独立；float 与 companion 共用同一 key 与字段形状。
 */

import { STORAGE_KEY } from "./data/companion.js";

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function defaultCompanionState() {
  const t = todayKey();
  return {
    firstVisit: t,
    lastVisitDate: "",
    streak: 0,
    totalVisits: 0,
    lastDialogueId: undefined,
    careDay: "",
    careDone: [],
    calmDay: "",
    calmCount: 0,
  };
}

export function loadCompanionState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCompanionState();
    const parsed = JSON.parse(raw);
    const base = defaultCompanionState();
    return {
      ...base,
      ...parsed,
      careDone: Array.isArray(parsed.careDone) ? parsed.careDone.map(String) : [],
      calmCount: Number.isFinite(Number(parsed.calmCount)) ? Number(parsed.calmCount) : 0,
    };
  } catch {
    return defaultCompanionState();
  }
}

export function saveCompanionState(state) {
  try {
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
export function ensureCareDay(state, today = todayKey()) {
  if (state.careDay !== today) {
    state.careDay = today;
    state.careDone = [];
  }
  return state;
}

/** 跨日重置心事安放次数 */
export function ensureCalmDay(state, today = todayKey()) {
  if (state.calmDay !== today) {
    state.calmDay = today;
    state.calmCount = 0;
  }
  return state;
}

export function getCareDoneSet() {
  const state = ensureCareDay(loadCompanionState());
  return new Set(state.careDone || []);
}

export function getCalmCountToday() {
  const state = ensureCalmDay(loadCompanionState());
  return state.calmCount || 0;
}
