import { saya } from "./data/saya.js";
import {
  affinityGestures,
  starGiftReplies,
  affinityStages,
  stageRewards,
  affinityThemes,
  affinityFrames,
} from "./data/affinity.js";
import {
  AFFINITY_MAX,
  getAffinityValue,
  getAffinityStage,
  gainAffinity,
  getDailyRemaining,
  getUnlockedLines,
  renderAffinityMeterHtml,
  onAffinityChange,
  ensureAffinityToastHost,
  applySiteAppearance,
  resolveFrameId,
  resolveThemeId,
  setPreferredTheme,
  setPreferredFrame,
  loadAffinityState,
  claimBirthdayGift,
  hasClaimedBirthdayGift,
} from "./affinity-core.js";
import { isBirthday, birthdayBannerCopy } from "./birthday.js";
import {
  downloadProgressFile,
  importProgressFromFile,
  copyProgressJson,
} from "./progress.js";
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

function pickRandom(list, avoidText = "") {
  if (!list?.length) return null;
  if (list.length === 1) return list[0];
  let item = list[Math.floor(Math.random() * list.length)];
  let guard = 0;
  while (avoidText && item.text === avoidText && guard < 8) {
    item = list[Math.floor(Math.random() * list.length)];
    guard += 1;
  }
  return item;
}

// ---------- page state ----------

let affinityValue = getAffinityValue();
let currentGestureId = affinityGestures[0]?.id || "";
let currentReply = null;
let lastReplyText = "";
let lastGiftText = "";

// 今日首次造访好感页
const visitGain = gainAffinity("affinityVisit");
affinityValue = visitGain.after || getAffinityValue();

// ---------- render ----------

function renderBirthdayStrip() {
  if (!isBirthday()) return "";
  const claimed = hasClaimedBirthdayGift();
  const copy = birthdayBannerCopy();
  return `
  <section class="birthday-banner glass is-today affinity-birthday" id="affinity-birthday">
    <div class="birthday-banner-copy">
      <p class="birthday-banner-kicker">Birthday Night</p>
      <h2 class="birthday-banner-title">${esc(copy.title)}</h2>
      <p class="birthday-banner-text">${esc(copy.text)}</p>
    </div>
    <button type="button" class="btn btn-primary" id="affinity-birthday-gift" ${claimed ? "disabled" : ""}>
      ${claimed ? "今年的心意已收下" : "收下生日心意 · +8"}
    </button>
  </section>`;
}

function renderHero() {
  const stage = getAffinityStage(affinityValue);
  const frameId = resolveFrameId(affinityValue);
  return `
  <section class="section affinity-hero" id="top-affinity">
    ${renderBirthdayStrip()}
    <div class="affinity-hero-grid">
      <div class="glass affinity-presence">
        <p class="eyebrow">
          <span class="dot blue"></span>
          <span>Affinity · 好感</span>
          <span class="dot amber"></span>
        </p>
        <h1 class="affinity-title">写进星图页边的距离</h1>
        <p class="affinity-lead">
          好感度是独立的心意轨迹——在这里说话、送星，或去
          <a href="./companion.html">陪伴页</a>一起看星星，都会慢慢靠近。阶段升高会解锁主题、边框与隐藏互动。
        </p>
        ${renderAffinityMeterHtml({ value: affinityValue, id: "affinity-meter" })}
        <div class="companion-jump">
          <a class="btn btn-ghost" href="#gestures">心意一拍</a>
          <a class="btn btn-ghost" href="#milestones">里程碑</a>
          <a class="btn btn-ghost" href="#roadmap">阶段星图</a>
          <a class="btn btn-ghost" href="#backup">备份</a>
          <a class="btn btn-primary" href="./companion.html">去陪伴</a>
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
          <span class="affinity-chip" title="好感阶段">${esc(stage.short)}</span>
          <span class="companion-portrait-name">${esc(saya.name)}</span>
        </div>
      </div>
    </div>
  </section>`;
}

