import { saya } from "./data/saya.js";
import { galleryPreview } from "./data/gallery-archive.js";
import { quotesPreview } from "./data/quotes.js";
import { notes } from "./data/notes.js";
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

const lightbox = createLightbox(() => galleryPreview);

const renderHero = () => `
  <section class="hero" id="home">
    <div class="hero-bg-glow" aria-hidden="true"></div>
    <div class="hero-copy">
      <p class="eyebrow">
        <span class="dot blue"></span>
        <span>${esc(saya.series)}</span>
        <span class="dot amber"></span>
      </p>
      <h1 class="hero-title">
        <span class="hero-title-ja">${esc(saya.nameJa)}</span>
        <span class="hero-title-zh">${esc(saya.name)}</span>
      </h1>
      <p class="hero-tagline">${esc(saya.tagline)}</p>
      <p class="hero-lede">${esc(saya.subtitle)}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="./gallery.html">进入完整图集</a>
        <a class="btn btn-ghost" href="./companion.html">去陪伴</a>
        <a class="btn btn-ghost" href="#profile">查看档案</a>
      </div>
      <ul class="hero-meta">
        <li><span>CV</span>${esc(saya.cv)}</li>
        <li><span>作品</span>${esc(saya.seriesJa)}</li>
        <li><span>制作</span>${esc(saya.developer)} · ${saya.year}</li>
      </ul>
    </div>
    <div class="hero-visual">
      <div class="hero-frame">
        <div class="hero-ring" aria-hidden="true"></div>
        <img
          src="${imgSrc(saya.heroImage, saya.name)}"
          alt="${esc(saya.name)}"
          width="1280"
          height="1698"
          loading="eager"
          decoding="async"
          fetchpriority="high"
          data-fallback="${esc(saya.name)}"
        />
        <div class="hero-caption">
          <span class="eye-chip blue">Blue</span>
          <span class="eye-chip amber">Amber</span>
        </div>
      </div>
    </div>
  </section>
`;

const renderAbout = () => `
  <section class="section about" id="about">
    <div class="section-head">
      <p class="eyebrow">About</p>
      <h2>关于她</h2>
      <p class="section-desc">异色瞳的少女，夜空下的青梅竹马。</p>
    </div>
    <div class="about-grid">
      <article class="glass about-main">
        <h3>人物简介</h3>
        <p>${esc(saya.intro)}</p>
        <p>${esc(saya.personality)}</p>
        <p class="about-story">${esc(saya.story)}</p>
      </article>
      <div class="trait-grid">
        ${saya.traits
          .map(
            (t) => `
          <article class="glass trait-card">
            <span class="trait-icon" aria-hidden="true">${t.icon}</span>
            <h3>${esc(t.title)}</h3>
            <p>${esc(t.desc)}</p>
          </article>
        `,
          )
          .join("")}
      </div>
    </div>
  </section>
`;

const renderProfile = () => `
  <section class="section profile" id="profile">
    <div class="section-head">
      <p class="eyebrow">Profile</p>
      <h2>角色档案</h2>
      <p class="section-desc">像把星座连起来一样，把关于沙夜的碎片拼在一起。</p>
    </div>
    <div class="profile-layout">
      <div class="glass profile-card">
        <div class="profile-id">
          <p class="profile-romaji">${esc(saya.nameRomaji)}</p>
          <h3>${esc(saya.name)} <span>${esc(saya.nameJa)}</span></h3>
          <p class="profile-aliases">${saya.aliases.map(esc).join(" · ")}</p>
        </div>
        <dl class="stat-grid">
          ${saya.stats
            .map(
              (s) => `
            <div class="stat">
              <dt>${esc(s.label)}</dt>
              <dd>${esc(s.value)}</dd>
            </div>
          `,
            )
            .join("")}
        </dl>
        <div class="profile-extra">
          <div>
            <span class="label">最爱的星</span>
            <p>${esc(saya.favoriteStar)}</p>
          </div>
          <div>
            <span class="label">眼睛的隐喻</span>
            <p>${esc(saya.eyeMetaphor)}</p>
          </div>
        </div>
        <div class="profile-links">
          ${saya.links
            .map(
              (l) => `
            <a href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>
          `,
            )
            .join("")}
        </div>
      </div>
      <blockquote class="glass quote-featured">
        <p>「${esc(saya.quote)}」</p>
        <footer>— ${esc(saya.name)}</footer>
      </blockquote>
    </div>
  </section>
`;

