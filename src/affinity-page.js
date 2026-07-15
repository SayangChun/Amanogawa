import { saya } from "./data/saya.js";
import {
  affinityGestures,
  starGiftReplies,
  affinityStages,
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
} from "./affinity-core.js";
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

function renderHero() {
  const stage = getAffinityStage(affinityValue);
  return `
  <section class="section affinity-hero" id="top-affinity">
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
          <a href="./companion.html">陪伴页</a>一起看星星，都会慢慢靠近。
        </p>
        ${renderAffinityMeterHtml({ value: affinityValue, id: "affinity-meter" })}
        <div class="companion-jump">
          <a class="btn btn-ghost" href="#gestures">心意一拍</a>
          <a class="btn btn-ghost" href="#roadmap">阶段星图</a>
          <a class="btn btn-ghost" href="#daily">今日余量</a>
          <a class="btn btn-primary" href="./companion.html">去陪伴</a>
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
          return `
        <li class="glass affinity-road-card${reached ? " is-reached" : ""}${current ? " is-current" : ""}">
          <div class="affinity-road-top">
            <span class="affinity-road-idx">${String(i + 1).padStart(2, "0")}</span>
            <span class="affinity-road-min">${s.min}+</span>
          </div>
          <h3 class="affinity-road-name">${esc(s.name)}</h3>
          <p class="affinity-road-desc">${reached ? esc(s.desc) : "……还看不清。再靠近一点。"}</p>
          <div class="affinity-stage-bar" aria-hidden="true">
            <div class="affinity-stage-fill" style="width: ${pct}%"></div>
          </div>
        </li>`;
        })
        .join("")}
    </ol>
  </section>`;
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
    { id: "affinity", title: "好感页", keys: ["affinityVisit", "gesture", "starGift"] },
    {
      id: "companion",
      title: "陪伴页联动",
      keys: ["companionVisit", "interact", "timerDone", "dialogueChoice", "dialogueComplete"],
    },
  ];
  return `
  <section class="section" id="daily">
    <div class="section-head">
      <p class="eyebrow">Today</p>
      <h2>今日余量</h2>
      <p class="section-desc">每个来源都有每日上限，防止刷分。跨日自动重置。数值只存在你的浏览器里。</p>
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

function renderPage() {
  app.innerHTML = `
    ${renderSiteHeader({ active: "affinity", base: "." })}
    <main class="page affinity-page">
      ${renderHero()}
      ${renderGestures()}
      ${renderRoadmap()}
      ${renderUnlocks()}
      ${renderDaily()}
    </main>
    ${renderSiteFooter(saya)}
  `;
  ensureAffinityToastHost();
  bindImageFallbacks(app);
  bindHeader("affinity");
  bindReveal(app);
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
    }
  });
}

onAffinityChange((evt) => {
  affinityValue = evt.after;
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
