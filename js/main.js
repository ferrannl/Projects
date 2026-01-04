/* js/main.js */
/* =========================================================
   Ferran Projects – FULL JS (everything)
   ✅ Includes: GitHub loading + cache, projects overrides, thumbnails,
      GitHub Pages live detection (index.html in root), media index,
      tabs + filters + search placeholder, image modal,
      random useless websites button, YouTube secret bg video toggle,
      paint toolbar (clear only), description clamp markers,
      ✅ Season system: auto NL/Amsterdam + ?season= override,
         seasonal CSS link switch + seasonal accent vars + subtle effects,
         seasonal avatar swap.
   ✅ NEW: Projects pagination (6 per page) to reduce GIF/FX lag.
   ✅ NEW: GIF thumbs do NOT animate in grid; they animate only in modal.
         (Grid shows a non-GIF preview instead; modal opens the real GIF.)
   ❌ Removed ONLY: i18n dictionary + language gate translation logic.
   ========================================================= */

/* ---------- Config ---------- */

const GITHUB_USER = "ferrannl";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
const PROJECTS_URL = "./projects/projects.json";
const MEDIA_INDEX_URL = "./media/media.json";

const CACHE_KEY = "ferranProjectsCacheV2";
const THUMB_CACHE_KEY = "ferranProjectsThumbsV5"; // bump key (new gif-preview logic)
const LIVE_CACHE_KEY = "ferranProjectsLiveIndexV1"; // cache: repoName -> { hasIndex: bool, ts: number }

/* NOTE: i18n removed on purpose. Keep these only if you still use them elsewhere. */
const DEFAULT_LANG = "nl";

/* ✅ Pagination */
const PROJECTS_PAGE_SIZE = 6;

/* ---------- Random useless websites list ---------- */

const USELESS_WEB_URLS = [
  "https://corndog.io",
  "https://eelslap.com",
  "https://heeeeeeeey.com",
  "https://pointerpointer.com",
  "https://www.bouncingdvdlogo.com",
  "https://www.koalastothemax.com",
  "https://www.rrrgggbbb.com",
  "https://www.trypap.com",
  "https://www.cat-bounce.com",
  "https://www.donothingfor2minutes.com",
  "https://www.fallingfalling.com",
  "https://www.zoomquilt.org",
  "https://www.zoomquilt2.com",
  "https://endless.horse",
  "https://papertoilet.com",
  "https://isitchristmas.com",
  "https://beesbeesbeesbees.com",
  "https://puginarug.com",
  "https://wowenwilsonquiz.com",
  "https://findtheinvisiblecow.com",
  "https://neal.fun/deep-sea/",
  "https://neal.fun/spend/",
  "https://neal.fun/password-game/",
  "https://neal.fun/dark-patterns/",
  "https://neal.fun/absurd-trolley-problems/",
  "https://neal.fun/infinite-craft/",
  "https://neal.fun/space-elevator/",
  "https://neal.fun/life-checklist/",
  "https://neal.fun/where-does-the-day-go/",
  "https://neal.fun/wonders-of-street-view/",
  "https://neal.fun/lets-settle-this/",
  "https://neal.fun/ambient-chaos/",
  "https://neal.fun/universe-forecast/",
  "https://neal.fun/sun-vs-moon/",
  "https://neal.fun/earth-view/",
  "https://neal.fun/baby-map/",
  "https://neal.fun/design-the-next-iphone/",
  "https://neal.fun/printing-money/",
  "https://neal.fun/logos-from-memory/",
  "https://neal.fun/auction-game/",
  "https://neal.fun/asteroid-launcher/",
  "https://neal.fun/rocks/",
  "https://neal.fun/the-weight-of-the-internet/",
  "https://neal.fun/how-many-days/",
  "https://neal.fun/how-many-emojis/",
  "https://neal.fun/speed/",
  "https://neal.fun/size-of-space/"
];

/* ---------- State ---------- */

let repos = [];
let projects = [];
let mediaItems = [];
let thumbCache = loadThumbCache();
let liveIndexCache = loadLiveIndexCache();
let paintIframe = null;

const state = {
  activeTab: "projects",
  search: "",
  typeFilter: "all",
  languageFilter: "all",
  mediaTypeFilter: "all",
  lang: DEFAULT_LANG,

  /* ✅ pagination */
  projectsPage: 1
};

/* Small words not capitalized in titles (except first word) */
const SMALL_WORDS = ["voor", "na", "met", "door", "en", "of", "und", "mit", "von", "the", "and", "of"];

/* Languages you don't want to see */
const BLOCKED_LANGUAGES = ["roff", "nix", "emacs lisp"];

/* ---------- Secret background video (YouTube API globals) ---------- */

let bgPlayer = null;
let bgPlayerReady = false;

/* Called by the YouTube IFrame API when it’s ready */
function onYouTubeIframeAPIReady() {
  const containerId = "bgVideoContainer";
  const el = document.getElementById(containerId);
  if (!el || !window.YT || !YT.Player) return;

  // NEW video
  const VIDEO_ID = "oHg5SJYRHA0";

  bgPlayer = new YT.Player(containerId, {
    videoId: VIDEO_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      rel: 0,
      modestbranding: 1,
      loop: 1,
      playlist: VIDEO_ID, // required for looping
      playsinline: 1
    },
    events: {
      onReady: (event) => {
        bgPlayerReady = true;
        try {
          event.target.setVolume(20);
        } catch (_) {}
      }
    }
  });
}

/* =========================================================
   SEASONS (Amsterdam/NL)
   - Auto by month
   - Override via ?season=winter|spring|summer|autumn
   - Also accepts your old typo: ?seaosn=
   - Switches a <link id="seasonStylesheet">
   - Sets subtle CSS vars for accent replacement (no red)
   - Adds subtle seasonal effects (snow/leaves/blossom/sun haze)
   - Swaps avatar image by season
   ========================================================= */

const SEASON_ORDER = ["winter", "spring", "summer", "autumn"];

// Update these paths to match your repo structure.
const SEASON_CSS = {
  winter: "./css/season-winter.css",
  spring: "./css/season-spring.css",
  summer: "./css/season-summer.css",
  autumn: "./css/season-autumn.css"
};

// Avatar images (you said you will provide 4 + default)
const AVATARS = {
  default: "./assets/profile-default.gif",
  winter: "./assets/profile-winter.gif",
  spring: "./assets/profile-spring.gif",
  summer: "./assets/profile-summer.gif",
  autumn: "./assets/profile-autumn.gif"
};

// Subtle accent palettes — replaces your red accent with seasonal colors.
// Keep site DARK; we only touch accent-y tokens.
const SEASON_VARS = {
  winter: {
    "--accent": "#7fb8ff",
    "--accent-soft": "rgba(127,184,255,.25)",
    "--accent-alt": "#cfe6ff",
    "--season-glow": "rgba(127,184,255,.18)",
    "--season-glow-2": "rgba(220,240,255,.10)"
  },
  spring: {
    "--accent": "#ff78b5",
    "--accent-soft": "rgba(255,120,181,.22)",
    "--accent-alt": "#7de7a8",
    "--season-glow": "rgba(255,120,181,.15)",
    "--season-glow-2": "rgba(125,231,168,.10)"
  },
  summer: {
    "--accent": "#ffd96a",
    "--accent-soft": "rgba(255,217,106,.20)",
    "--accent-alt": "#69d3ff",
    "--season-glow": "rgba(255,217,106,.14)",
    "--season-glow-2": "rgba(105,211,255,.10)"
  },
  autumn: {
    "--accent": "#ff9a4a",
    "--accent-soft": "rgba(255,154,74,.22)",
    "--accent-alt": "#ffd2a1",
    "--season-glow": "rgba(255,154,74,.16)",
    "--season-glow-2": "rgba(151,88,39,.12)"
  }
};

