import { saya } from "./data/saya.js";
import { galleryItems, galleryCategories } from "./data/gallery.js";
import { quotes } from "./data/quotes.js";
import { notes } from "./data/notes.js";

const app = document.querySelector("#app");
const lightbox = document.querySelector("#lightbox");

/* ---------- helpers ---------- */

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const xmlEsc = (s) =>
  String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const fallbackSvg = (label, sub = "Amanogawa Saya") =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a1228"/>
      <stop offset="55%" stop-color="#0d1a3a"/>
      <stop offset="100%" stop-color="#1a1030"/>
    </linearGradient>
    <radialGradient id="b" cx="38%" cy="42%" r="35%">
      <stop offset="0%" stop-color="#5b9dff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#5b9dff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="a" cx="62%" cy="48%" r="32%">
      <stop offset="0%" stop-color="#e8a85c" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#e8a85c" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="900" height="1200" fill="url(#g)"/>
  <rect width="900" height="1200" fill="url(#b)"/>
  <rect width="900" height="1200" fill="url(#a)"/>
  <circle cx="180" cy="160" r="1.5" fill="#fff" opacity="0.7"/>
  <circle cx="720" cy="220" r="1.2" fill="#fff" opacity="0.55"/>
  <circle cx="540" cy="90" r="1.8" fill="#cfe0ff" opacity="0.8"/>
  <circle cx="300" cy="980" r="1.4" fill="#ffd9a8" opacity="0.5"/>
  <text x="50%" y="48%" text-anchor="middle" fill="#eef4ff" font-size="42" font-family="Georgia, serif">${xmlEsc(label)}</text>
  <text x="50%" y="54%" text-anchor="middle" fill="#9aaccf" font-size="22" font-family="system-ui, sans-serif">${xmlEsc(sub)}</text>
</svg>
`)}`;

const imgSrc = (src, label) => src || fallbackSvg(label);

function bindImageFallbacks(root = document) {
  root.querySelectorAll("img[data-fallback]").forEach((img) => {
    const label = img.dataset.fallback || "Saya";
    img.addEventListener(
      "error",
      () => {
        if (img.dataset.failed) return;
        img.dataset.failed = "1";
        img.src = fallbackSvg(label);
      },
      { once: true },
    );
  });
}

/* ---------- starfield ---------- */

function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let stars = [];
  let raf = 0;
  let reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resize = () => {
    w = canvas.width = window.innerWidth * devicePixelRatio;
    h = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    spawn();
  };

  const spawn = () => {
    const count = Math.min(180, Math.floor((window.innerWidth * window.innerHeight) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.35 + 0.2,
      a: Math.random() * 0.6 + 0.15,
      s: Math.random() * 0.015 + 0.004,
      p: Math.random() * Math.PI * 2,
      c: Math.random() > 0.82 ? (Math.random() > 0.5 ? "#9ec0ff" : "#ffd4a0") : "#ffffff",
    }));
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const star of stars) {
      const twinkle = reduceMotion ? star.a : star.a * (0.55 + 0.45 * Math.sin(t * star.s + star.p));
      ctx.beginPath();
      ctx.fillStyle = star.c;
      ctx.globalAlpha = twinkle;
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduceMotion) raf = requestAnimationFrame(draw);
  };

  resize();
  draw(0);
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    resize();
    draw(0);
  });
}

/* ---------- render blocks ---------- */