const renderGallery = () => `
  <section class="section gallery" id="gallery">
    <div class="section-head gallery-head">
      <div>
        <p class="eyebrow">Gallery</p>
        <h2>精选图集</h2>
        <p class="section-desc">首页只放几张代表作，更多官方 CG 与 AI 创作在完整图集里。</p>
      </div>
      <a class="btn btn-primary" href="./gallery.html">打开完整图集</a>
    </div>
    <div class="gallery-grid" id="gallery-grid">
      ${galleryPreview
        .map(
          (item, index) => `
        <figure class="shot" data-category="${esc(item.category)}" data-index="${index}">
          <button type="button" class="shot-open" data-index="${index}" aria-label="查看 ${esc(item.title)}">
            <img
              src="${imgSrc(item.src, item.title)}"
              alt="${esc(item.alt)}"
              loading="lazy"
              data-fallback="${esc(item.title)}"
            />
          </button>
          <figcaption>
            <span class="shot-cat">${esc(item.category)}</span>
            <strong>${esc(item.title)}</strong>
            <p>${esc(item.caption)}</p>
          </figcaption>
        </figure>
      `,
        )
        .join("")}
    </div>
    <div class="gallery-more">
      <a class="btn btn-ghost" href="./gallery.html#official-cg">官方 CG</a>
      <a class="btn btn-ghost" href="./gallery.html#ai">AI 创作</a>
      <a class="btn btn-ghost" href="./gallery.html#official-art">官方立绘</a>
    </div>
  </section>
`;

const renderQuotes = () => `
  <section class="section quotes" id="quotes">
    <div class="section-head gallery-head">
      <div>
        <p class="eyebrow">Starlight</p>
        <h2>星笺</h2>
        <p class="section-desc">她说过的话，以及与她相连的星空名句。首页只放几颗；完整摘录与标注 AI 仿作的新写星笺，都在星笺页。</p>
      </div>
      <a class="btn btn-primary" href="./quotes.html">打开完整星笺</a>
    </div>
    <div class="quotes-grid">
      ${quotesPreview
        .map(
          (q, i) => `
        <article class="glass quote-card" style="--i:${i}">
          <p class="quote-text">「${esc(q.text)}」</p>
          <p class="quote-note">${esc(q.context || q.note || "")}</p>
          <span class="quote-source">${esc(q.speaker)} · ${esc(q.badge || q.source || "")}</span>
        </article>
      `,
        )
        .join("")}
    </div>
    <div class="gallery-more">
      <a class="btn btn-ghost" href="./quotes.html#saya">沙夜台词</a>
      <a class="btn btn-ghost" href="./quotes.html#about">关于她</a>
      <a class="btn btn-ghost" href="./quotes.html#star">星空</a>
      <a class="btn btn-ghost" href="./quotes.html#ai">AI仿作</a>
    </div>
  </section>
`;

const renderNotes = () => `
  <section class="section notes" id="notes">
    <div class="section-head">
      <p class="eyebrow">Notes</p>
      <h2>个人备注</h2>
      <p class="section-desc">写给她的一点私心，以及这个站点以后的方向。</p>
    </div>
    <div class="notes-list">
      ${notes
        .map(
          (n) => `
        <article class="glass note-card">
          <div class="note-meta">
            <span class="note-date">${esc(n.date)}</span>
            <h3>${esc(n.title)}</h3>
          </div>
          <p>${esc(n.body)}</p>
        </article>
      `,
        )
        .join("")}
    </div>
  </section>
`;

app.innerHTML = `
  ${renderSiteHeader({ active: "home", base: "." })}
  <main class="page">
    ${renderHero()}
    ${renderAbout()}
    ${renderProfile()}
    ${renderGallery()}
    ${renderQuotes()}
    ${renderNotes()}
  </main>
  ${renderSiteFooter(saya)}
`;

bindImageFallbacks(app);
initStarfield();
bindHeader("home");
bindReveal(app);

document.querySelector("#gallery-grid")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-index]");
  if (!btn || btn.tagName !== "BUTTON") return;
  lightbox.open(Number(btn.dataset.index));
});