function getSeasonFromDateAmsterdam() {
  // Month mapping (NL seasons, simple)
  // winter: Dec–Feb, spring: Mar–May, summer: Jun–Aug, autumn: Sep–Nov
  const m = new Date().getMonth(); // 0..11
  if (m === 11 || m === 0 || m === 1) return "winter";
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  return "autumn";
}

function getSeasonOverride() {
  const params = new URLSearchParams(location.search);
  const raw = (params.get("season") || params.get("seaosn") || "").toLowerCase().trim();
  if (!raw) return null;
  const cleaned = raw.replace(/[^a-z]/g, "");
  if (SEASON_ORDER.includes(cleaned)) return cleaned;
  if (cleaned === "fall") return "autumn";
  return null;
}

function ensureSeasonLinkTag() {
  let link = document.getElementById("seasonStylesheet");
  if (link && link.tagName.toLowerCase() === "link") return link;

  link = document.createElement("link");
  link.id = "seasonStylesheet";
  link.rel = "stylesheet";
  link.href = "";
  document.head.appendChild(link);
  return link;
}

function applySeasonCss(season) {
  const link = ensureSeasonLinkTag();
  const href = SEASON_CSS[season];
  if (!href) return;

  // cache-bust during dev
  const busted = href + (href.includes("?") ? "&" : "?") + "v=" + Date.now();
  link.href = busted;
}

function applySeasonVars(season) {
  const vars = SEASON_VARS[season];
  if (!vars) return;

  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  document.body.setAttribute("data-season", season);
}

function applySeasonAvatar(season) {
  const img = document.querySelector(".profile-avatar-inner img");
  if (!img) return;

  const chosen = AVATARS[season] || AVATARS.default;
  if (!chosen) return;

  if (img.dataset.seasonSrc === chosen) return;

  img.dataset.seasonSrc = chosen;
  img.src = chosen;
}

function setThemeRedToSeason(season) {
  document.documentElement.style.setProperty("--selection-bg", "var(--accent-soft)");
}

function applySeason(season) {
  applySeasonCss(season);
  applySeasonVars(season);
  applySeasonAvatar(season);
  setThemeRedToSeason(season);
  setupSeasonEffects(season);
}

function initSeason() {
  const override = getSeasonOverride();
  const season = override || getSeasonFromDateAmsterdam();
  applySeason(season);
}

/* ---------- Seasonal effects (subtle) ---------- */

let seasonFx = null;

