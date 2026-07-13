import { saya } from "./data/saya.js";
import { quoteFilters, quotesArchive } from "./data/quotes.js";
import {
  esc,
  initStarfield,
  bindHeader,
  renderSiteHeader,
  renderSiteFooter,
  bindReveal,
} from "./shared.js";

const app = document.querySelector("#app");

let activeFilter = "all";

function filteredQuotes() {
  if (activeFilter === "all") return quotesArchive;
  return quotesArchive.filter((q) => q.category === activeFilter);
}

function counts() {
  return {
    all: quotesArchive.length,
    saya: quotesArchive.filter((q) => q.category === "saya").length,
    about: quotesArchive.filter((q) => q.category === "about").length,
    star: quotesArchive.filter((q) => q.category === "star").length,
  };
}

function renderFilters(c) {
  return quoteFilters
    .map((f) => {
      const on = f.id === activeFilter;
      return `
        <button
          type="button"
          class="filter-btn${on ? " is-active" : ""}"
          data-filter="${esc(f.id)}"
          aria-selected="${on}"
        >
          ${esc(f.label)}
          <em class="filter-count">${c[f.id] ?? 0}</em>
        </button>
      `;
    })
    .join("");
}

function renderQuoteCard(q, index) {
  return `
    <article class="glass quote-full-card" data-category="${esc(q.category)}" style="--i:${index}">
      <div class="quote-full-top">
        <span class="quote-badge">${esc(q.badge || q.category)}</span>
        <span class="quote-speaker">${esc(q.speaker)}</span>
      </div>
      <p class="quote-full-text">「${esc(q.text)}」</p>
      ${
        q.textJa
          ? `<p class="quote-full-ja">${esc(q.textJa)}</p>`
          : ""
      }
      <p class="quote-full-context">${esc(q.context || "")}</p>
      <p class="quote-full-source">来源 · ${esc(q.source || "未标注")}</p>
    </article>
  `;
}

function renderList() {
  const items = filteredQuotes();
  if (!items.length) {
    return `<p class="empty-tip">这个分类暂时没有星语。</p>`;
  }
  return `
    <div class="quotes-full-grid" id="quotes-grid">
      ${items.map((q, i) => renderQuoteCard(q, i)).join("")}
    </div>
  `;
}

function renderPage() {
  const c = counts();
  app.innerHTML = `
    ${renderSiteHeader({ active: "quotes", base: "." })}
    <main class="page quotes-page">
      <section class="archive-hero quotes-hero">
        <div class="archive-hero-copy">
          <p class="eyebrow">
            <span class="dot blue"></span>
            Starlight Words
            <span class="dot amber"></span>
          </p>
          <h1>沙夜的星语</h1>
          <p class="archive-lede">
            她说过的话、别人对她说的话，以及与她命运相连的星空名句。
            每一句都尽量标注来源；公开可考的原台词并不多，其余以剧情与设定整理呈现。
          </p>
          <div class="archive-stats">
            <div class="stat-pill"><span>${c.all}</span>全部</div>
            <div class="stat-pill"><span>${c.saya}</span>沙夜</div>
            <div class="stat-pill"><span>${c.about}</span>关于她</div>
            <div class="stat-pill"><span>${c.star}</span>星空</div>
          </div>
        </div>
        <div class="archive-hero-side glass">
          <p class="label">怎么读</p>
          <ul>
            <li><strong>沙夜台词</strong> — 她本人说过的、或高度属于她的话</li>
            <li><strong>关于她</strong> — 晓斗的赞美、外号、星座隐喻</li>
            <li><strong>星空</strong> — 作品名句，与她的观星人生相映</li>
          </ul>
          <a class="btn btn-ghost" href="./index.html#quotes">返回首页星语</a>
        </div>
      </section>

      <section class="section">
        <div class="section-head archive-head">
          <div>
            <p class="eyebrow">Collection</p>
            <h2>摘录</h2>
          </div>
          <div class="gallery-filters archive-filters" role="tablist" aria-label="星语分类">
            ${renderFilters(c)}
          </div>
        </div>
        <div id="quotes-mount">
          ${renderList()}
        </div>
        <p class="quotes-disclaimer">
          本页为个人同人向整理，台词以公开资料为准；若有更准确原文欢迎之后替换进
          <code>src/data/quotes.js</code>。
        </p>
      </section>
    </main>
    ${renderSiteFooter(saya)}
  `;
}

function applyFilter(filter) {
  activeFilter = filter;
  const c = counts();

  document.querySelectorAll(".archive-filters .filter-btn").forEach((btn) => {
    const on = btn.dataset.filter === filter;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-selected", String(on));
  });

  const mount = document.querySelector("#quotes-mount");
  if (mount) {
    mount.innerHTML = renderList();
    bindReveal(mount);
  }

  const stats = document.querySelectorAll(".archive-stats .stat-pill span");
  if (stats.length === 4) {
    stats[0].textContent = String(c.all);
    stats[1].textContent = String(c.saya);
    stats[2].textContent = String(c.about);
    stats[3].textContent = String(c.star);
  }
}

function boot() {
  renderPage();
  initStarfield();
  bindHeader("quotes");
  bindReveal(app);

  document.querySelector(".archive-filters")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    applyFilter(btn.dataset.filter);
  });

  const hash = location.hash.replace("#", "");
  if (quoteFilters.some((f) => f.id === hash)) {
    applyFilter(hash);
  }
}

boot();