function renderGestures() {
  const reply = currentReply;
  const active = affinityGestures.find((g) => g.id === currentGestureId) || affinityGestures[0];
  return `
  <section class="section" id="gestures">
    <div class="section-head">
      <p class="eyebrow">Heartbeats</p>
      <h2>心意一拍</h2>
      <p class="section-desc">在好感页直接对她说一句。气质整理向，非剧本原句。受每日上限约束。</p>
    </div>
    <div class="glass companion-interact">
      <div class="interact-actions" role="group" aria-label="对沙夜说">
        ${affinityGestures
          .map(
            (item) => `
          <button
            type="button"
            class="interact-chip${item.id === currentGestureId && reply?.kind === "gesture" ? " is-active" : ""}"
            data-gesture="${esc(item.id)}"
            title="${esc(item.hint || item.label)}"
          >
            <span class="interact-chip-label">${esc(item.label)}</span>
            ${item.hint ? `<span class="interact-chip-hint">${esc(item.hint)}</span>` : ""}
          </button>`,
          )
          .join("")}
        <button
          type="button"
          class="interact-chip${reply?.kind === "gift" ? " is-active" : ""}"
          data-star-gift
          title="送一颗小星"
        >
          <span class="interact-chip-label">送一颗小星</span>
          <span class="interact-chip-hint">轻轻放进她的掌心</span>
        </button>
      </div>
      <article
        class="companion-bubble interact-reply${reply ? " is-pop" : ""}"
        id="gesture-bubble"
        data-mood="${esc(reply?.mood || "soft")}"
      >
        <p class="interact-you">${
          reply
            ? `你 · ${esc(reply.youLabel || active?.label || "……")}`
            : "选上面任意一句，把距离再拉近一点点。"
        }</p>
        <p class="companion-bubble-text" id="gesture-text">
          ${reply ? `「${esc(reply.text)}」` : "「……我在听。」"}
        </p>
        <span class="companion-bubble-badge">${reply ? "沙夜" : "等待"}</span>
      </article>
      ${
        reply
          ? `<div class="interact-again">
              <button type="button" class="btn btn-ghost" data-gesture-again>她再说一遍（换句）</button>
            </div>`
          : ""
      }
    </div>
  </section>`;
}

function renderRoadmap() {
  const value = affinityValue;
  return `
  <section class="section" id="roadmap">
    <div class="section-head">
      <p class="eyebrow">Constellation</p>
      <h2>阶段星图</h2>
      <p class="section-desc">从初识的星光，走到银河的约定。未达阶段会保持朦胧。</p>
    </div>
    <ol class="affinity-roadmap">
      ${affinityStages
        .map((s, i) => {
          const reached = value >= s.min;
          const current = getAffinityStage(value).id === s.id;
          const next = affinityStages[i + 1];
          const span = next ? next.min - s.min : AFFINITY_MAX - s.min;
          const within = reached ? Math.min(span, Math.max(0, value - s.min)) : 0;
          const pct = !reached ? 0 : next ? Math.round((within / Math.max(1, span)) * 100) : 100;
          const rewards = stageRewards.find((r) => r.stageId === s.id);
          const rewardLabels =
            reached && rewards
              ? rewards.unlocks
                  .slice(0, 3)
                  .map((u) => u.label)
                  .join(" · ")
              : "";
          return `
        <li class="glass affinity-road-card${reached ? " is-reached" : ""}${current ? " is-current" : ""}">
          <div class="affinity-road-top">
            <span class="affinity-road-idx">${String(i + 1).padStart(2, "0")}</span>
            <span class="affinity-road-min">${s.min}+</span>
          </div>
          <h3 class="affinity-road-name">${esc(s.name)}</h3>
          <p class="affinity-road-desc">${reached ? esc(s.desc) : "……还看不清。再靠近一点。"}</p>
          ${
            rewardLabels
              ? `<p class="affinity-road-rewards">${esc(rewardLabels)}</p>`
              : reached
                ? ""
                : `<p class="affinity-road-rewards is-locked">到达后解锁主题 / 互动 / 边框</p>`
          }
          <div class="affinity-stage-bar" aria-hidden="true">
            <div class="affinity-stage-fill" style="width: ${pct}%"></div>
          </div>
        </li>`;
        })
        .join("")}
    </ol>
  </section>`;
}