function prefersReducedMotion() {
  return !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setupSeasonEffects(season) {
  if (seasonFx && typeof seasonFx.destroy === "function") seasonFx.destroy();
  seasonFx = null;

  if (prefersReducedMotion()) return;

  if (season === "winter") seasonFx = createSnowFx();
  else if (season === "autumn") seasonFx = createLeafFx();
  else if (season === "spring") seasonFx = createBlossomFx();
  else if (season === "summer") seasonFx = createSunHazeFx();
}

function createFxCanvas() {
  const c = document.createElement("canvas");
  c.className = "season-fx-canvas";
  Object.assign(c.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "0",
    opacity: "1"
  });
  document.body.appendChild(c);

  const ctx = c.getContext("2d", { alpha: true });

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.floor(window.innerWidth * dpr);
    c.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  let raf = 0;
  const onResize = () => resize();
  window.addEventListener("resize", onResize);

  return {
    canvas: c,
    ctx,
    start(loop) {
      const tick = (t) => {
        raf = requestAnimationFrame(tick);
        loop(t);
      };
      raf = requestAnimationFrame(tick);
    },
    stop() {
      cancelAnimationFrame(raf);
    },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      c.remove();
    }
  };
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function createSnowFx() {
  const fx = createFxCanvas();
  const { ctx } = fx;

  const flakes = [];
  const count = Math.round(Math.min(90, Math.max(35, window.innerWidth / 18)));

  function spawn() {
    flakes.length = 0;
    for (let i = 0; i < count; i++) {
      flakes.push({
        x: rand(0, window.innerWidth),
        y: rand(-window.innerHeight, window.innerHeight),
        r: rand(0.8, 2.2),
        vy: rand(0.35, 1.15),
        vx: rand(-0.25, 0.25),
        wob: rand(0, Math.PI * 2),
        wobSp: rand(0.002, 0.006)
      });
    }
  }
  spawn();

  fx.start(() => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(230,245,255,0.85)";
    flakes.forEach((f) => {
      f.wob += f.wobSp;
      f.x += f.vx + Math.sin(f.wob) * 0.2;
      f.y += f.vy;

      if (f.y > window.innerHeight + 10) {
        f.y = -10;
        f.x = rand(0, window.innerWidth);
      }
      if (f.x < -10) f.x = window.innerWidth + 10;
      if (f.x > window.innerWidth + 10) f.x = -10;

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  });

  return fx;
}

function createLeafFx() {
  const fx = createFxCanvas();
  const { ctx } = fx;

  const leaves = [];
  const count = Math.round(Math.min(22, Math.max(8, window.innerWidth / 90)));

  function makeLeaf() {
    return {
      x: rand(-40, window.innerWidth + 40),
      y: rand(-window.innerHeight, 0),
      s: rand(0.55, 1.0),
      vy: rand(0.45, 1.15),
      vx: rand(0.45, 1.55),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.02, 0.02),
      wob: rand(0, Math.PI * 2),
      wobSp: rand(0.004, 0.01),
      hue: rand(18, 38),
      alpha: rand(0.55, 0.9)
    };
  }

  for (let i = 0; i < count; i++) leaves.push(makeLeaf());

  function drawLeaf(l) {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.rot);

    const w = 10 * l.s;
    const h = 6 * l.s;

    ctx.beginPath();
    ctx.moveTo(-w, 0);
    ctx.quadraticCurveTo(-w * 0.2, -h, 0, 0);
    ctx.quadraticCurveTo(-w * 0.2, h, -w, 0);
    ctx.closePath();

    ctx.fillStyle = `hsla(${l.hue}, 85%, 62%, ${l.alpha})`;
    ctx.fill();

    ctx.strokeStyle = `hsla(${l.hue - 10}, 55%, 35%, ${l.alpha * 0.55})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-w * 0.95, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();

    ctx.restore();
  }

  fx.start(() => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    leaves.forEach((l) => {
      l.wob += l.wobSp;
      l.x += l.vx + Math.sin(l.wob) * 0.35;
      l.y += l.vy;
      l.rot += l.vr;

      if (l.y > window.innerHeight + 40 || l.x > window.innerWidth + 60) {
        const n = makeLeaf();
        n.y = -20;
        n.x = rand(-40, window.innerWidth * 0.35);
        leaves[leaves.indexOf(l)] = n;
      } else {
        drawLeaf(l);
      }
    });
  });

  return fx;
}

function createBlossomFx() {
  const fx = createFxCanvas();
  const { ctx } = fx;

  const petals = [];
  const count = Math.round(Math.min(24, Math.max(9, window.innerWidth / 85)));

  function makePetal() {
    return {
      x: rand(-40, window.innerWidth + 40),
      y: rand(-window.innerHeight, 0),
      s: rand(0.5, 0.95),
      vy: rand(0.35, 0.95),
      vx: rand(0.25, 1.05),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.02, 0.02),
      wob: rand(0, Math.PI * 2),
      wobSp: rand(0.004, 0.01),
      alpha: rand(0.55, 0.9)
    };
  }

  for (let i = 0; i < count; i++) petals.push(makePetal());

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);

    const w = 9 * p.s;
    const h = 6 * p.s;

    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.bezierCurveTo(w, -h, w, h, 0, h);
    ctx.bezierCurveTo(-w, h, -w, -h, 0, -h);
    ctx.closePath();

    ctx.fillStyle = `rgba(255, 170, 210, ${p.alpha})`;
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.25})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  fx.start(() => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    petals.forEach((p) => {
      p.wob += p.wobSp;
      p.x += p.vx + Math.sin(p.wob) * 0.35;
      p.y += p.vy;
      p.rot += p.vr;

      if (p.y > window.innerHeight + 40 || p.x > window.innerWidth + 60) {
        const n = makePetal();
        n.y = -20;
        n.x = rand(-40, window.innerWidth * 0.35);
        petals[petals.indexOf(p)] = n;
      } else {
        drawPetal(p);
      }
    });
  });

  return fx;
}

function createSunHazeFx() {
  const fx = createFxCanvas();
  const { ctx } = fx;

  const specks = [];
  const count = Math.round(Math.min(26, Math.max(10, window.innerWidth / 80)));

  function makeSpeck() {
    return {
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      r: rand(0.8, 1.8),
      vx: rand(-0.08, 0.12),
      vy: rand(-0.06, 0.10),
      a: rand(0.12, 0.28),
      wob: rand(0, Math.PI * 2),
      wobSp: rand(0.002, 0.005)
    };
  }

  for (let i = 0; i < count; i++) specks.push(makeSpeck());

  fx.start(() => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const grd = ctx.createRadialGradient(140, 120, 20, 140, 120, Math.min(520, window.innerWidth * 0.6));
    grd.addColorStop(0, "rgba(255, 225, 130, 0.10)");
    grd.addColorStop(1, "rgba(255, 225, 130, 0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    specks.forEach((s) => {
      s.wob += s.wobSp;
      s.x += s.vx + Math.sin(s.wob) * 0.08;
      s.y += s.vy + Math.cos(s.wob) * 0.06;

      if (s.x < -10) s.x = window.innerWidth + 10;
      if (s.x > window.innerWidth + 10) s.x = -10;
      if (s.y < -10) s.y = window.innerHeight + 10;
      if (s.y > window.innerHeight + 10) s.y = -10;

      ctx.fillStyle = `rgba(255, 240, 200, ${s.a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  return fx;
}

/* =========================================================
   Init
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("js-enabled");

  document.getElementById("postboardForm")?.closest(".playground-card")?.remove();

  initSeason();

  document.documentElement.lang = DEFAULT_LANG;

  setupTabsAndFilters();
  setupSearch();
  setupImageModal();
  setupFooterCopyright();
  setupPlaygroundRandomButton();
  setupSecretBgVideoToggle();
  setupPaintToolbar();

  loadProjects();
  loadMedia();
});

/* ---------- Helpers: clamp markers ---------- */

function applyDescriptionClampMarkers() {
  const cards = document.querySelectorAll(".project-desc");
  cards.forEach((p) => {
    p.classList.remove("is-clamped");
    const isOverflowing = p.scrollHeight > p.clientHeight + 1;
    if (isOverflowing) p.classList.add("is-clamped");
  });
}

/* ---------- Helpers: search placeholder per tab ---------- */

function getSearchPlaceholder(view) {
  const tab = view || "projects";

  if (tab === "media") return "Search media by title or filename…";
  if (tab === "playground") return "Search playground tools by name or description…";
  return "Search projects by name, description, language or tags…";
}

function updateSearchPlaceholder() {
  const searchInput = document.getElementById("search");
  if (!searchInput) return;
  searchInput.placeholder = getSearchPlaceholder(state.activeTab);
}

/* ---------- Tabs & filters visibility ---------- */

function setupTabsAndFilters() {
  const projectsTab = document.getElementById("projectsTab");
  const mediaTab = document.getElementById("mediaTab");
  const playgroundTab = document.getElementById("playgroundTab");

  const projectsView = document.getElementById("projectsView");
  const mediaView = document.getElementById("mediaView");
  const playgroundView = document.getElementById("playgroundView");

  const projectFilters = document.getElementById("projectFilters");
  const mediaFilters = document.getElementById("mediaFilters");

  if (!projectsTab || !mediaTab || !playgroundTab || !projectsView || !mediaView || !playgroundView) return;

  const tabsContainer = document.querySelector(".tabs");

  function updateTabsPill(activeButton) {
    if (!tabsContainer || !activeButton) return;
    const tabsRect = tabsContainer.getBoundingClientRect();
    const btnRect = activeButton.getBoundingClientRect();
    const left = btnRect.left - tabsRect.left;
    const width = btnRect.width;
    tabsContainer.style.setProperty("--pill-left", `${left}px`);
    tabsContainer.style.setProperty("--pill-width", `${width}px`);
  }

  function showProjects() {
    state.activeTab = "projects";
    projectsTab.classList.add("active");
    mediaTab.classList.remove("active");
    playgroundTab.classList.remove("active");

    projectsView.style.display = "";
    mediaView.style.display = "none";
    playgroundView.style.display = "none";

    if (projectFilters) projectFilters.hidden = false;
    if (mediaFilters) mediaFilters.hidden = true;

    updateSearchPlaceholder();
    renderProjects();
    updateTabsPill(projectsTab);
  }

  function showMedia() {
    state.activeTab = "media";
    mediaTab.classList.add("active");
    projectsTab.classList.remove("active");
    playgroundTab.classList.remove("active");

    mediaView.style.display = "";
    projectsView.style.display = "none";
    playgroundView.style.display = "none";

    if (projectFilters) projectFilters.hidden = true;
    if (mediaFilters) mediaFilters.hidden = false;

    updateSearchPlaceholder();
    renderMedia();
    updateTabsPill(mediaTab);
  }

  function showPlayground() {
    state.activeTab = "playground";
    playgroundTab.classList.add("active");
    projectsTab.classList.remove("active");
    mediaTab.classList.remove("active");

    playgroundView.style.display = "";
    projectsView.style.display = "none";
    mediaView.style.display = "none";

    if (projectFilters) projectFilters.hidden = true;
    if (mediaFilters) mediaFilters.hidden = true;

    updateSearchPlaceholder();
    updateTabsPill(playgroundTab);
  }

  projectsTab.addEventListener("click", showProjects);
  mediaTab.addEventListener("click", showMedia);
  playgroundTab.addEventListener("click", showPlayground);

  showProjects();

  window.addEventListener("resize", () => {
    const active =
      state.activeTab === "media" ? mediaTab :
      state.activeTab === "playground" ? playgroundTab : projectsTab;
    updateTabsPill(active);
  });

  const typeFilter = document.getElementById("typeFilter");
  const languageFilter = document.getElementById("languageFilter");
  const mediaTypeFilter = document.getElementById("mediaTypeFilter");

  if (typeFilter) {
    typeFilter.addEventListener("change", () => {
      state.typeFilter = typeFilter.value;
      state.projectsPage = 1; // ✅ reset page
      renderProjects();
    });
  }

  if (languageFilter) {
    languageFilter.addEventListener("change", () => {
      state.languageFilter = languageFilter.value;
      state.projectsPage = 1; // ✅ reset page
      renderProjects();
    });
  }

  if (mediaTypeFilter) {
    mediaTypeFilter.addEventListener("change", () => {
      state.mediaTypeFilter = mediaTypeFilter.value;
      renderMedia();
    });
  }
}

/* ---------- Search ---------- */

function setupSearch() {
  const searchEl = document.getElementById("search");
  if (!searchEl) return;

  searchEl.addEventListener("input", () => {
    state.search = searchEl.value.trim();
    if (state.activeTab === "projects") {
      state.projectsPage = 1; // ✅ reset page
      renderProjects();
    }
    if (state.activeTab === "media") renderMedia();
  });

  updateSearchPlaceholder();
}

/* ---------- Secret bg video toggle (profile picture) ---------- */

function setAvatarPlaying(isPlaying) {
  const avatar = document.querySelector(".profile-avatar");
  if (!avatar) return;
  avatar.classList.toggle("profile-avatar--playing", isPlaying);
}

function setupSecretBgVideoToggle() {
  const avatarImg = document.querySelector(".profile-avatar-inner img");
  const overlay = document.getElementById("bgVideoOverlay");
  if (!avatarImg || !overlay) return;

  avatarImg.style.cursor = "pointer";

  avatarImg.addEventListener("click", () => {
    if (!bgPlayerReady || !bgPlayer) return;

    const isActive = !document.body.classList.contains("bg-video-active");
    document.body.classList.toggle("bg-video-active", isActive);
    overlay.setAttribute("aria-hidden", isActive ? "false" : "true");

    try {
      if (isActive) {
        bgPlayer.unMute();
        bgPlayer.setVolume(20);
        bgPlayer.playVideo();
        setAvatarPlaying(true);
      } else {
        bgPlayer.pauseVideo();
        setAvatarPlaying(false);
      }
    } catch (_) {}
  });
}

/* ---------- Projects loading (GitHub + overrides) ---------- */

async function loadProjects() {
  const overrides = await loadProjectOverrides();
  const apiRepos = await loadGitHubReposWithCache();

  const overridesByName = {};
  overrides.forEach((o) => {
    if (o && o.name) overridesByName[o.name.toLowerCase()] = o;
  });

  repos = apiRepos.filter((repo) => {
    if (repo.archived || repo.fork) return false;
    const name = (repo.name || "").toLowerCase();
    if (name === "projects") return false;
    if (name.includes("address-distance-calculator")) return false;
    if (name.includes("study-mate")) return false;
    if (name.includes("monsterzoo")) return false;
    if (name.includes("munchkin")) return false;
    if (name.includes("pso") && name.includes("wiiu")) return false;
    return true;
  });

  projects = repos.map((repo) => {
    const o = overridesByName[(repo.name || "").toLowerCase()] || {};
    const displayName = formatRepoName(o.displayName || repo.name || "");
    const description = o.description || repo.description || "No description yet.";

    const overrideLangs = Array.isArray(o.languages) ? o.languages : o.langs;
    const languages = getLanguagesList(repo, overrideLangs);

    const type = guessProjectType(repo, o, languages);
    const tags = Array.isArray(o.tags) ? [...o.tags] : [];

    const liveUrl = resolveManualLiveUrl(repo, o);

    // thumbnail is computed later; store override if any
    const thumbnail = computeThumbnail(repo, o);

    return {
      id: repo.id,
      name: repo.name,
      displayName,
      description,
      languages,
      type,
      tags,
      liveUrl,
      githubUrl: repo.html_url,

      // ✅ new thumb fields
      thumbnail,          // can be gif or any
      thumbPreview: null, // what we show in the grid (never animated gif)
      thumbAnimated: null // if original was gif, it goes here (only used in modal)
    };
  });

  sortProjectsByLive();
  buildLanguageFilterOptions(projects);

  state.projectsPage = 1; // ✅
  renderProjects();

  await loadProjectThumbnails();

  await resolveGitHubPagesLiveUrls();
  sortProjectsByLive();
  renderProjects();
}

async function loadProjectOverrides() {
  try {
    const res = await fetch(PROJECTS_URL);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to load projects.json", err);
    return [];
  }
}

/* ---------- GitHub repo loading (cache) ---------- */

async function loadGitHubReposWithCache() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("GitHub HTTP " + res.status);
    const data = await res.json();
    saveReposToCache(data);
    return data;
  } catch (err) {
    console.error("GitHub fetch failed, trying cache instead:", err);
    const cached = readReposFromCache();
    if (cached) return cached;
    return [];
  }
}

function readReposFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.repos)) return parsed.repos;
    return null;
  } catch (err) {
    console.error("Error reading repos from cache:", err);
    return null;
  }
}

function saveReposToCache(reposToSave) {
  try {
    const payload = { timestamp: Date.now(), repos: reposToSave };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("Error saving repos to cache:", err);
  }
}

/* ---------- Name / language helpers ---------- */

function formatRepoName(raw) {
  if (!raw) return "";
  let name = raw.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  const words = name.split(" ");
  return words
    .map((w, index) => {
      const lw = w.toLowerCase();
      if (lw === "ios") return "iOS";
      if (lw === "api") return "API";
      if (lw === "asp.net" || lw === "aspnet") return "ASP.NET";
      if (SMALL_WORDS.includes(lw) && index !== 0) return lw;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function getLanguagesList(repo, overrideList) {
  const primary = repo?.language;
  const name = String(repo?.name || "").toLowerCase();
  const desc = String(repo?.description || "").toLowerCase();
  const joined = `${name} ${desc}`;

  const addIf = (arr, value, condition) => {
    if (!condition) return;
    if (!arr.some((x) => String(x).toLowerCase() === String(value).toLowerCase())) arr.push(value);
  };

  if (Array.isArray(overrideList) && overrideList.length) {
    const cleaned = overrideList
      .map((l) => String(l))
      .filter((l) => !BLOCKED_LANGUAGES.includes(l.toLowerCase()));

    addIf(cleaned, "ASP.NET", /asp\.net|aspnet/.test(joined));
    addIf(cleaned, "WPF", /\bwpf\b/.test(joined));
    addIf(cleaned, "WinForms", /winforms|windows forms/.test(joined));
    addIf(cleaned, "Blazor", /\bblazor\b/.test(joined));
    addIf(cleaned, "Java Swing", /\bswing\b/.test(joined));
    addIf(cleaned, "JavaFX", /\bjavafx\b/.test(joined));

    return cleaned.filter((l) => !BLOCKED_LANGUAGES.includes(String(l).toLowerCase()));
  }

  const list = [];
  if (!primary) return list;

  const p = String(primary).toLowerCase();
  if (BLOCKED_LANGUAGES.includes(p)) return [];

  if (p === "html") list.push("HTML", "CSS", "JS");
  else if (p === "javascript") list.push("JS", "HTML", "CSS");
  else if (p === "typescript") list.push("TypeScript", "JS", "HTML", "CSS");
  else if (p === "css") list.push("CSS", "HTML", "JS");
  else if (p === "php") list.push("PHP", "HTML", "CSS", "JS");
  else if (p === "c#") list.push("C#", ".NET");
  else if (p === "java") list.push("Java");
  else if (p === "c++") list.push("C++", "C");
  else list.push(primary);

  if (p === "c#" || list.some((x) => String(x).toLowerCase() === "c#")) {
    addIf(list, "ASP.NET", /asp\.net|aspnet/.test(joined));
    addIf(list, "WPF", /\bwpf\b/.test(joined));
    addIf(list, "WinForms", /winforms|windows forms/.test(joined));
    addIf(list, "Blazor", /\bblazor\b/.test(joined));
    addIf(list, "Entity Framework", /\bef\b|entity framework/.test(joined));
  }

  if (p === "java" || list.some((x) => String(x).toLowerCase() === "java")) {
    addIf(list, "Java Swing", /\bswing\b/.test(joined));
    addIf(list, "JavaFX", /\bjavafx\b/.test(joined));
    addIf(list, "Spring", /\bspring\b/.test(joined));
  }

  if (p === "c++" || list.some((x) => String(x).toLowerCase() === "c++")) {
    addIf(list, "Qt", /\bqt\b/.test(joined));
  }

  return list.filter((l) => !BLOCKED_LANGUAGES.includes(String(l).toLowerCase()));
}

function buildLanguageFilterOptions(projectsList) {
  const select = document.getElementById("languageFilter");
  if (!select) return;

  while (select.options.length > 1) select.remove(1);

  const set = new Set();
  projectsList.forEach((p) => {
    (p.languages || []).forEach((lang) => {
      const lower = String(lang).toLowerCase();
      if (!BLOCKED_LANGUAGES.includes(lower)) set.add(lang);
    });
  });

  Array.from(set)
    .sort((a, b) => a.localeCompare(b, "en"))
    .forEach((lang) => {
      const opt = document.createElement("option");
      opt.value = lang;
      opt.textContent = lang;
      select.appendChild(opt);
    });
}

/* ---------- Type helpers (simple) ---------- */

function guessProjectType(repo, override, languages) {
  if (override && override.type) return override.type;

  const name = (repo.name || "").toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const joined = `${name} ${desc}`;
  const lang = (repo.language || "").toLowerCase();

  const has = (words) => words.some((w) => joined.includes(w));

  const isGame = has(["game", "games", "spel", "sudoku", "unity", "platformer", "puzzle", "rpg"]);
  const isApi = has(["api", "backend", "server", "service", "rest", "endpoint"]);
  const isMobile = has(["android", "ios", "xamarin", "apk", "swiftui", "flutter", "react native", "react-native"]);
  const isSchool = has(["school", "study", "studie", "uni", "hogeschool", "opdracht", "assignment", "stage", "internship"]);

  const isWebsite =
    ["html", "javascript", "typescript", "css"].includes(lang) ||
    (Array.isArray(languages) && languages.some((l) => ["html", "css", "js", "typescript"].includes(String(l).toLowerCase()))) ||
    has(["website", "webpage", "portfolio", "landing", "site", "page", "github pages", "gh-pages"]);

  if (isGame) return "game";
  if (isMobile) return "mobile";
  if (isApi) return "api";
  if (isSchool) return "school";
  if (isWebsite) return "website";
  return "other";
}

/* ---------- Live URL logic ---------- */

function resolveManualLiveUrl(repo, override) {
  const rawOverride = (override?.liveUrl || "").trim();
  if (rawOverride) return rawOverride;
  return null;
}

async function resolveGitHubPagesLiveUrls() {
  const now = Date.now();
  const TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

  const tasks = projects.map(async (p) => {
    if (p.liveUrl) return;

    const repo = repos.find((r) => String(r.name).toLowerCase() === String(p.name).toLowerCase());
    if (!repo || !repo.has_pages) return;

    const cached = liveIndexCache[p.name];
    if (cached && typeof cached.hasIndex === "boolean" && (now - (cached.ts || 0)) < TTL) {
      if (cached.hasIndex) p.liveUrl = `https://${GITHUB_USER}.github.io/${p.name}/`;
      return;
    }

    const hasIndex = await repoHasRootIndexHtml(p.name);
    liveIndexCache[p.name] = { hasIndex, ts: now };
    saveLiveIndexCache();

    if (hasIndex) {
      p.liveUrl = `https://${GITHUB_USER}.github.io/${p.name}/`;
    }
  });

  await Promise.all(tasks);
}

async function repoHasRootIndexHtml(repoName) {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repoName}/contents/`);
    if (!res.ok) return false;
    const data = await res.json();
    if (!Array.isArray(data)) return false;

    return data.some((item) => item && item.type === "file" && String(item.name || "").toLowerCase() === "index.html");
  } catch (err) {
    console.error("Failed to check index.html for", repoName, err);
    return false;
  }
}

function loadLiveIndexCache() {
  try {
    const raw = localStorage.getItem(LIVE_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

function saveLiveIndexCache() {
  try {
    localStorage.setItem(LIVE_CACHE_KEY, JSON.stringify(liveIndexCache));
  } catch (_) {}
}

function sortProjectsByLive() {
  projects.sort((a, b) => {
    if (a.liveUrl && !b.liveUrl) return -1;
    if (!a.liveUrl && b.liveUrl) return 1;
    return a.displayName.localeCompare(b.displayName, "en");
  });
}

/* ---------- Thumbnail helpers (root images) ---------- */

function computeThumbnail(repo, override) {
  if (override.thumbnail || override.thumb) return override.thumbnail || override.thumb;
  return null;
}

function loadThumbCache() {
  try {
    const raw = localStorage.getItem(THUMB_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

function saveThumbCache() {
  try {
    localStorage.setItem(THUMB_CACHE_KEY, JSON.stringify(thumbCache));
  } catch (_) {}
}

async function checkImageExists(url, preferGet = false) {
  try {
    if (!preferGet) {
      let res = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (res.ok) return true;
    }
    const res2 = await fetch(url, { method: "GET", cache: "no-store" });
    return res2.ok;
  } catch (_) {
    return false;
  }
}

function withBust(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${Date.now()}`;
}

/* ✅ helper */
function isGifUrl(url) {
  const u = String(url || "").toLowerCase();
  return u.endsWith(".gif") || u.includes(".gif?");
}

function opengraphFallback(repoName) {
  return `https://opengraph.githubassets.com/1/${GITHUB_USER}/${repoName}`;
}

/**
 * ✅ NEW THUMB RULE:
 * - We may still *store* the best root image (logo.gif is fine),
 * - BUT: if it is a GIF, we do NOT display it in the grid.
 *   Instead:
 *     project.thumbAnimated = gif
 *     project.thumbPreview  = best non-gif we can find (logo.png/jpg/webp/svg), else opengraph
 * - Modal uses thumbAnimated (gif), so it plays only when clicked.
 */
async function loadProjectThumbnails() {
  const promises = projects.map(async (project) => {
    const repoName = project.name;

    // 1) explicit override
    if (project.thumbnail && !thumbCache[repoName]) {
      const ok = await checkImageExists(project.thumbnail, isGifUrl(project.thumbnail));
      if (ok) {
        thumbCache[repoName] = project.thumbnail;
      } else {
        project.thumbnail = null;
      }
    }

    // 2) cached
    const cached = thumbCache[repoName];
    if (cached) {
      project.thumbnail = cached;
    }

    // 3) try repo root if still none
    if (!project.thumbnail) {
      const rootBest = await findRepoRootThumbnail(repoName);
      project.thumbnail = rootBest || opengraphFallback(repoName);
      thumbCache[repoName] = project.thumbnail;
    }

    // ✅ finalize preview vs animated
    if (isGifUrl(project.thumbnail)) {
      project.thumbAnimated = project.thumbnail;

      // try to find a non-gif companion in root (logo.png etc)
      const nonGif = await findRepoRootNonGifThumbnail(repoName);
      project.thumbPreview = nonGif || opengraphFallback(repoName);
    } else {
      project.thumbAnimated = null;
      project.thumbPreview = project.thumbnail || opengraphFallback(repoName);
    }
  });

  await Promise.all(promises);
  saveThumbCache();
  renderProjects();
}

async function findRepoRootThumbnail(repoName) {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repoName}/contents/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    const files = data.filter((item) => item.type === "file");
    const imageFiles = files.filter((item) => {
      const ext = (item.name.split(".").pop() || "").toLowerCase();
      return ["jpg", "jpeg", "png", "svg", "gif", "webp"].includes(ext);
    });

    if (!imageFiles.length) return null;

    const score = (name) => {
      const lower = name.toLowerCase();
      if (lower === "logo.gif") return 0;
      if (lower === "logo.png") return 1;
      if (lower === "logo.jpg" || lower === "logo.jpeg") return 2;
      if (lower === "logo.webp") return 3;
      if (lower === "logo.svg") return 4;
      if (lower.startsWith("logo.")) return 5;
      if (lower === "thumbnail.png" || lower === "thumb.png") return 6;
      if (lower === "preview.png") return 7;
      if (lower.includes("classdiagram")) return 20;
      if (lower.includes("diagram")) return 21;
      return 50;
    };

    imageFiles.sort((a, b) => score(a.name) - score(b.name));
    const chosen = imageFiles[0];

    const raw = `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/HEAD/${encodeURIComponent(chosen.name)}`;

    const isGif = (chosen.name || "").toLowerCase().endsWith(".gif");
    if (isGif) {
      const ok = await checkImageExists(raw, true);
      if (ok) return raw;

      const busted = withBust(raw);
      const ok2 = await checkImageExists(busted, true);
      if (ok2) return busted;

      // if gif fails, no root thumb
      return null;
    }

    const ok = await checkImageExists(raw, false);
    if (!ok) return null;
    return raw;
  } catch (err) {
    console.error("Failed to load root thumbnail for", repoName, err);
    return null;
  }
}

