import { saya } from "./data/saya.js";
import { galleryItems } from "./data/gallery.js";

const app = document.querySelector("#app");

const fallbackImage = (label) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#030814"/>
          <stop offset="100%" stop-color="#0d1c34"/>
        </linearGradient>
        <radialGradient id="r" cx="50%" cy="28%" r="55%">
          <stop offset="0%" stop-color="#8fb5ff" stop-opacity="0.26"/>
          <stop offset="100%" stop-color="#8fb5ff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="1600" fill="url(#g)"/>
      <rect width="1200" height="1600" fill="url(#r)"/>
      <circle cx="930" cy="220" r="160" fill="#d8e7ff" opacity="0.12"/>
      <circle cx="240" cy="500" r="260" fill="#ffffff" opacity="0.04"/>
      <text x="50%" y="48%" text-anchor="middle" fill="#eef4ff" font-size="58" font-family="Inter, Arial, sans-serif">${label}</text>
      <text x="50%" y="56%" text-anchor="middle" fill="#a9bbdc" font-size="28" font-family="Inter, Arial, sans-serif">这里放沙夜图片</text>
    </svg>
  `)}`;

const heroImage = saya.heroImage || fallbackImage(saya.name);

const renderGallery = () =>
  galleryItems
    .map(
      (item, index) => `
        <figure class="shot ${index === 0 ? "shot-large" : ""}">
          <img src="${item.src || fallbackImage(item.title)}" alt="${item.alt}" />
          <figcaption>
            <span>${item.title}</span>
            <p>${item.caption}</p>
          </figcaption>
        </figure>
      `,
    )
    .join("");

app.innerHTML = `
  <header class="topbar">
    <div class="brand">
      <div class="brand-mark"></div>
      <div>
        <p class="brand-kicker">Amanogawa Saya</p>
        <h1>${saya.name}</h1>
      </div>
    </div>
    <nav class="nav">
      <a href="#home">首页</a>
      <a href="#gallery">图集</a>
    </nav>
  </header>

  <section class="hero" id="home">
    <div class="hero-copy">
      <p class="eyebrow">${saya.series}</p>
      <h2>${saya.tagline}</h2>
      <p class="lede">${saya.intro}</p>
    </div>
    <div class="hero-visual">
      <img src="${heroImage}" alt="${saya.name}" />
    </div>
  </section>

  <section class="gallery-section" id="gallery">
    <div class="section-head">
      <p class="eyebrow">Gallery</p>
      <h2>沙夜的图片</h2>
    </div>
    <div class="gallery-grid">
      ${renderGallery()}
    </div>
  </section>

  <section class="note-strip">
    <p>初版以图片展示为主，角色信息后续按游戏内设定逐条补充。</p>
  </section>
`;