function renderMilestones() {
  const value = affinityValue;
  const state = loadAffinityState();
  const themeNow = resolveThemeId(value);
  const frameNow = resolveFrameId(value);
  return `
  <section class="section" id="milestones">
    <div class="section-head">
      <p class="eyebrow">Milestones</p>
      <h2>好感里程碑</h2>
      <p class="section-desc">数字之外的奖励：主题皮肤、立绘边框、隐藏互动与对话。可在下方切换已解锁外观。</p>
    </div>
    <div class="glass affinity-appearance">
      <div class="appearance-block">
        <h3 class="appearance-title">站点主题</h3>
        <p class="appearance-hint">当前：${esc(affinityThemes.find((t) => t.id === themeNow)?.label || "默认夜空")} · 偏好 ${esc(state.preferredTheme || "auto")}</p>
        <div class="appearance-chips" role="group" aria-label="主题">
          <button type="button" class="filter-btn${(state.preferredTheme || "auto") === "auto" ? " is-active" : ""}" data-theme-pref="auto">自动（最高解锁）</button>
          ${affinityThemes
            .map((t) => {
              const open = value >= t.min;
              const active = (state.preferredTheme || "auto") === t.id;
              return `
            <button
              type="button"
              class="filter-btn${active ? " is-active" : ""}${open ? "" : " is-locked"}"
              data-theme-pref="${esc(t.id)}"
              ${open ? "" : "disabled"}
              title="${esc(t.desc)}（需 ${t.min}+）"
            >${esc(t.label)}${open ? "" : ` · ${t.min}+`}</button>`;
            })
            .join("")}
        </div>
      </div>
      <div class="appearance-block">
        <h3 class="appearance-title">立绘边框</h3>
        <p class="appearance-hint">当前：${esc(affinityFrames.find((f) => f.id === frameNow)?.label || "素框")}</p>
        <div class="appearance-chips" role="group" aria-label="边框">
          <button type="button" class="filter-btn${(state.preferredFrame || "auto") === "auto" ? " is-active" : ""}" data-frame-pref="auto">自动</button>
          ${affinityFrames
            .map((f) => {
              const open = value >= f.min;
              const active = (state.preferredFrame || "auto") === f.id;
              return `
            <button
              type="button"
              class="filter-btn${active ? " is-active" : ""}${open ? "" : " is-locked"}"
              data-frame-pref="${esc(f.id)}"
              ${open ? "" : "disabled"}
              title="${esc(f.desc)}（需 ${f.min}+）"
            >${esc(f.label)}${open ? "" : ` · ${f.min}+`}</button>`;
            })
            .join("")}
        </div>
      </div>
    </div>
    <ol class="milestone-list">
      ${stageRewards
        .map((stage) => {
          const reached = value >= stage.min;
          const stageMeta = affinityStages.find((s) => s.id === stage.stageId);
          return `
        <li class="glass milestone-card${reached ? " is-reached" : ""}">
          <div class="milestone-head">
            <span class="milestone-min">${stage.min}+</span>
            <h3>${esc(stageMeta?.name || stage.stageId)}</h3>
            <span class="milestone-status">${reached ? "已解锁" : "未抵达"}</span>
          </div>
          <ul class="milestone-unlocks">
            ${stage.unlocks
              .map(
                (u) => `
              <li class="milestone-unlock${reached ? "" : " is-fog"}">
                <span class="milestone-kind">${esc(kindLabel(u.kind))}</span>
                <strong>${esc(u.label)}</strong>
                <span>${reached ? esc(u.desc) : "……再靠近一点就会亮起来。"}</span>
              </li>`,
              )
              .join("")}
          </ul>
        </li>`;
        })
        .join("")}
    </ol>
  </section>`;
}

