/**
 * 陪伴 + 好感进度导出 / 导入（纯本机 JSON）
 */

import { STORAGE_KEY, PROGRESS_EXPORT_VERSION } from "./data/companion.js";
import { AFFINITY_STORAGE_KEY } from "./data/affinity.js";
import { loadAffinityState, saveAffinityState } from "./affinity-core.js";

function safeParse(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** 读取 companion 原始对象（不触碰业务逻辑） */
export function loadCompanionRaw() {
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function saveCompanionRaw(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/**
 * 打包当前进度
 * @returns {{ version: number, exportedAt: string, companion: object | null, affinity: object | null }}
 */
export function exportProgress() {
  return {
    version: PROGRESS_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    site: "amanogawa-saya",
    companion: loadCompanionRaw(),
    affinity: loadAffinityState(),
  };
}

/**
 * 生成并下载 JSON 文件
 * @param {object} [payload]
 */
export function downloadProgressFile(payload = exportProgress()) {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const day = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `amanogawa-progress-${day}.json`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * 校验并导入
 * @param {unknown} data
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function importProgress(data) {
  if (!data || typeof data !== "object") {
    return { ok: false, error: "文件内容不是有效的 JSON 对象。" };
  }
  const pack = /** @type {Record<string, unknown>} */ (data);
  if (pack.site && pack.site !== "amanogawa-saya") {
    return { ok: false, error: "这不是天之川沙夜站点的进度文件。" };
  }
  if (pack.version != null && Number(pack.version) > PROGRESS_EXPORT_VERSION) {
    return { ok: false, error: "备份版本较新，请先更新站点后再导入。" };
  }

  const hasCompanion = pack.companion != null && typeof pack.companion === "object";
  const hasAffinity = pack.affinity != null && typeof pack.affinity === "object";
  if (!hasCompanion && !hasAffinity) {
    return { ok: false, error: "备份里没有 companion 或 affinity 数据。" };
  }

  try {
    if (hasCompanion) {
      const c = /** @type {Record<string, unknown>} */ (pack.companion);
      const slim = {
        firstVisit: String(c.firstVisit || ""),
        lastVisitDate: String(c.lastVisitDate || ""),
        streak: Number(c.streak) || 0,
        totalVisits: Number(c.totalVisits) || 0,
        lastDialogueId: c.lastDialogueId ? String(c.lastDialogueId) : undefined,
        careDay: c.careDay ? String(c.careDay) : "",
        careDone: Array.isArray(c.careDone) ? c.careDone.map(String) : [],
        calmDay: c.calmDay ? String(c.calmDay) : "",
        calmCount: Number(c.calmCount) || 0,
      };
      if (!saveCompanionRaw(slim)) {
        return { ok: false, error: "无法写入陪伴进度（存储可能已满或隐私模式）。" };
      }
    }
    if (hasAffinity) {
      const a = /** @type {Record<string, unknown>} */ (pack.affinity);
      const merged = {
        ...loadAffinityState(),
        ...a,
        affinityDaily:
          a.affinityDaily && typeof a.affinityDaily === "object"
            ? { ...(/** @type {object} */ (a.affinityDaily)) }
            : {},
        completedDialogues: Array.isArray(a.completedDialogues)
          ? a.completedDialogues.map(String)
          : [],
        birthdayGiftYears: Array.isArray(a.birthdayGiftYears)
          ? a.birthdayGiftYears.map(String)
          : [],
        unlockedSeen: Array.isArray(a.unlockedSeen) ? a.unlockedSeen.map(String) : [],
      };
      saveAffinityState(merged);
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "导入时出错，进度可能未完整写入。" };
  }
}

/**
 * 从 File / 文本读取并导入
 * @param {File | string} fileOrText
 */
export async function importProgressFromFile(fileOrText) {
  let text;
  if (typeof fileOrText === "string") {
    text = fileOrText;
  } else {
    text = await fileOrText.text();
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "JSON 解析失败，请确认文件未损坏。" };
  }
  return importProgress(data);
}

/** 复制导出 JSON 到剪贴板 */
export async function copyProgressJson() {
  const json = JSON.stringify(exportProgress(), null, 2);
  try {
    await navigator.clipboard.writeText(json);
    return { ok: true };
  } catch {
    return { ok: false, error: "无法写入剪贴板，请改用下载文件。" };
  }
}
