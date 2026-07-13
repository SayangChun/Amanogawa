import { saya } from "./data/saya.js";
import {
  archiveFilters,
  officialArchive,
} from "./data/gallery-archive.js";
import { aiGalleryManual } from "./data/ai-gallery.js";
import {
  esc,
  imgSrc,
  bindImageFallbacks,
  initStarfield,
  createLightbox,
  bindHeader,
  renderSiteHeader,
  renderSiteFooter,
  bindReveal,
} from "./shared.js";

const app = document.querySelector("#app");

/** @type {Array<Record<string, string>>} */
let allItems = [];
/** @type {Array<Record<string, string>>} */
let visibleItems = [];
let activeFilter = "all";

function fileBasename(src) {
  try {
    return decodeURIComponent((src || "").split("/").pop() || "");
  } catch {
    return (src || "").split("/").pop() || "";
  }
}

/** 从文件名生成标题，并去掉不该出现在标题里的字样 */
function titleFromFilename(name) {
  return cleanDisplayTitle(
    name
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

/** 标题/展示文案：不要出现 AI、天之川沙夜 等 */
function cleanDisplayTitle(title) {
  return String(title || "")
    .replace(/天之川沙夜/g, "")
    .replace(/\bAI\b/gi, "")
    .replace(/个人\s*创作/g, "")
    .replace(/[·•|｜/／]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function manualAiByFilename() {
  const map = new Map();
  for (const item of aiGalleryManual) {
    const key = fileBasename(item.src);
    if (key) map.set(key, item);
  }
  return map;
}

function normalizeAiItem(raw, index) {
  const src = raw.src || raw.url || "";
  const file = fileBasename(src) || `item-${index + 1}`;
  const title =
    cleanDisplayTitle(raw.title) || titleFromFilename(file) || "未命名";
  const caption = String(raw.caption || "").trim();
  return {
    id: raw.id || `ai-${index + 1}-${file}`,
    title,
    caption,
    alt: raw.alt || title,
    source: "ai",
    badge: "AI 创作",
    src,
    thumb: raw.thumb || src,
  };
}

/**
 * 扫描结果与 ai-gallery.js 按文件名合并：
 * 清单里的 title / caption 优先，保证浏览页能看到说明。
 */
function mergeScannedWithManual(scanned) {
  const manualMap = manualAiByFilename();
  const used = new Set();

  const fromScan = scanned.map((item, i) => {
    const file = fileBasename(item.src || item.url || "");
    const manual = manualMap.get(file);
    if (manual) used.add(file);
    return normalizeAiItem(
      {
        ...item,
        ...(manual || {}),
        // 始终以磁盘扫描路径为准，避免清单路径过期
        src: item.src || item.url || manual?.src,
        thumb: item.thumb || manual?.thumb,
      },
      i,
    );
  });

  // 清单里多出来的（例如 API 未扫到）也保留
  const extras = aiGalleryManual
    .filter((item) => !used.has(fileBasename(item.src)))
    .map((item, i) => normalizeAiItem(item, fromScan.length + i));

  return [...fromScan, ...extras];
}

async function loadAiItems() {
  // 1) 本地 server 自动扫描 + 手动元数据
  try {
    const res = await fetch("/api/ai-images", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.images) && data.images.length) {
        return mergeScannedWithManual(data.images);
      }
    }
  } catch {
    /* 纯静态环境没有 API */
  }

  // 2) 手动清单兜底
  return aiGalleryManual.map((item, i) => normalizeAiItem(item, i));
}

function mergeItems(aiItems) {
  return [...officialArchive, ...aiItems];
}

function countsFor(items) {
  return {
    all: items.length,
    "official-art": items.filter((i) => i.source === "official-art").length,
    "official-cg": items.filter((i) => i.source === "official-cg").length,
    ai: items.filter((i) => i.source === "ai").length,
  };
}

function filterItems(filter) {
  if (filter === "all") return allItems;
  return allItems.filter((i) => i.source === filter);
}

const lightbox = createLightbox(() => visibleItems);

function renderFilters(counts) {
  return archiveFilters
    .map((f) => {
      const count = counts[f.id] ?? 0;
      const active = f.id === activeFilter ? " is-active" : "";
      return `
        <button
          type="button"
          class="filter-btn${active}"
          data-filter="${esc(f.id)}"
          aria-selected="${f.id === activeFilter}"
        >
          ${esc(f.label)}
          <em class="filter-count">${count}</em>
        </button>
      `;
    })
    .join("");
}

function renderCards(items) {
  if (!items.length) {
    if (activeFilter === "ai") {
      return `
        <div class="drop-hint glass is-visible">
          <div class="drop-hint-orb" aria-hidden="true"></div>
          <h3>还没有 AI 创作图</h3>
          <p>把你生成的沙夜图片放进项目目录：</p>
          <code>assets/gallery/ai/</code>
          <ol>
            <li>支持 jpg / png / webp / gif</li>
            <li>本地运行 <code>npm start</code> 后刷新本页即可自动出现</li>
            <li>也可编辑 <code>src/data/ai-gallery.js</code> 手动登记</li>
          </ol>
          <p class="drop-hint-note">文件名会自动变成标题，例如 <code>saya-night.png</code></p>
        </div>
      `;
    }
    return `<p class="empty-tip">这个分类暂时没有图片。</p>`;
  }

  return `
    <div class="archive-grid" id="archive-grid">
      ${items
        .map(
          (item, index) => `
        <figure class="archive-card" data-source="${esc(item.source)}" data-id="${esc(item.id || "")}" data-index="${index}">
          <button type="button" class="archive-open" data-index="${index}" aria-label="查看 ${esc(item.title)}">
            <img
              src="${imgSrc(item.thumb || item.src, item.title)}"
              alt="${esc(item.alt || item.title)}"
              loading="lazy"
              data-fallback="${esc(item.title)}"
              ${item.objectPosition ? `style="object-position: ${esc(item.objectPosition)}"` : ""}
            />
            <span class="archive-zoom" aria-hidden="true">查看</span>
          </button>
          <figcaption>
            <span class="shot-cat">${esc(item.badge || item.source)}</span>
            <strong>${esc(item.title)}</strong>
            <p>${esc(item.caption || "")}</p>
          </figcaption>
        </figure>
      `,
        )
        .join("")}
    </div>
  `;
}

function renderPageShell() {
  const counts = countsFor(allItems);
  app.innerHTML = `
    ${renderSiteHeader({ active: "gallery", base: "." })}
    <main class="page archive-page">
      <section class="archive-hero">
        <div class="archive-hero-copy">
          <p class="eyebrow">
            <span class="dot blue"></span>
            Gallery Archive
            <span class="dot amber"></span>
          </p>
          <h1>沙夜的图集</h1>
          <p class="archive-lede">
            官方立绘与筛选后的宣传 CG，以及你用 AI 为她留下的新模样。
            点击任意图片可全屏浏览，方向键切换。
          </p>
          <div class="archive-stats">
            <div class="stat-pill"><span>${counts.all}</span>全部</div>
            <div class="stat-pill"><span>${counts["official-art"]}</span>立绘</div>
            <div class="stat-pill"><span>${counts["official-cg"]}</span>CG</div>
            <div class="stat-pill"><span>${counts.ai}</span>AI</div>
          </div>
        </div>
        <div class="archive-hero-side glass">
          <p class="label">来源说明</p>
          <ul>
            <li><strong>官方立绘</strong> — PULLTOP / Bangumi 角色图</li>
            <li><strong>官方 CG</strong> — 官网 Gallery 中沙夜出场的公开 CG</li>
            <li><strong>AI 创作</strong> — 你放入 <code>assets/gallery/ai</code> 的图片</li>
          </ul>
          <a class="btn btn-ghost" href="./index.html">返回首页</a>
        </div>
      </section>

      <section class="section archive-section">
        <div class="section-head archive-head">
          <div>
            <p class="eyebrow">Browse</p>
            <h2>浏览</h2>
          </div>
          <div class="gallery-filters archive-filters" role="tablist" aria-label="图集分类">
            ${renderFilters(counts)}
          </div>
        </div>
        <div id="archive-mount">
          ${renderCards(visibleItems)}
        </div>
      </section>
    </main>
    ${renderSiteFooter(saya)}
  `;
}

function applyFilter(filter) {
  activeFilter = filter;
  visibleItems = filterItems(filter);
  const counts = countsFor(allItems);

  document.querySelectorAll(".archive-filters .filter-btn").forEach((btn) => {
    const on = btn.dataset.filter === filter;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-selected", String(on));
  });

  // 同步计数（AI 加载后会变化）
  document.querySelectorAll(".archive-filters .filter-btn").forEach((btn) => {
    const id = btn.dataset.filter;
    const em = btn.querySelector(".filter-count");
    if (em && id) em.textContent = String(counts[id] ?? 0);
  });

  const stats = document.querySelectorAll(".archive-stats .stat-pill span");
  if (stats.length === 4) {
    stats[0].textContent = String(counts.all);
    stats[1].textContent = String(counts["official-art"]);
    stats[2].textContent = String(counts["official-cg"]);
    stats[3].textContent = String(counts.ai);
  }

  const mount = document.querySelector("#archive-mount");
  if (mount) {
    mount.innerHTML = renderCards(visibleItems);
    bindImageFallbacks(mount);
    bindReveal(mount);
  }
}

function bindArchiveEvents() {
  document.querySelector(".archive-filters")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    applyFilter(btn.dataset.filter);
  });

  document.querySelector("#archive-mount")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-index]");
    if (!btn || btn.tagName !== "BUTTON") return;
    lightbox.open(Number(btn.dataset.index));
  });
}

async function boot() {
  const aiItems = await loadAiItems();
  allItems = mergeItems(aiItems);
  visibleItems = filterItems(activeFilter);

  renderPageShell();
  bindImageFallbacks(app);
  initStarfield();
  bindHeader("gallery");
  bindArchiveEvents();
  bindReveal(app);

  // URL hash support: gallery.html#ai
  const hash = location.hash.replace("#", "");
  if (archiveFilters.some((f) => f.id === hash)) {
    applyFilter(hash);
  }
}

boot();