function kindLabel(kind) {
  const map = {
    feature: "功能",
    theme: "主题",
    frame: "边框",
    interaction: "互动",
    dialogue: "对话",
    line: "心意",
  };
  return map[kind] || kind;
}

function renderUnlocks() {
  const unlocked = getUnlockedLines(affinityValue);
  return `
  <section class="section" id="unlocks">
    <div class="section-head">
      <p class="eyebrow">Unlocked</p>
      <h2>已解锁的心意</h2>
      <p class="section-desc">达到对应阶段后，会多出几句只对你说的话。</p>
    </div>
    ${
      unlocked.length
        ? `<div class="affinity-unlock-grid">
        ${unlocked
          .map(
            (l) => `
          <article class="glass companion-bubble affinity-unlock-card" data-mood="${esc(l.mood || "soft")}">
            <p class="companion-bubble-text">「${esc(l.text)}」</p>
            <span class="companion-bubble-badge">心意 · ${l.min}+</span>
          </article>`,
          )
          .join("")}
      </div>`
        : `<div class="glass affinity-empty">
          <p>还没有解锁的心意句。……从「愿意牵住的袖口」开始，页边会亮起来。</p>
          <p class="affinity-empty-hint">当前 ${affinityValue} / ${AFFINITY_MAX} · 袖口阶段需 28</p>
        </div>`
    }
  </section>`;
}

function renderDaily() {
  const remaining = getDailyRemaining();
  const groups = [
    {
      id: "affinity",
      title: "好感页",
      keys: ["affinityVisit", "gesture", "starGift", "birthdayGift"],
    },
    {
      id: "companion",
      title: "陪伴页联动",
      keys: [
        "companionVisit",
        "careCheck",
        "interact",
        "timerDone",
        "dialogueChoice",
        "dialogueComplete",
      ],
    },
  ];
  return `
  <section class="section" id="daily">
    <div class="section-head">
      <p class="eyebrow">Today</p>
      <h2>今日余量</h2>
      <p class="section-desc">每个来源都有每日上限，防止刷分。跨日自动重置。生日心意按年领取。数值只存在你的浏览器里。</p>
    </div>
    <div class="affinity-daily-grid">
      ${groups
        .map((g) => {
          const items = g.keys.map((k) => ({ key: k, ...remaining[k] })).filter((x) => x.label);
          return `
        <div class="glass affinity-daily-panel">
          <h3 class="affinity-daily-title">${esc(g.title)}</h3>
          <ul class="affinity-daily-list">
            ${items
              .map((item) => {
                const ratio = item.cap > 0 ? item.used / item.cap : 0;
                return `
              <li>
                <div class="affinity-daily-row">
                  <span class="affinity-daily-label">${esc(item.label)}</span>
                  <span class="affinity-daily-nums">${item.used} / ${item.cap}</span>
                </div>
                <p class="affinity-daily-hint">${esc(item.hint || "")}</p>
                <div class="affinity-stage-bar">
                  <div class="affinity-stage-fill" style="width: ${Math.round(ratio * 100)}%"></div>
                </div>
              </li>`;
              })
              .join("")}
          </ul>
          ${
            g.id === "companion"
              ? `<a class="btn btn-ghost affinity-daily-link" href="./companion.html">打开陪伴页</a>`
              : ""
          }
        </div>`;
        })
        .join("")}
    </div>
  </section>`;
}

