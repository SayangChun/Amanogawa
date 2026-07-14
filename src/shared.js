/** 全站共用：工具、星空、灯箱 */

export const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const xmlEsc = (s) =>
  String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export const fallbackSvg = (label, sub = "Amanogawa Saya") =>
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

export const imgSrc = (src, label) => src || fallbackSvg(label);

export function bindImageFallbacks(root = document) {
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

export function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [];
  let raf = 0;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resize = () => {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
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

export function createLightbox(getItems) {
  const lightbox = document.querySelector("#lightbox");
  if (!lightbox) {
    return { open() {}, close() {} };
  }

  const open = (index) => {
    const items = getItems();
    const item = items[index];
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
        <img src="${imgSrc(item.src, item.title)}" alt="${esc(item.alt || item.title)}" data-fallback="${esc(item.title)}" />
        <div class="lightbox-meta">
          <span>${esc(item.badge || item.category || "")}</span>
          <strong>${esc(item.title)}</strong>
          <p>${esc(item.caption || "")}</p>
        </div>
      </div>
    `;
    lightbox.dataset.index = String(index);
    bindImageFallbacks(lightbox);
    lightbox.querySelector(".lightbox-close")?.focus();
  };

  const close = () => {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = "";
    document.body.classList.remove("lightbox-open");
  };

  const step = (delta) => {
    const items = getItems();
    if (!items.length) return;
    const current = Number(lightbox.dataset.index || 0);
    open((current + delta + items.length) % items.length);
  };

  lightbox.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) close();
    const navBtn = e.target.closest("[data-nav]");
    if (navBtn) step(Number(navBtn.dataset.nav));
  });

  window.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  return { open, close, step };
}

export function bindHeader(active = "home") {
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

  nav?.querySelectorAll(`[data-nav="${active}"]`).forEach((el) => {
    el.classList.add("is-current");
  });
}

export function renderSiteHeader({ active = "home", base = "." } = {}) {
  const home = `${base}/index.html`;
  const gallery = `${base}/gallery.html`;
  const quotes = `${base}/quotes.html`;
  const companion = `${base}/companion.html`;
  return `
  <header class="site-header" id="top">
    <a class="brand" href="${home}">
      <span class="brand-orb" aria-hidden="true"></span>
      <span class="brand-text">
        <span class="brand-kicker">Amanogawa Saya</span>
        <span class="brand-name">天之川沙夜</span>
      </span>
    </a>
    <button class="nav-toggle" type="button" aria-label="打开菜单" aria-expanded="false">
      <span></span><span></span>
    </button>
    <nav class="site-nav" aria-label="主导航">
      <a href="${home}#about" data-nav="about">关于</a>
      <a href="${home}#profile" data-nav="profile">档案</a>
      <a href="${gallery}" data-nav="gallery" class="${active === "gallery" ? "is-current" : ""}">图集</a>
      <a href="${quotes}" data-nav="quotes" class="${active === "quotes" ? "is-current" : ""}">星笺</a>
      <a href="${companion}" data-nav="companion" class="${active === "companion" ? "is-current" : ""}">陪伴</a>
      <a href="${home}#notes" data-nav="notes">备注</a>
    </nav>
  </header>`;
}

export function renderSiteFooter(saya) {
  return `
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
    <p class="footer-hint">陪伴页已就绪——想静一静的时候，去那里一起看星星吧。</p>
    <p class="footer-credit">Fan tribute · 官方图源自 PULLTOP / Bangumi · 仅供个人欣赏</p>
  </footer>`;
}

export function bindReveal(root = document) {
  // 注意：不要把整块 .section 做成 reveal。
  // 星笺等长列表会把 section 撑得极高；若再给 section 加 opacity:0，
  // 子元素即便已 is-visible 也看不见，表现就是「闪一下后整区消失」。
  const revealables = [
    ...root.querySelectorAll(
      ".trait-card, .quote-card, .quote-full-card, .note-card, .shot, .archive-card, .drop-hint, .companion-presence, .companion-portrait, .companion-bubble, .companion-timer, .companion-dialogue",
    ),
  ].filter((el) => !el.classList.contains("is-visible"));

  if (!revealables.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("reveal", "is-visible"));
    return;
  }

  const markVisible = (el, io) => {
    el.classList.add("is-visible");
    io?.unobserve(el);
  };

  const inViewport = (el) => {
    const rect = el.getBoundingClientRect();
    // 布局尚未完成时 rect 可能全 0，交给 IO / rAF 兜底
    if (rect.width === 0 && rect.height === 0) return false;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    return rect.bottom > -64 && rect.right > 0 && rect.top < vh + 64 && rect.left < vw;
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) markVisible(entry.target, io);
      });
    },
    // threshold:0 → 任意像素进入即触发（高元素也稳定）
    { threshold: 0, rootMargin: "64px 0px 64px 0px" },
  );

  // 挂到 root，避免观察者被过早回收
  if (root && root.nodeType === 1) {
    const bag = root.__revealObservers || (root.__revealObservers = []);
    bag.push(io);
  }

  revealables.forEach((el) => {
    el.classList.add("reveal");
    if (inViewport(el)) {
      // 首屏同步可见，避免先变透明再等 IO
      markVisible(el, io);
    } else {
      io.observe(el);
    }
  });

  // 布局稳定后再扫一遍，兜住首帧 rect 不准 / IO 延迟
  const catchUp = () => {
    revealables.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      if (inViewport(el)) markVisible(el, io);
    });
  };
  requestAnimationFrame(() => requestAnimationFrame(catchUp));

  // 极端环境（部分 headless / IO 未回调）下避免整页永远透明
  window.setTimeout(() => {
    const shown = revealables.some((el) => el.classList.contains("is-visible"));
    if (!shown) {
      revealables.forEach((el) => markVisible(el, io));
    } else {
      catchUp();
    }
  }, 320);
}