/* ✅ find best non-gif in root for preview */
async function findRepoRootNonGifThumbnail(repoName) {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repoName}/contents/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    const files = data.filter((item) => item.type === "file");
    const imageFiles = files.filter((item) => {
      const ext = (item.name.split(".").pop() || "").toLowerCase();
      return ["jpg", "jpeg", "png", "svg", "webp"].includes(ext);
    });
    if (!imageFiles.length) return null;

    const score = (name) => {
      const lower = name.toLowerCase();
      if (lower === "logo.png") return 0;
      if (lower === "logo.jpg" || lower === "logo.jpeg") return 1;
      if (lower === "logo.webp") return 2;
      if (lower === "logo.svg") return 3;
      if (lower.startsWith("logo.")) return 4;
      if (lower === "thumbnail.png" || lower === "thumb.png") return 5;
      if (lower === "preview.png") return 6;
      if (lower.includes("classdiagram")) return 20;
      if (lower.includes("diagram")) return 21;
      return 50;
    };

    imageFiles.sort((a, b) => score(a.name) - score(b.name));
    const chosen = imageFiles[0];

    const raw = `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/HEAD/${encodeURIComponent(chosen.name)}`;
    const ok = await checkImageExists(raw, false);
    if (!ok) return null;
    return raw;
  } catch (_) {
    return null;
  }
}