function renderBackup() {
  return `
  <section class="section" id="backup">
    <div class="section-head">
      <p class="eyebrow">Backup</p>
      <h2>进度备份</h2>
      <p class="section-desc">好感与陪伴记录存在本机。换设备或清缓存前，导出一份 JSON；需要时再导入回来。</p>
    </div>
    <div class="glass affinity-backup">
      <p class="backup-lead">导出内容包含：好感度、每日额度、已完成对话、主题偏好、回访天数与关心清单等。</p>
      <div class="backup-actions">
        <button type="button" class="btn btn-primary" id="backup-export">下载进度文件</button>
        <button type="button" class="btn btn-ghost" id="backup-copy">复制 JSON</button>
        <label class="btn btn-ghost backup-import-label">
          导入进度
          <input type="file" id="backup-import" accept="application/json,.json" hidden />
        </label>
      </div>
      <p class="backup-status" id="backup-status" role="status" aria-live="polite"></p>
      <p class="backup-warn">导入会覆盖当前本机进度。请先导出备份再操作。</p>
    </div>
  </section>`;
}

function renderPage() {
  applySiteAppearance();
  app.innerHTML = `
    ${renderSiteHeader({ active: "affinity", base: "." })}
    <main class="page affinity-page">
      ${renderHero()}
      ${renderGestures()}
      ${renderMilestones()}
      ${renderRoadmap()}
      ${renderUnlocks()}
      ${renderDaily()}
      ${renderBackup()}
    </main>
    ${renderSiteFooter(saya)}
  `;
  ensureAffinityToastHost();
  bindImageFallbacks(app);
  bindHeader("affinity");
  bindReveal(app);
}

function setBackupStatus(msg, ok = true) {
  const el = document.querySelector("#backup-status");
  if (!el) return;
  el.textContent = msg;
  el.dataset.ok = ok ? "1" : "0";
}

function refreshMeterAndChips() {
  const meter = document.querySelector("#affinity-meter");
  if (meter) {
    const wrap = document.createElement("div");
    wrap.innerHTML = renderAffinityMeterHtml({ value: affinityValue, id: "affinity-meter" });
    const next = wrap.firstElementChild;
    meter.replaceWith(next);
    next.classList.add("is-pulse");
    window.setTimeout(() => next.classList.remove("is-pulse"), 600);
  }
  const chip = document.querySelector(".affinity-chip");
  if (chip) chip.textContent = getAffinityStage(affinityValue).short;
  const portrait = document.querySelector(".companion-portrait");
  if (portrait) {
    portrait.className = `companion-portrait glass portrait-frame portrait-frame--${resolveFrameId(affinityValue)}`;
  }
}

function refreshGestureSection() {
  const section = document.querySelector("#gestures");
  if (!section) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = renderGestures();
  const next = wrap.firstElementChild;
  section.replaceWith(next);
  next.classList.add("reveal", "is-visible");
  const bubble = next.querySelector("#gesture-bubble");
  if (bubble && currentReply) {
    bubble.classList.remove("is-pop");
    void bubble.offsetWidth;
    bubble.classList.add("is-pop");
  }
}

function refreshRoadmapAndUnlocksAndDaily() {
  for (const [sel, html] of [
    ["#milestones", renderMilestones()],
    ["#roadmap", renderRoadmap()],
    ["#unlocks", renderUnlocks()],
    ["#daily", renderDaily()],
  ]) {
    const section = document.querySelector(sel);
    if (!section) continue;
    const wrap = document.createElement("div");
    wrap.innerHTML = html;
    const next = wrap.firstElementChild;
    section.replaceWith(next);
    next.classList.add("reveal", "is-visible");
  }
}

function refreshMilestonesOnly() {
  const section = document.querySelector("#milestones");
  if (!section) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = renderMilestones();
  const next = wrap.firstElementChild;
  section.replaceWith(next);
  next.classList.add("reveal", "is-visible");
}

function runGesture(id, again = false) {
  const item = affinityGestures.find((g) => g.id === id);
  if (!item) return;
  currentGestureId = id;
  const avoid = again ? lastReplyText : "";
  const reply = pickRandom(item.replies, avoid);
  if (!reply) return;
  currentReply = {
    kind: "gesture",
    text: reply.text,
    mood: reply.mood || "soft",
    youLabel: item.label,
  };
  lastReplyText = reply.text;
  gainAffinity("gesture");
  affinityValue = getAffinityValue();
  refreshGestureSection();
}

