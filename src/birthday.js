/**
 * 沙夜生日（1 月 16 日）工具
 */

import { saya } from "./data/saya.js";

export function getBirthdayParts() {
  const month = saya.birthday?.month ?? 1;
  const day = saya.birthday?.day ?? 16;
  return { month, day };
}

/** @param {Date} [d] */
export function isBirthday(d = new Date()) {
  const { month, day } = getBirthdayParts();
  return d.getMonth() + 1 === month && d.getDate() === day;
}

/**
 * 距下次生日的天数（生日当天为 0）
 * @param {Date} [d]
 */
export function daysUntilBirthday(d = new Date()) {
  const { month, day } = getBirthdayParts();
  const y = d.getFullYear();
  let next = new Date(y, month - 1, day);
  // 去掉时分秒影响
  const today = new Date(y, d.getMonth(), d.getDate());
  if (next < today) {
    next = new Date(y + 1, month - 1, day);
  }
  return Math.round((next - today) / 86400000);
}

/** 生日礼包按自然年只领一次 */
export function birthdayYearKey(d = new Date()) {
  return String(d.getFullYear());
}

/**
 * 首页 / 陪伴页横幅文案
 * @param {Date} [d]
 */
export function birthdayBannerCopy(d = new Date()) {
  if (isBirthday(d)) {
    return {
      kind: "today",
      title: "今天是沙夜的生日",
      text: "1 月 16 日 · 不用准备很大的礼物。你来了，她就会把今天的星分你多一点。",
      cta: "收下生日心意",
    };
  }
  const days = daysUntilBirthday(d);
  if (days <= 30) {
    return {
      kind: "soon",
      title: `距沙夜生日还有 ${days} 天`,
      text: "1 月 16 日。到那天来一趟陪伴页吧——她会认真记住谁来过。",
      cta: null,
    };
  }
  return {
    kind: "countdown",
    title: `距沙夜生日还有 ${days} 天`,
    text: "银发与异色瞳的那位，生日在寒冷却干净的一月。",
    cta: null,
  };
}