/* ---------- Pagination helpers ---------- */

function getTotalPages(total, size) {
  return Math.max(1, Math.ceil(total / size));
}

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function ensureProjectsPagerEl() {
  const view = document.getElementById("projectsView");
  if (!view) return null;

  let pager = document.getElementById("projectsPager");
  if (pager) return pager;

  pager = document.createElement("div");
  pager.id = "projectsPager";
  pager.className = "pager";

  view.appendChild(pager);
  return pager;
}

function renderProjectsPager(totalItems) {
  const pager = ensureProjectsPagerEl();
  if (!pager) return;

  const totalPages = getTotalPages(totalItems, PROJECTS_PAGE_SIZE);
  state.projectsPage = clamp(state.projectsPage, 1, totalPages);

  // hide pager if only 1 page
  if (totalPages <= 1) {
    pager.innerHTML = "";
    pager.style.display = "none";
    return;
  }
  pager.style.display = "";

  pager.innerHTML = "";

  const makeBtn = (label, disabled, onClick, extraClass = "") => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `pager-btn ${extraClass}`.trim();
    b.textContent = label;
    b.disabled = !!disabled;
    b.addEventListener("click", onClick);
    return b;
  };

  const prev = makeBtn("‹ Prev", state.projectsPage === 1, () => {
    state.projectsPage = clamp(state.projectsPage - 1, 1, totalPages);
    renderProjects();
    scrollProjectsGridIntoView();
  });

  const next = makeBtn("Next ›", state.projectsPage === totalPages, () => {
    state.projectsPage = clamp(state.projectsPage + 1, 1, totalPages);
    renderProjects();
    scrollProjectsGridIntoView();
  });

  pager.appendChild(prev);

  // page numbers (windowed)
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, state.projectsPage - half);
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  if (start > 1) {
    pager.appendChild(makeBtn("1", false, () => {
      state.projectsPage = 1;
      renderProjects();
      scrollProjectsGridIntoView();
    }, "pager-num"));
    if (start > 2) {
      const dots = document.createElement("span");
      dots.className = "pager-dots";
      dots.textContent = "…";
      pager.appendChild(dots);
    }
  }

  for (let p = start; p <= end; p++) {
    const isActive = p === state.projectsPage;
    const b = makeBtn(String(p), false, () => {
      state.projectsPage = p;
      renderProjects();
      scrollProjectsGridIntoView();
    }, `pager-num ${isActive ? "is-active" : ""}`.trim());
    pager.appendChild(b);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      const dots = document.createElement("span");
      dots.className = "pager-dots";
      dots.textContent = "…";
      pager.appendChild(dots);
    }
    pager.appendChild(makeBtn(String(totalPages), false, () => {
      state.projectsPage = totalPages;
      renderProjects();
      scrollProjectsGridIntoView();
    }, "pager-num"));
  }

  pager.appendChild(next);

  const info = document.createElement("div");
  info.className = "pager-info";
  info.textContent = `Page ${state.projectsPage} / ${totalPages}`;
  pager.appendChild(info);
}