function runStarGift(again = false) {
  const avoid = again ? lastGiftText : "";
  const reply = pickRandom(starGiftReplies, avoid);
  if (!reply) return;
  currentReply = {
    kind: "gift",
    text: reply.text,
    mood: reply.mood || "star",
    youLabel: "送一颗小星",
  };
  lastGiftText = reply.text;
  lastReplyText = reply.text;
  gainAffinity("starGift");
  affinityValue = getAffinityValue();
  refreshGestureSection();
}

function bindEvents() {
  app.addEventListener("click", (e) => {
    const g = e.target.closest("[data-gesture]");
    if (g) {
      runGesture(g.dataset.gesture, false);
      return;
    }
    if (e.target.closest("[data-star-gift]")) {
      runStarGift(false);
      return;
    }
    if (e.target.closest("[data-gesture-again]")) {
      if (currentReply?.kind === "gift") runStarGift(true);
      else if (currentGestureId) runGesture(currentGestureId, true);
      return;
    }

    if (e.target.closest("#affinity-birthday-gift")) {
      const result = claimBirthdayGift();
      affinityValue = getAffinityValue();
      const btn = document.querySelector("#affinity-birthday-gift");
      if (btn) {
        btn.disabled = true;
        btn.textContent =
          result.applied > 0 ? "心意已收下" : "今年的心意已收下";
      }
      refreshMeterAndChips();
      return;
    }

    const themeBtn = e.target.closest("[data-theme-pref]");
    if (themeBtn && !themeBtn.disabled) {
      setPreferredTheme(themeBtn.dataset.themePref);
      refreshMilestonesOnly();
      return;
    }
    const frameBtn = e.target.closest("[data-frame-pref]");
    if (frameBtn && !frameBtn.disabled) {
      setPreferredFrame(frameBtn.dataset.framePref);
      refreshMeterAndChips();
      refreshMilestonesOnly();
      return;
    }

    if (e.target.closest("#backup-export")) {
      downloadProgressFile();
      setBackupStatus("已开始下载进度文件。");
      return;
    }
    if (e.target.closest("#backup-copy")) {
      copyProgressJson().then((r) => {
        setBackupStatus(r.ok ? "已复制到剪贴板。" : r.error || "复制失败", r.ok);
      });
      return;
    }
  });

  app.addEventListener("change", async (e) => {
    const input = e.target.closest("#backup-import");
    if (!input?.files?.length) return;
    const file = input.files[0];
    const result = await importProgressFromFile(file);
    input.value = "";
    if (!result.ok) {
      setBackupStatus(result.error || "导入失败", false);
      return;
    }
    setBackupStatus("导入成功。正在刷新页面……", true);
    window.setTimeout(() => window.location.reload(), 600);
  });
}

onAffinityChange((evt) => {
  affinityValue = evt.after;
  applySiteAppearance();
  refreshMeterAndChips();
  // 升阶时刷新星图与解锁
  if (evt.leveled) {
    refreshRoadmapAndUnlocksAndDaily();
  } else {
    // 日常加分只更新余量条
    const daily = document.querySelector("#daily");
    if (daily) {
      const wrap = document.createElement("div");
      wrap.innerHTML = renderDaily();
      const next = wrap.firstElementChild;
      daily.replaceWith(next);
      next.classList.add("reveal", "is-visible");
    }
  }
});

// ---------- boot ----------

bindEvents();
renderPage();
initStarfield();

// 首访加分发生在渲染前，补 toast（core 在无 host 时会创建；此处保证可见）
if (visitGain.event) {
  // toast 已在 gain 时尝试显示；再刷一次余量即可
  affinityValue = visitGain.after;
}