const renderNav = () => `
  <header class="site-header" id="top">
    <a class="brand" href="#top">
      <span class="brand-orb" aria-hidden="true"></span>
      <span class="brand-text">
        <span class="brand-kicker">Amanogawa Saya</span>
        <span class="brand-name">${esc(saya.name)}</span>
      </span>
    </a>
    <button class="nav-toggle" type="button" aria-label="打开菜单" aria-expanded="false">
      <span></span><span></span>
    </button>
    <nav class="site-nav" aria-label="主导航">
      <a href="#about">关于</a>
      <a href="#profile">档案</a>
      <a href="#gallery">图集</a>
      <a href="#quotes">星语</a>
      <a href="#notes">备注</a>
    </nav>
  </header>
`;

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
        <a class="btn btn-primary" href="#gallery">浏览图集</a>
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
    <div class="section-head">
      <p class="eyebrow">Gallery</p>
      <h2>图集</h2>
      <p class="section-desc">把最喜欢的她，一帧帧留在星空里。</p>
    </div>
    <div class="gallery-filters" role="tablist" aria-label="图集分类">
      ${galleryCategories
        .map(
          (c, i) => `
        <button type="button" class="filter-btn${i === 0 ? " is-active" : ""}" data-filter="${esc(c)}" role="tab" aria-selected="${i === 0}">
          ${esc(c)}
        </button>
      `,
        )
        .join("")}
    </div>
    <div class="gallery-grid" id="gallery-grid">
      ${galleryItems
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
  </section>
`;

const renderQuotes = () => `
  <section class="section quotes" id="quotes">
    <div class="section-head">
      <p class="eyebrow">Starlight</p>
      <h2>星语</h2>
      <p class="section-desc">几句关于她的话，像连成星座的光点。</p>
    </div>
    <div class="quotes-grid">
      ${quotes
        .map(
          (q, i) => `
        <article class="glass quote-card" style="--i:${i}">
          <p class="quote-text">「${esc(q.text)}」</p>
          <p class="quote-note">${esc(q.note)}</p>
          <span class="quote-source">${esc(q.source)}</span>
        </article>
      `,
        )
        .join("")}
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

const renderFooter = () => `
  <footer class="site-footer">
    <div class="footer-constellation" aria-hidden="true">
      <span class="dot blue"></span>
      <span class="line"></span>
      <span class="dot amber"></span>
      <span class="line"></span>
      <span class="dot blue"></span>
    </div>
    <p class="footer-title">${esc(saya.name)}</p>
    <p class="footer-sub">${esc(saya.series)} · ${esc(saya.nameRomaji)}</p>
    <p class="footer-hint">以后或许会加入陪伴功能。今晚，先一起看看星星吧。</p>
    <p class="footer-credit">Fan tribute · 图片来源见角色档案外链 · 仅供个人欣赏</p>
  </footer>
`;

/* ---------- lightbox ---------- */

function openLightbox(index) {
  const item = galleryItems[index];
  if (!item) return;
  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  lightbox.innerHTML = `
    <div class="lightbox-backdrop" data-close></div>
    <div class="lightbox-panel" role="dialog" aria-modal="true" aria-label="${esc(item.title)}">
      <button type="button" class="lightbox-close" data-close aria-label="关闭">×</button>
      <button type="button" class="lightbox-nav prev" data-nav="-1" aria-label="上一张">‹</button>
      <button type="button" class="lightbox-nav next" data-nav="1" aria-label="下一张">›</button>
      <img src="${imgSrc(item.src, item.title)}" alt="${esc(item.alt)}" data-fallback="${esc(item.title)}" />
      <div class="lightbox-meta">
        <span>${esc(item.category)}</span>
        <strong>${esc(item.title)}</strong>
        <p>${esc(item.caption)}</p>
      </div>
    </div>
  `;
  lightbox.dataset.index = String(index);
  bindImageFallbacks(lightbox);
  lightbox.querySelector(".lightbox-close")?.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = "";
  document.body.classList.remove("lightbox-open");
}

function stepLightbox(delta) {
  const current = Number(lightbox.dataset.index || 0);
  const next = (current + delta + galleryItems.length) % galleryItems.length;
  openLightbox(next);
}

/* ---------- interactions ---------- */

function bindInteractions() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toggle?.addEventListener("click", () => {
    const open = !nav?.classList.contains("is-open");
    nav?.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  });

  nav?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  // Gallery filter
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      document.querySelectorAll(".filter-btn").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });
      document.querySelectorAll(".shot").forEach((shot) => {
        const cat = shot.dataset.category;
        const show = filter === "全部" || cat === filter;
        shot.hidden = !show;
      });
    });
  });

  // Gallery open
  document.querySelector("#gallery-grid")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-index]");
    if (!btn || btn.tagName !== "BUTTON") return;
    openLightbox(Number(btn.dataset.index));
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeLightbox();
    const navBtn = e.target.closest("[data-nav]");
    if (navBtn) stepLightbox(Number(navBtn.dataset.nav));
  });

  window.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
  });

  // Reveal on scroll
  const revealables = document.querySelectorAll(".section, .trait-card, .quote-card, .note-card, .shot");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    revealables.forEach((el) => {
      el.classList.add("reveal");
      io.observe(el);
    });
  } else {
    revealables.forEach((el) => el.classList.add("is-visible"));
  }
}

/* ---------- boot ---------- */

app.innerHTML = `
  ${renderNav()}
  <main class="page">
    ${renderHero()}
    ${renderAbout()}
    ${renderProfile()}
    ${renderGallery()}
    ${renderQuotes()}
    ${renderNotes()}
  </main>
  ${renderFooter()}
`;

bindImageFallbacks(app);
initStarfield();
bindInteractions();