function scrollProjectsGridIntoView() {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;
  const y = grid.getBoundingClientRect().top + window.scrollY - 130;
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

/* ---------- Project rendering + click-to-enlarge thumbnail ---------- */

function getFilteredProjects() {
  const search = state.search.toLowerCase();
  const typeFilter = state.typeFilter;
  const langFilter = state.languageFilter;

  return projects.filter((p) => {
    if (typeFilter !== "all" && p.type !== typeFilter) return false;

    if (
      langFilter !== "all" &&
      !(p.languages || []).some((l) => String(l).toLowerCase() === String(langFilter).toLowerCase())
    ) return false;

    if (!search) return true;

    const haystack = [
      p.displayName,
      p.description,
      (p.tags || []).join(" "),
      (p.languages || []).join(" ")
    ].join(" ").toLowerCase();

    return haystack.includes(search);
  });
}

function getPagedProjects(filtered) {
  const totalPages = getTotalPages(filtered.length, PROJECTS_PAGE_SIZE);
  state.projectsPage = clamp(state.projectsPage, 1, totalPages);

  const start = (state.projectsPage - 1) * PROJECTS_PAGE_SIZE;
  const end = start + PROJECTS_PAGE_SIZE;
  return filtered.slice(start, end);
}

function renderProjects() {
  const grid = document.getElementById("projectsGrid");
  const emptyState = document.getElementById("emptyState");
  if (!grid || !emptyState) return;

  const filtered = getFilteredProjects();
  const paged = getPagedProjects(filtered);

  grid.innerHTML = "";

  if (!filtered.length) {
    emptyState.style.display = "block";
    renderProjectsPager(0);
    return;
  }
  emptyState.style.display = "none";

  // ✅ pager for filtered set
  renderProjectsPager(filtered.length);

  paged.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const titleRow = document.createElement("div");
    titleRow.className = "project-title-row";

    const thumb = document.createElement("div");
    thumb.className = "project-thumb";

    // ✅ choose preview (never animated in grid)
    const gridThumb = project.thumbPreview || project.thumbnail;

    if (gridThumb) {
      thumb.classList.add("has-image");
      const img = document.createElement("img");
      img.src = gridThumb;
      img.alt = project.displayName;
      img.loading = "lazy";
      img.decoding = "async";

      // runtime fallback: bust once (helps flaky raw urls)
      img.addEventListener("error", () => {
        if (img.dataset.busted === "1") return;
        img.dataset.busted = "1";
        img.src = withBust(gridThumb);
      });

      thumb.appendChild(img);

      // subtle badge when original is a GIF
      if (project.thumbAnimated) {
        const badge = document.createElement("span");
        badge.className = "thumb-badge";
        badge.textContent = "GIF";
        thumb.appendChild(badge);
      }
    } else {
      const span = document.createElement("span");
      span.textContent = (project.displayName || "?").charAt(0).toUpperCase();
      thumb.appendChild(span);
    }

    const titleText = document.createElement("div");
    titleText.className = "project-title-text";

    const title = document.createElement("h3");
    title.className = "project-title";
    title.textContent = project.displayName;

    const langP = document.createElement("p");
    langP.className = "project-lang";
    langP.textContent = (project.languages || []).join(" · ");

    titleText.appendChild(title);
    titleText.appendChild(langP);

    titleRow.appendChild(thumb);
    titleRow.appendChild(titleText);

    const desc = document.createElement("p");
    desc.className = "project-desc";
    desc.textContent = project.description;

    const meta = document.createElement("div");
    meta.className = "project-meta";
    (project.tags || []).forEach((tag) => {
      const tagBadge = document.createElement("span");
      tagBadge.className = "badge";
      tagBadge.textContent = tag;
      meta.appendChild(tagBadge);
    });

    const actions = document.createElement("div");
    actions.className = "project-actions";

    const githubBtn = document.createElement("a");
    githubBtn.href = project.githubUrl;
    githubBtn.target = "_blank";
    githubBtn.rel = "noopener noreferrer";
    githubBtn.className = "btn-card";
    githubBtn.innerHTML = `<span>View code</span>`;
    actions.appendChild(githubBtn);

    if (project.liveUrl) {
      const liveBtn = document.createElement("a");
      liveBtn.href = project.liveUrl;
      liveBtn.target = "_blank";
      liveBtn.rel = "noopener noreferrer";
      liveBtn.className = "btn-card btn-card-live";
      liveBtn.innerHTML = `<span>Open live website</span>`;
      actions.appendChild(liveBtn);
    }

    // ✅ click card -> modal with REAL thumbnail (gif only plays here)
    card.addEventListener("click", (e) => {
      if (e.target.closest("a, button, .project-actions")) return;

      const modalSrc = project.thumbAnimated || project.thumbnail || project.thumbPreview;
      if (!modalSrc) return;
      openImageModal(modalSrc, project.displayName);
    });

    thumb.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const modalSrc = project.thumbAnimated || project.thumbnail || project.thumbPreview;
      if (!modalSrc) return;
      openImageModal(modalSrc, project.displayName);
    });

    card.appendChild(titleRow);
    card.appendChild(desc);
    if (project.tags && project.tags.length) card.appendChild(meta);
    card.appendChild(actions);
    grid.appendChild(card);
  });

  applyDescriptionClampMarkers();
}

/* ---------- Media loading & rendering ---------- */

async function loadMedia() {
  try {
    const res = await fetch(MEDIA_INDEX_URL);
    if (!res.ok) {
      mediaItems = [];
      renderMedia();
      return;
    }

    const data = await res.json();
    const items = Array.isArray(data) ? data : data.items || [];

    mediaItems = items.map((item, index) => {
      let path = item.path || item.url || item.src || "";

      if (!path) {
        const fileName = item.fileName || item.name || item.title || "";
        if (fileName) {
          const lowerType = (item.type || "").toLowerCase();
          if (lowerType === "image") path = `media/images/${fileName}`;
          else if (lowerType === "video") path = `media/videos/${fileName}`;
          else if (lowerType === "audio") path = `media/audio/${fileName}`;
          else path = `media/${fileName}`;
        }
      }

      const title =
        item.title ||
        item.name ||
        item.fileName ||
        (path ? path.split("/").pop() : "") ||
        `Media ${index + 1}`;

      let type = item.type;
      if (!type) type = guessMediaType(path);

      return { id: index, title, path, type };
    });

    renderMedia();
  } catch (err) {
    console.error("Failed to load media index", err);
    mediaItems = [];
    renderMedia();
  }
}

function guessMediaType(path) {
  const ext = (path.split(".").pop() || "").toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "image";
  if (["mp4", "webm", "mov", "m4v"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "flac"].includes(ext)) return "audio";
  return "image";
}

function getFilteredMedia() {
  const search = state.search.toLowerCase();
  const typeFilter = state.mediaTypeFilter;

  return mediaItems.filter((item) => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (!search) return true;
    const haystack = (item.title + " " + item.path).toLowerCase();
    return haystack.includes(search);
  });
}

function createVolumeRow(mediaEl) {
  const row = document.createElement("div");
  row.className = "media-volume-row";

  const label = document.createElement("span");
  label.className = "media-volume-label";
  label.textContent = "Volume";

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.value = "100";
  slider.className = "media-volume-slider";

  const valueLabel = document.createElement("span");
  valueLabel.className = "media-volume-value";
  valueLabel.textContent = "100%";

  mediaEl.volume = 1;

  slider.addEventListener("input", () => {
    const value = parseInt(slider.value, 10) || 0;
    mediaEl.volume = value / 100;
    valueLabel.textContent = `${value}%`;
  });

  row.appendChild(label);
  row.appendChild(slider);
  row.appendChild(valueLabel);
  return row;
}

function renderMedia() {
  const grid = document.getElementById("mediaGrid");
  const emptyState = document.getElementById("mediaEmptyState");
  if (!grid || !emptyState) return;

  const filtered = getFilteredMedia();

  grid.innerHTML = "";
  if (!filtered.length) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "media-card";

    const title = document.createElement("h3");
    title.className = "media-title";
    title.textContent = item.title;

    const preview = document.createElement("div");
    preview.className = "media-preview";

    if (item.type === "image") {
      preview.classList.add("clickable");
      const img = document.createElement("img");
      img.src = item.path;
      img.alt = item.title;
      img.loading = "lazy";
      img.decoding = "async";
      preview.appendChild(img);
      preview.addEventListener("click", () => openImageModal(item.path, item.title));
    } else if (item.type === "video") {
      preview.classList.add("media-preview-video");

      const video = document.createElement("video");
      video.src = item.path;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";

      video.addEventListener("play", () => {
        document.querySelectorAll("video").forEach((v) => {
          if (v !== video) v.pause();
        });
      });

      const wrapper = document.createElement("div");
      wrapper.className = "media-player-wrapper";
      wrapper.appendChild(video);
      preview.appendChild(wrapper);

      preview.appendChild(createVolumeRow(video));

      const loopBtn = document.createElement("button");
      loopBtn.type = "button";
      loopBtn.className = "media-action-btn media-loop-btn";
      loopBtn.textContent = "🔁 Loop";
      loopBtn.title = "Toggle loop";
      loopBtn.addEventListener("click", () => {
        video.loop = !video.loop;
        loopBtn.classList.toggle("is-active", video.loop);
      });

      const actions = document.createElement("div");
      actions.className = "media-actions";

      const openBtn = document.createElement("a");
      openBtn.href = item.path;
      openBtn.target = "_blank";
      openBtn.rel = "noopener noreferrer";
      openBtn.className = "media-action-btn";
      openBtn.textContent = "Open";

      const downloadBtn = document.createElement("a");
      downloadBtn.href = item.path;
      downloadBtn.download = "";
      downloadBtn.className = "media-action-btn";
      downloadBtn.textContent = "Download";

      actions.appendChild(openBtn);
      actions.appendChild(downloadBtn);
      actions.appendChild(loopBtn);

      card.appendChild(title);
      card.appendChild(preview);
      card.appendChild(actions);
      grid.appendChild(card);
      return;
    } else if (item.type === "audio") {
      const audio = document.createElement("audio");
      audio.src = item.path;
      audio.controls = true;
      audio.preload = "metadata";

      const wrapper = document.createElement("div");
      wrapper.className = "media-player-wrapper";
      wrapper.appendChild(audio);
      preview.appendChild(wrapper);

      preview.appendChild(createVolumeRow(audio));
    }

    const actions = document.createElement("div");
    actions.className = "media-actions";

    if (item.type === "image") {
      const viewBtn = document.createElement("button");
      viewBtn.type = "button";
      viewBtn.className = "media-action-btn";
      viewBtn.textContent = "View";
      viewBtn.addEventListener("click", () => openImageModal(item.path, item.title));
      actions.appendChild(viewBtn);
    } else {
      const openBtn = document.createElement("a");
      openBtn.href = item.path;
      openBtn.target = "_blank";
      openBtn.rel = "noopener noreferrer";
      openBtn.className = "media-action-btn";
      openBtn.textContent = "Open";
      actions.appendChild(openBtn);
    }

    const downloadBtn = document.createElement("a");
    downloadBtn.href = item.path;
    downloadBtn.download = "";
    downloadBtn.className = "media-action-btn";
    downloadBtn.textContent = "Download";
    actions.appendChild(downloadBtn);

    card.appendChild(title);
    card.appendChild(preview);
    card.appendChild(actions);
    grid.appendChild(card);
  });
}

/* ---------- Image modal (used by media + project thumbs) ---------- */

function setupImageModal() {
  const modal = document.getElementById("imageModal");
  if (!modal) return;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeImageModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeImageModal();
  });
}

function openImageModal(src, captionText) {
  const modal = document.getElementById("imageModal");
  if (!modal) return;

  modal.innerHTML = "";

  const inner = document.createElement("div");
  inner.className = "image-modal-inner";

  const figure = document.createElement("figure");
  figure.className = "image-modal-figure";

  const img = document.createElement("img");
  img.className = "image-modal-img";
  img.src = src;
  img.alt = captionText || "";
  img.loading = "eager";
  img.decoding = "async";
  img.addEventListener("click", closeImageModal);

  figure.appendChild(img);
  inner.appendChild(figure);

  const actions = document.createElement("div");
  actions.className = "image-modal-actions";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "image-modal-btn image-modal-close";
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", closeImageModal);

  actions.appendChild(closeBtn);
  inner.appendChild(actions);

  modal.appendChild(inner);
  modal.hidden = false;
}

function closeImageModal() {
  const modal = document.getElementById("imageModal");
  if (!modal) return;
  modal.hidden = true;
}

/* ---------- Footer ---------- */

function setupFooterCopyright() {
  const el = document.getElementById("footerCopyright");
  if (!el) return;
  el.textContent = `${new Date().getFullYear()}`;
}

/* ---------- Playground random button ---------- */

function setupPlaygroundRandomButton() {
  const btn = document.getElementById("randomSiteButton");
  if (!btn) return;

  btn.classList.add("btn-card", "btn-card-live");

  btn.addEventListener("click", () => {
    if (!USELESS_WEB_URLS.length) return;
    const idx = Math.floor(Math.random() * USELESS_WEB_URLS.length);
    const url = USELESS_WEB_URLS[idx];
    window.open(url, "_blank", "noopener,noreferrer");
  });
}

/* ---------- Paint toolbar + shortcuts (ONLY CLEAR + confirm) ---------- */

function setupPaintToolbar() {
  const paintCard = document.querySelector(".playground-paint");
  if (!paintCard) return;

  paintIframe = paintCard.querySelector("iframe[src*='paint.js.org']");

  const buttons = paintCard.querySelectorAll("[data-paint-action]");
  buttons.forEach((btn) => {
    const action = btn.getAttribute("data-paint-action");
    if (action !== "clear") {
      btn.remove();
    } else {
      btn.addEventListener("click", () => handlePaintAction("clear"));
    }
  });

  document.addEventListener("keydown", handlePaintShortcuts);
}

function handlePaintAction(action) {
  if (!paintIframe) return;

  if (action === "clear") {
    const ok = window.confirm("Clear the canvas? This will reset the Paint app.");
    if (!ok) return;
    reloadPaintIframe();
  }
}

function reloadPaintIframe() {
  if (!paintIframe) return;
  const src = paintIframe.src;
  paintIframe.src = src;
}

function handlePaintShortcuts(event) {
  if (state.activeTab !== "playground") return;

  const target = event.target;
  const tag = (target?.tagName || "").toLowerCase();
  const isTyping = tag === "input" || tag === "textarea" || target?.isContentEditable;
  if (isTyping) return;

  const key = event.key.toLowerCase();
  const ctrl = event.ctrlKey || event.metaKey;
  const shift = event.shiftKey;

  if (!ctrl) return;

  if (key === "n" && shift) {
    event.preventDefault();
    handlePaintAction("clear");
  }
}

/* ---------- END ---------- */
