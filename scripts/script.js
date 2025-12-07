// scripts/script.js

/* ---------- Config ---------- */

const GITHUB_USER = "ferrannl";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
const PROJECTS_URL = "./projects.json";
const MEDIA_INDEX_URL = "./media-index.json";

const CACHE_KEY = "ferranProjectsCacheV2";
const RATE_LIMIT_KEY = "ferranProjectsRateLimitV2";
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes
const RATE_LIMIT_BACKOFF_MS = 1000 * 60 * 60; // 1 hour

const SUPPORTED_LANGS = ["nl", "en", "de", "pl", "tr", "es"];
const DEFAULT_LANG = "nl";
const LANG_STORAGE_KEY = "ferranProjectsLang";
const LANG_GATE_SEEN_KEY = "ferranProjectsLangSeenGate";

// Thumbnail cache key (bumped to V2 so old logo.jpg entries are dropped)
const THUMB_CACHE_KEY = "ferranProjectsThumbsV2";

/* ---------- State ---------- */

let repos = [];
let projects = [];
let mediaItems = [];
let thumbCache = loadThumbCache();

const state = {
  activeTab: "projects",
  search: "",
  typeFilter: "all",
  languageFilter: "all",
  mediaTypeFilter: "all",
  mediaFormatFilter: "all",
  lang: DEFAULT_LANG
};

/* Small words not capitalized in titles (except first word) */
const SMALL_WORDS = [
  "voor", "na", "met", "door", "en", "of",
  "und", "mit", "von",
  "the", "and", "of"
];

/* ---------- i18n dictionary ---------- */

const I18N = {
  nl: {
    subtitle:
      "Al mijn programmeer- en codeprojecten op één plek – websites, apps, schoolopdrachten, guides, API’s en meer.",
    aboutTitle: "Over mij",
    aboutP1:
      "Hey 👋🏻 Ferran hier. Ik ben een Nederlandse 🇳🇱 developer uit Utrecht / ’s-Hertogenbosch. Ik bouw graag websites, apps en kleine tools om mezelf en anderen te helpen.",
    aboutP2: "",
    tabProjects: "Projecten",
    tabMedia: "Media",
    searchLabel: "Zoeken",
    filterTypeLabel: "Type",
    typeAll: "Alles",
    typeWebsite: "Websites",
    typeMobile: "Mobiel",
    typeApi: "API’s / Backend",
    typeSchool: "School / Studie",
    typeGame: "Game",
    typeOther: "Overig",
    filterLanguageLabel: "Taal",
    languageFilterAll: "Alle talen",
    mediaTypeLabel: "Media type",
    mediaKindAll: "Alles",
    mediaKindImages: "Afbeeldingen",
    mediaKindVideos: "Video’s",
    mediaKindAudio: "Audio",
    mediaFormatLabel: "Bestandstype",
    mediaFormatAll: "Alle formaten",
    emptyState:
      "Geen projecten gevonden met deze zoekopdracht of filters. Probeer iets anders.",
    mediaEmptyState: "Geen media gevonden met deze zoekopdracht of filters.",
    headerLangButton: "Taal",
    footerBuilt: "Gemaakt met ♥ door Ferran",
    btnLiveSite: "Live site"
  },
  en: {
    subtitle:
      "All my programming and coding projects in one place – websites, apps, school projects, guides, APIs and more.",
    aboutTitle: "About me",
    aboutP1:
      "Hey 👋🏻 Ferran here. I’m a Dutch 🇳🇱 developer from Utrecht / ’s-Hertogenbosch. I like building websites, apps and small tools to help myself and others.",
    aboutP2: "",
    tabProjects: "Projects",
    tabMedia: "Media",
    searchLabel: "Search",
    filterTypeLabel: "Type",
    typeAll: "All",
    typeWebsite: "Websites",
    typeMobile: "Mobile",
    typeApi: "APIs / Backend",
    typeSchool: "School / Study",
    typeGame: "Game",
    typeOther: "Other",
    filterLanguageLabel: "Language",
    languageFilterAll: "All languages",
    mediaTypeLabel: "Media type",
    mediaKindAll: "All",
    mediaKindImages: "Images",
    mediaKindVideos: "Videos",
    mediaKindAudio: "Audio",
    mediaFormatLabel: "File type",
    mediaFormatAll: "All types",
    emptyState: "No projects found with these filters. Try something else.",
    mediaEmptyState: "No media found with these filters.",
    headerLangButton: "Language",
    footerBuilt: "Built with ♥ by Ferran",
    btnLiveSite: "Live site"
  },
  de: {
    subtitle:
      "Alle meine Programmier- und Coding-Projekte an einem Ort – Websites, Apps, Schulprojekte, Guides, APIs und mehr.",
    aboutTitle: "Über mich",
    aboutP1:
      "Hey 👋🏻 hier ist Ferran. Ich bin ein niederländischer 🇳🇱 Entwickler aus Utrecht / ’s-Hertogenbosch und baue gern Websites, Apps und kleine Tools, um mir und anderen zu helfen.",
    aboutP2: "",
    tabProjects: "Projekte",
    tabMedia: "Medien",
    searchLabel: "Suchen",
    filterTypeLabel: "Typ",
    typeAll: "Alle",
    typeWebsite: "Websites",
    typeMobile: "Mobile",
    typeApi: "APIs / Backend",
    typeSchool: "Schule / Studium",
    typeGame: "Game",
    typeOther: "Sonstiges",
    filterLanguageLabel: "Sprache",
    languageFilterAll: "Alle Sprachen",
    mediaTypeLabel: "Medientyp",
    mediaKindAll: "Alle",
    mediaKindImages: "Bilder",
    mediaKindVideos: "Video’s",
    mediaKindAudio: "Audio",
    mediaFormatLabel: "Dateityp",
    mediaFormatAll: "Alle Formate",
    emptyState:
      "Keine Projekte mit dieser Suche oder diesen Filtern gefunden. Probier etwas anderes.",
    mediaEmptyState:
      "Keine Medien mit dieser Suche oder diesen Filtern gefunden.",
    headerLangButton: "Sprache",
    footerBuilt: "Erstellt mit ♥ von Ferran",
    btnLiveSite: "Live-Seite"
  },
  pl: {
    subtitle:
      "Wszystkie moje projekty programistyczne w jednym miejscu – strony WWW, aplikacje, projekty szkolne, poradniki, API i więcej.",
    aboutTitle: "O mnie",
    aboutP1:
      "Cześć 👋🏻 tu Ferran. Jestem holenderskim 🇳🇱 developerem z Utrechtu / ’s-Hertogenbosch. Lubię tworzyć strony WWW, aplikacje i małe narzędzia pomagające mnie i innym.",
    aboutP2: "",
    tabProjects: "Projekty",
    tabMedia: "Media",
    searchLabel: "Szukaj",
    filterTypeLabel: "Typ",
    typeAll: "Wszystko",
    typeWebsite: "Strony WWW",
    typeMobile: "Mobilne",
    typeApi: "API / Backend",
    typeSchool: "Szkoła / Studia",
    typeGame: "Gra",
    typeOther: "Inne",
    filterLanguageLabel: "Język",
    languageFilterAll: "Wszystkie języki",
    mediaTypeLabel: "Typ medium",
    mediaKindAll: "Wszystko",
    mediaKindImages: "Obrazy",
    mediaKindVideos: "Wideo",
    mediaKindAudio: "Audio",
    mediaFormatLabel: "Typ pliku",
    mediaFormatAll: "Wszystkie formaty",
    emptyState:
      "Nie znaleziono projektów dla tych filtrów. Spróbuj czegoś innego.",
    mediaEmptyState: "Nie znaleziono mediów dla tych filtrów.",
    headerLangButton: "Język",
    footerBuilt: "Stworzone z ♥ przez Ferrana",
    btnLiveSite: "Strona live"
  },
  tr: {
    subtitle:
      "Tüm programlama projelerim tek bir yerde – web siteleri, uygulamalar, okul projeleri, rehberler, API’ler ve daha fazlası.",
    aboutTitle: "Hakkımda",
    aboutP1:
      "Selam 👋🏻 ben Ferran. Utrecht / ’s-Hertogenbosch’ta yaşayan Hollandalı 🇳🇱 bir developer’ım. Kendime ve başkalarına yardımcı olmak için web siteleri, uygulamalar ve küçük araçlar geliştirmeyi seviyorum.",
    aboutP2: "",
    tabProjects: "Projeler",
    tabMedia: "Medya",
    searchLabel: "Ara",
    filterTypeLabel: "Tür",
    typeAll: "Hepsi",
    typeWebsite: "Web siteleri",
    typeMobile: "Mobil",
    typeApi: "API’ler / Backend",
    typeSchool: "Okul / Çalışma",
    typeGame: "Oyun",
    typeOther: "Diğer",
    filterLanguageLabel: "Dil",
    languageFilterAll: "Tüm diller",
    mediaTypeLabel: "Medya türü",
    mediaKindAll: "Hepsi",
    mediaKindImages: "Görseller",
    mediaKindVideos: "Videolar",
    mediaKindAudio: "Ses",
    mediaFormatLabel: "Dosya türü",
    mediaFormatAll: "Tüm türler",
    emptyState:
      "Bu arama veya filtrelerle proje bulunamadı. Başka bir şey dene.",
    mediaEmptyState:
      "Bu arama veya filtrelerle medya bulunamadı.",
    headerLangButton: "Dil",
    footerBuilt: "♥ ile geliştirildi – Ferran",
    btnLiveSite: "Canlı site"
  },
  es: {
    subtitle:
      "Todos mis proyectos de programación en un solo lugar – webs, apps, trabajos de clase, guías, APIs y más.",
    aboutTitle: "Sobre mí",
    aboutP1:
      "Hola 👋🏻 soy Ferran. Soy un desarrollador 🇳🇱 de Utrecht / ’s-Hertogenbosch. Me gusta crear webs, apps y pequeñas herramientas para ayudarme a mí y a otras personas.",
    aboutP2: "",
    tabProjects: "Proyectos",
    tabMedia: "Media",
    searchLabel: "Buscar",
    filterTypeLabel: "Tipo",
    typeAll: "Todo",
    typeWebsite: "Webs",
    typeMobile: "Móvil",
    typeApi: "APIs / Backend",
    typeSchool: "Escuela / Estudio",
    typeGame: "Juego",
    typeOther: "Otros",
    filterLanguageLabel: "Idioma",
    languageFilterAll: "Todos los idiomas",
    mediaTypeLabel: "Tipo de media",
    mediaKindAll: "Todo",
    mediaKindImages: "Imágenes",
    mediaKindVideos: "Vídeos",
    mediaKindAudio: "Audio",
    mediaFormatLabel: "Tipo de archivo",
    mediaFormatAll: "Todos los tipos",
    emptyState:
      "No se encontraron proyectos con estos filtros. Prueba otra cosa.",
    mediaEmptyState:
      "No se encontró media con estos filtros.",
    headerLangButton: "Idioma",
    footerBuilt: "Hecho con ♥ por Ferran",
    btnLiveSite: "Sitio live"
  }
};

/* Type labels for the type-badge, by language */
const TYPE_LABELS = {
  website: {
    nl: "Website",
    en: "Website",
    de: "Website",
    pl: "Strona WWW",
    tr: "Web sitesi",
    es: "Sitio web"
  },
  mobile: {
    nl: "Mobiel",
    en: "Mobile",
    de: "Mobile",
    pl: "Mobilne",
    tr: "Mobil",
    es: "Móvil"
  },
  api: {
    nl: "API / Backend",
    en: "API / Backend",
    de: "API / Backend",
    pl: "API / Backend",
    tr: "API / Backend",
    es: "API / Backend"
  },
  school: {
    nl: "School / Studie",
    en: "School / Study",
    de: "Schule / Studium",
    pl: "Szkoła / Studia",
    tr: "Okul / Çalışma",
    es: "Escuela / Estudio"
  },
  game: {
    nl: "Game",
    en: "Game",
    de: "Game",
    pl: "Gra",
    tr: "Oyun",
    es: "Juego"
  },
  other: {
    nl: "Overig",
    en: "Other",
    de: "Sonstiges",
    pl: "Inne",
    tr: "Diğer",
    es: "Otros"
  }
};

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("js-enabled");

  setupLanguage();
  setupTabsAndFilters();
  setupSearch();
  setupImageModal();
  setupFooterCopyright();

  loadProjects();
  loadMedia();
});

/* ---------- Language / gate ---------- */

function setupLanguage() {
  const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
  const gateSeen = localStorage.getItem(LANG_GATE_SEEN_KEY) === "1";

  const initialLang = SUPPORTED_LANGS.includes(savedLang)
    ? savedLang
    : DEFAULT_LANG;
  state.lang = initialLang;

  const gate = document.getElementById("langGate");
  if (gate) {
    if (gateSeen) {
      gate.hidden = true;
    }

    gate.addEventListener("click", (event) => {
      const btn = event.target.closest(".btn-lang");
      if (!btn) return;
      const langCode = btn.dataset.lang;
      if (!SUPPORTED_LANGS.includes(langCode)) return;
      setLanguage(langCode);
      localStorage.setItem(LANG_GATE_SEEN_KEY, "1");
      gate.hidden = true;
    });
  }

  const headerLangButton = document.getElementById("headerLangButton");
  if (headerLangButton) {
    headerLangButton.addEventListener("click", () => {
      if (!gate) return;
      gate.hidden = false;
      updateLanguageGateActive();
    });
  }

  setLanguage(initialLang);
  updateLanguageGateActive();
}

function setLanguage(lang) {
  state.lang = lang;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (_) {}

  const dict = I18N[lang] || I18N[DEFAULT_LANG] || {};

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = dict[key];
    if (typeof value === "string") {
      el.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-footer-built]").forEach((el) => {
    const key = "footerBuilt";
    const value = dict[key];
    if (typeof value === "string") {
      el.textContent = value;
    }
  });

  const searchLabelEl = document.querySelector("[data-i18n='searchLabel']");
  if (searchLabelEl && dict.searchLabel) {
    searchLabelEl.textContent = dict.searchLabel;
  }

  // (Optional) translate search placeholder a bit
  const searchInput = document.getElementById("search");
  if (searchInput) {
    if (lang === "nl") {
      searchInput.placeholder =
        "Zoek op naam, beschrijving, programmeertaal of tag…";
    } else if (lang === "de") {
      searchInput.placeholder =
        "Suche nach Name, Beschreibung, Sprache oder Tag…";
    } else if (lang === "pl") {
      searchInput.placeholder =
        "Szukaj po nazwie, opisie, języku lub tagu…";
    } else if (lang === "tr") {
      searchInput.placeholder =
        "Ada, açıklamaya, dile veya etikete göre ara…";
    } else if (lang === "es") {
      searchInput.placeholder =
        "Busca por nombre, descripción, lenguaje o etiqueta…";
    } else {
      searchInput.placeholder =
        "Search by name, description, language or tag…";
    }
  }

  updateLanguageGateActive();
  renderProjects(); // refresh type badge labels etc.
}

function updateLanguageGateActive() {
  const buttons = document.querySelectorAll(".btn-lang");
  buttons.forEach((btn) => {
    const code = btn.dataset.lang;
    if (code === state.lang) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

/* ---------- Tabs & filters visibility ---------- */

function setupTabsAndFilters() {
  const projectsTab = document.getElementById("projectsTab");
  const mediaTab = document.getElementById("mediaTab");
  const projectsView = document.getElementById("projectsView");
  const mediaView = document.getElementById("mediaView");
  const projectFilters = document.getElementById("projectFilters");
  const mediaFilters = document.getElementById("mediaFilters");

  if (!projectsTab || !mediaTab || !projectsView || !mediaView) return;

  function showProjects() {
    state.activeTab = "projects";
    projectsTab.classList.add("active");
    mediaTab.classList.remove("active");
    projectsView.style.display = "";
    mediaView.style.display = "none";
    if (projectFilters) projectFilters.hidden = false;
    if (mediaFilters) mediaFilters.hidden = true;

    const tabs = document.querySelector(".tabs");
    if (tabs) tabs.classList.remove("tabs-media");

    renderProjects();
  }

  function showMedia() {
    state.activeTab = "media";
    mediaTab.classList.add("active");
    projectsTab.classList.remove("active");
    mediaView.style.display = "";
    projectsView.style.display = "none";
    if (projectFilters) projectFilters.hidden = true;
    if (mediaFilters) mediaFilters.hidden = false;

    const tabs = document.querySelector(".tabs");
    if (tabs) tabs.classList.add("tabs-media");

    renderMedia();
  }

  projectsTab.addEventListener("click", showProjects);
  mediaTab.addEventListener("click", showMedia);

  // Default: projects
  showProjects();

  // Filter listeners
  const typeFilter = document.getElementById("typeFilter");
  const languageFilter = document.getElementById("languageFilter");
  const mediaTypeFilter = document.getElementById("mediaTypeFilter");
  const mediaFormatFilter = document.getElementById("mediaFormatFilter");

  if (typeFilter) {
    typeFilter.addEventListener("change", () => {
      state.typeFilter = typeFilter.value;
      renderProjects();
    });
  }

  if (languageFilter) {
    languageFilter.addEventListener("change", () => {
      state.languageFilter = languageFilter.value;
      renderProjects();
    });
  }

  if (mediaTypeFilter) {
    mediaTypeFilter.addEventListener("change", () => {
      state.mediaTypeFilter = mediaTypeFilter.value;
      renderMedia();
    });
  }

  if (mediaFormatFilter) {
    mediaFormatFilter.addEventListener("change", () => {
      state.mediaFormatFilter = mediaFormatFilter.value;
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
      renderProjects();
    } else {
      renderMedia();
    }
  });
}

/* ---------- GitHub + projects.json loading ---------- */

async function loadProjects() {
  const overrides = await loadProjectOverrides();
  const apiRepos = await loadGitHubReposWithCache();

  const overridesByName = {};
  overrides.forEach((o) => {
    if (o && o.name) {
      overridesByName[o.name.toLowerCase()] = o;
    }
  });

  // Hidden repos: Projects (self), Munchkin, PSO WiiU guide
  repos = apiRepos.filter((repo) => {
    if (repo.archived || repo.fork) return false;
    const name = (repo.name || "").toLowerCase();
    if (name === "projects") return false;
    if (name.includes("munchkin")) return false;
    if (name.includes("pso") && name.includes("wiiu")) return false;
    return true;
  });

  projects = repos.map((repo) => {
    const o = overridesByName[repo.name.toLowerCase()] || {};

    const displayName = formatRepoName(o.displayName || repo.name || "");
    const description =
      o.description || repo.description || "No description yet.";

    const overrideLangs = Array.isArray(o.languages)
      ? o.languages
      : o.langs;
    const languages = getLanguagesList(repo.language, overrideLangs);

    const type = guessProjectType(repo, o);

    const tags = Array.isArray(o.tags) ? [...o.tags] : [];

    // Auto-tag security-related C#/.NET multi-project as "Security"
    if (isSecurityProject(repo, o, languages) && !tags.includes("Security")) {
      tags.push("Security");
    }

    const liveUrl = computeLiveUrl(repo, o);

    const thumbnail = computeThumbnail(repo, o);

    return {
      id: repo.id,
      name: repo.name,
      displayName,
      description,
      languages,
      primaryLanguage: repo.language,
      type,
      tags,
      liveUrl,
      githubUrl: repo.html_url,
      thumbnail
    };
  });

  sortProjectsByLive();
  buildLanguageFilterOptions(projects);
  renderProjects();

  // verify that live URLs really work (no 404 / Laravel-only repos)
  verifyLiveSites();

  // load proper thumbnails from repo root images
  loadProjectThumbnails();
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

async function loadGitHubReposWithCache() {
  const now = Date.now();

  // respect rate limit backoff
  try {
    const rateRaw = localStorage.getItem(RATE_LIMIT_KEY);
    if (rateRaw) {
      const rate = JSON.parse(rateRaw);
      if (rate && now - rate.timestamp < RATE_LIMIT_BACKOFF_MS) {
        const cached = readReposFromCache();
        if (cached) return cached;
        return [];
      }
    }
  } catch (_) {}

  // try cache first
  const cached = readReposFromCache();
  if (cached) {
    // also try to refresh, but even if it fails we still have cached
    refreshReposInBackground();
    return cached;
  }

  // no cache? fetch now
  return fetchReposFromGitHub();
}

function readReposFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.repos)) return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed.repos;
  } catch (_) {
    return null;
  }
}

function saveReposToCache(repos) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        repos
      })
    );
  } catch (_) {}
}

function setRateLimited() {
  try {
    localStorage.setItem(
      RATE_LIMIT_KEY,
      JSON.stringify({ timestamp: Date.now() })
    );
  } catch (_) {}
}

function refreshReposInBackground() {
  fetchReposFromGitHub().catch(() => {});
}

async function fetchReposFromGitHub() {
  try {
    const res = await fetch(API_URL);
    if (res.status === 403) {
      setRateLimited();
      const cached = readReposFromCache();
      return cached || [];
    }
    if (!res.ok) throw new Error("GitHub error");
    const data = await res.json();
    saveReposToCache(data);
    return data;
  } catch (err) {
    console.error("GitHub fetch failed", err);
    const cached = readReposFromCache();
    return cached || [];
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
      if (lw === "asp.net") return "ASP.NET";

      if (SMALL_WORDS.includes(lw) && index !== 0) {
        return lw;
      }

      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function getLanguagesList(primary, overrideList) {
  // If you explicitly set languages in projects.json, always trust that
  if (Array.isArray(overrideList) && overrideList.length) {
    return overrideList;
  }

  const list = [];
  if (!primary) return list;

  const p = String(primary).toLowerCase();

  if (p === "html") {
    list.push("HTML", "CSS", "JS");
  } else if (p === "javascript") {
    list.push("JS", "HTML", "CSS");
  } else if (p === "typescript") {
    list.push("TypeScript", "JS", "HTML", "CSS");
  } else if (p === "c#") {
    list.push("C#", ".NET");
  } else if (p === "c++") {
    list.push("C++", "C");
  } else if (p === "php") {
    list.push("PHP", "HTML", "CSS", "JS");
  } else if (p === "css") {
    // Pure CSS project – usually still has HTML + JS around it
    list.push("CSS", "HTML", "JS");
  } else if (p === "less") {
    // Your case: site written in Less plus other front-end bits
    list.push("Less", "HTML", "CSS", "JS", "SCSS");
  } else if (p === "scss" || p === "sass") {
    list.push("SCSS", "CSS", "HTML", "JS");
  } else {
    // Fallback: just show whatever GitHub says
    list.push(primary);
  }

  return list;
}

function buildLanguageFilterOptions(projects) {
  const select = document.getElementById("languageFilter");
  if (!select) return;

  // keep first option, remove the rest
  while (select.options.length > 1) {
    select.remove(1);
  }

  const set = new Set();
  projects.forEach((p) => {
    (p.languages || []).forEach((lang) => set.add(lang));
  });

  const sorted = Array.from(set).sort((a, b) =>
    a.localeCompare(b, "en")
  );

  sorted.forEach((lang) => {
    const opt = document.createElement("option");
    opt.value = lang;
    opt.textContent = lang;
    select.appendChild(opt);
  });
}

/* ---------- Project helpers: type, security tag, liveUrl, thumbnail ---------- */

function isSecurityProject(repo, override, languages) {
  // If you explicitly tagged it in projects.json, respect that
  if (override && Array.isArray(override.tags) && override.tags.includes("Security")) {
    return true;
  }

  const text = `${repo.name || ""} ${repo.description || ""}`.toLowerCase();
  const securityWords = [
    "security",
    "auth",
    "authentication",
    "authorization",
    "oauth",
    "jwt",
    "token",
    "password",
    "passwort",
    "wachtwoord",
    "hash",
    "encrypt",
    "encryption",
    "crypt",
    "crypto",
    "2fa",
    "mfa"
  ];

  const hasSecurityWord = securityWords.some((w) => text.includes(w));

  const hasDotNet =
    (languages || []).some((l) => l.toLowerCase().includes(".net")) ||
    (repo.language || "").toLowerCase() === "c#";

  return hasDotNet && hasSecurityWord;
}

function guessProjectType(repo, override) {
  if (override && override.type) {
    return override.type;
  }

  const name = (repo.name || "").toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const joined = `${name} ${desc}`;
  const lang = (repo.language || "").toLowerCase();

  const has = (words) => words.some((w) => joined.includes(w));

  // Manual boosts for your specific repos without touching projects.json:
  // - Java Kolonisten van Katan game
  // - Dimitri C/C++ game
  if (
    name.includes("kolonisten") ||
    name.includes("katan") ||
    name.includes("catan")
  ) {
    return "game";
  }
  if (name.includes("dimitri")) {
    return "game";
  }

  // GAME: explicit game-ish hints first
  const isGame = has([
    "game",
    "games",
    "spel",
    "sudoku",
    "unity",
    "platformer",
    "puzzle",
    "rpg",
    "jigsaw"
  ]);

  // API / Backend
  const isApi = has([
    "api",
    "backend",
    "server",
    "service",
    "rest",
    "endpoint"
  ]);

  // Mobile: only treat as mobile if it REALLY looks mobile – not just "app"
  const isMobile =
    has([
      "android",
      "ios",
      "xamarin",
      "apk",
      "play store",
      "playstore",
      "xcode",
      "swiftui",
      "react native",
      "react-native",
      "flutter"
    ]) ||
    (["kotlin", "swift", "objective-c", "objective c", "dart"].includes(
      lang
    ) &&
      has(["android", "ios", "mobile"]));

  // School / study
  const isSchool = has([
    "school",
    "study",
    "studie",
    "uni",
    "university",
    "hogeschool",
    "opdracht",
    "assignment",
    "project for school",
    "school project"
  ]);

  // Website: PHP/Laravel/WordPress/etc are strongly considered "website"
  const isWebsite =
    lang === "html" ||
    lang === "php" ||
    lang === "vue" ||
    lang === "asp.net" ||
    has([
      "website",
      "web site",
      "webpage",
      "web page",
      "web",
      "site",
      "landing",
      "portfolio",
      "page",
      "laravel",
      "wordpress",
      "webshop",
      "shop"
    ]);

  if (isGame) return "game";
  if (isApi) return "api";
  if (isMobile) return "mobile";
  if (isSchool) return "school";
  if (isWebsite) return "website";

  return "other";
}

function computeLiveUrl(repo, override) {
  const raw = (override.liveUrl || repo.homepage || "").trim();
  if (raw) return raw;

  const hasLive =
    override.hasLive !== undefined ? !!override.hasLive : !!repo.has_pages;

  if (hasLive) {
    return `https://${GITHUB_USER}.github.io/${repo.name}/`;
  }

  return null;
}

// Only immediate overrides; “smart” detection happens in loadProjectThumbnails
function computeThumbnail(repo, override) {
  if (override.thumbnail || override.thumb) {
    return override.thumbnail || override.thumb;
  }
  return null;
}

/* sort with live sites (after verification) first, then by name */
function sortProjectsByLive() {
  projects.sort((a, b) => {
    if (a.liveUrl && !b.liveUrl) return -1;
    if (!a.liveUrl && b.liveUrl) return 1;
    return a.displayName.localeCompare(b.displayName, "en");
  });
}

/* verify that liveUrl really works – drop it if 404 / network error */
async function verifyLiveSites() {
  const checks = projects.map(async (project) => {
    if (!project.liveUrl) return;

    try {
      const res = await fetch(project.liveUrl, {
        method: "GET",
        redirect: "follow"
      });
      if (!res.ok) {
        project.liveUrl = null;
      }
    } catch (_) {
      project.liveUrl = null;
    }
  });

  await Promise.all(checks);
  sortProjectsByLive();
  renderProjects();
}

/* ---------- Thumbnail helpers (root images) ---------- */

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

async function checkImageExists(url) {
  try {
    // Try HEAD first
    let res = await fetch(url, { method: "HEAD" });
    if (res.ok) return true;

    // Fallback to GET if HEAD not allowed
    res = await fetch(url, { method: "GET" });
    return res.ok;
  } catch (_) {
    return false;
  }
}

async function loadProjectThumbnails() {
  const promises = projects.map(async (project) => {
    const repoName = project.name;

    // 1) If a thumbnail is already defined (e.g. from projects.json), verify once.
    if (project.thumbnail && !thumbCache[repoName]) {
      const ok = await checkImageExists(project.thumbnail);
      if (ok) {
        thumbCache[repoName] = project.thumbnail;
        return;
      } else {
        // override points to non-existent file (e.g. logo.jpg); fall back to auto detection
        project.thumbnail = null;
      }
    }

    // 2) Use cached thumbnail if present
    const cached = thumbCache[repoName];
    if (cached) {
      project.thumbnail = cached;
      return;
    }

    // 3) Try to find a good image in the repo root
    const rootThumb = await findRepoRootThumbnail(repoName);

    let finalUrl = rootThumb;
    if (!finalUrl) {
      // 4) Fallback to GitHub social preview image
      finalUrl = `https://opengraph.githubassets.com/1/${GITHUB_USER}/${repoName}`;
    }

    project.thumbnail = finalUrl;
    thumbCache[repoName] = finalUrl;
  });

  await Promise.all(promises);
  saveThumbCache();
  renderProjects();
}

async function findRepoRootThumbnail(repoName) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${repoName}/contents/`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    const files = data.filter((item) => item.type === "file");

    const imageFiles = files.filter((item) => {
      const ext = (item.name.split(".").pop() || "").toLowerCase();
      return ["jpg", "jpeg", "png", "svg", "gif", "webp"].includes(ext);
    });

    if (!imageFiles.length) {
      return null;
    }

    const score = (name) => {
      const lower = name.toLowerCase();
      // Prefer logo.png over logo.jpg if both exist
      if (lower === "logo.png") return 0;
      if (lower === "logo.jpg" || lower === "logo.jpeg") return 1;
      if (lower.startsWith("logo.")) return 2;
      if (lower.includes("classdiagram")) return 3;
      if (lower.includes("diagram")) return 4;
      return 5;
    };

    imageFiles.sort((a, b) => score(a.name) - score(b.name));
    const chosen = imageFiles[0];

    const encodedName = encodeURIComponent(chosen.name);
    return `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/HEAD/${encodedName}`;
  } catch (err) {
    console.error("Failed to load root thumbnail for", repoName, err);
    return null;
  }
}

/* ---------- Project rendering ---------- */

function getFilteredProjects() {
  const search = state.search.toLowerCase();
  const typeFilter = state.typeFilter;
  const langFilter = state.languageFilter;

  return projects.filter((p) => {
    if (typeFilter !== "all" && p.type !== typeFilter) return false;

    if (
      langFilter !== "all" &&
      !p.languages.some(
        (l) => l.toLowerCase() === langFilter.toLowerCase()
      )
    ) {
      return false;
    }

    if (!search) return true;

    const haystack = [
      p.displayName,
      p.description,
      p.type,
      (p.tags || []).join(" "),
      (p.languages || []).join(" ")
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

function renderProjects() {
  const grid = document.getElementById("projectsGrid");
  const emptyState = document.getElementById("emptyState");
  if (!grid || !emptyState) return;

  const filtered = getFilteredProjects();

  grid.innerHTML = "";
  if (!filtered.length) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  const dict = I18N[state.lang] || I18N[DEFAULT_LANG] || {};

  filtered.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const titleRow = document.createElement("div");
    titleRow.className = "project-title-row";

    // Thumbnail: now a simple div, not clickable
    const thumb = document.createElement("div");
    thumb.className = "project-thumb";

    if (project.thumbnail) {
      thumb.classList.add("has-image");
      const img = document.createElement("img");
      img.src = project.thumbnail;
      img.alt = project.displayName;
      thumb.appendChild(img);
    } else {
      const span = document.createElement("span");
      span.textContent = (project.displayName || "?")
        .charAt(0)
        .toUpperCase();
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

    const typeBadge = document.createElement("span");
    typeBadge.className = "badge badge-type";

    const typeMap = TYPE_LABELS[project.type] || TYPE_LABELS.other;
    const typeLabel =
      typeMap[state.lang] ||
      typeMap[DEFAULT_LANG] ||
      project.type;
    typeBadge.textContent = typeLabel;

    meta.appendChild(typeBadge);

    (project.tags || []).forEach((tag) => {
      const tagBadge = document.createElement("span");
      tagBadge.className = "badge";
      tagBadge.textContent = tag;
      meta.appendChild(tagBadge);
    });

    const actions = document.createElement("div");
    actions.className = "project-actions";

    // GitHub button – always
    const githubBtn = document.createElement("a");
    githubBtn.href = project.githubUrl;
    githubBtn.target = "_blank";
    githubBtn.rel = "noopener noreferrer";
    githubBtn.className = "btn-card";
    githubBtn.innerHTML = `<span>GitHub</span>`;
    actions.appendChild(githubBtn);

    // Live site – only if url present AND verified
    if (project.liveUrl) {
      const liveBtn = document.createElement("a");
      liveBtn.href = project.liveUrl;
      liveBtn.target = "_blank";
      liveBtn.rel = "noopener noreferrer";
      liveBtn.className = "btn-card btn-card-live";
      const label =
        dict.btnLiveSite || I18N[DEFAULT_LANG].btnLiveSite || "Live site";
      liveBtn.innerHTML = `<span>${label}</span>`;
      actions.appendChild(liveBtn);
    }

    card.appendChild(titleRow);
    card.appendChild(desc);
    card.appendChild(meta);
    card.appendChild(actions);

    grid.appendChild(card);
  });
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
      const path = item.path || item.url || "";
      const title =
        item.title ||
        item.name ||
        item.fileName ||
        path.split("/").pop() ||
        `Media ${index + 1}`;

      const format =
        (item.format ||
          (path.split(".").pop() || "").toLowerCase()) || "";

      let type = item.type;
      if (!type) {
        type = guessMediaType(path);
      }

      return {
        id: index,
        title,
        path,
        type,
        format
      };
    });

    buildMediaFilterOptions(mediaItems);
    renderMedia();
  } catch (err) {
    console.error("Failed to load media index", err);
    mediaItems = [];
    renderMedia();
  }
}

function guessMediaType(path) {
  const ext = (path.split(".").pop() || "").toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) {
    return "image";
  }
  if (["mp4", "webm", "mov", "m4v"].includes(ext)) {
    return "video";
  }
  if (["mp3", "wav", "ogg", "flac"].includes(ext)) {
    return "audio";
  }
  return "image";
}

function buildMediaFilterOptions(items) {
  const typeSelect = document.getElementById("mediaTypeFilter");
  const formatSelect = document.getElementById("mediaFormatFilter");
  if (!typeSelect || !formatSelect) return;

  // type
  while (typeSelect.options.length > 1) typeSelect.remove(1);
  const typeSet = new Set();
  items.forEach((i) => typeSet.add(i.type));
  Array.from(typeSet)
    .sort()
    .forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
      typeSelect.appendChild(opt);
    });

  // format
  while (formatSelect.options.length > 1) formatSelect.remove(1);
  const formatSet = new Set();
  items.forEach((i) => {
    if (i.format) formatSet.add(i.format.toLowerCase());
  });
  Array.from(formatSet)
    .sort()
    .forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f;
      opt.textContent = f.toUpperCase();
      formatSelect.appendChild(opt);
    });
}

function getFilteredMedia() {
  const search = state.search.toLowerCase();
  const typeFilter = state.mediaTypeFilter;
  const formatFilter = state.mediaFormatFilter;

  return mediaItems.filter((item) => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (
      formatFilter !== "all" &&
      item.format.toLowerCase() !== formatFilter.toLowerCase()
    ) {
      return false;
    }

    if (!search) return true;

    const haystack = (item.title + " " + item.path + " " + item.type + " " + item.format)
      .toLowerCase();

    return haystack.includes(search);
  });
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
      preview.appendChild(img);

      preview.addEventListener("click", () => {
        openImageModal(item.path, item.title);
      });
    } else if (item.type === "video") {
      const video = document.createElement("video");
      video.src = item.path;
      video.controls = true;
      preview.appendChild(video);
    } else if (item.type === "audio") {
      const audio = document.createElement("audio");
      audio.src = item.path;
      audio.controls = true;
      preview.appendChild(audio);
    }

    const meta = document.createElement("div");
    meta.className = "media-meta";

    const typeBadge = document.createElement("span");
    typeBadge.className = "badge-media-type";
    typeBadge.textContent = item.type;

    const formatBadge = document.createElement("span");
    formatBadge.className = "badge-media-format";
    formatBadge.textContent = item.format.toUpperCase();

    meta.appendChild(typeBadge);
    meta.appendChild(formatBadge);

    const actions = document.createElement("div");
    actions.className = "media-actions";

    if (item.type === "image") {
      const viewBtn = document.createElement("button");
      viewBtn.type = "button";
      viewBtn.className = "media-action-btn";
      viewBtn.textContent = "View";
      viewBtn.addEventListener("click", () => {
        openImageModal(item.path, item.title);
      });
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
    card.appendChild(meta);
    card.appendChild(actions);

    grid.appendChild(card);
  });
}

/* ---------- Image modal (projects + media) ---------- */

function setupImageModal() {
  const modal = document.getElementById("imageModal");
  if (!modal) return;

  modal.addEventListener("click", (event) => {
    // click outside inner box closes
    if (event.target === modal) {
      closeImageModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeImageModal();
    }
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
  img.addEventListener("click", () => {
    closeImageModal();
  });

  figure.appendChild(img);

  if (captionText) {
    const caption = document.createElement("figcaption");
    caption.className = "image-modal-caption";
    caption.textContent = captionText;
    figure.appendChild(caption);
  }

  inner.appendChild(figure);

  const actions = document.createElement("div");
  actions.className = "image-modal-actions";

  const openTabBtn = document.createElement("a");
  openTabBtn.href = src;
  openTabBtn.target = "_blank";
  openTabBtn.rel = "noopener noreferrer";
  openTabBtn.className = "image-modal-btn";
  openTabBtn.textContent = "Open in new tab";
  actions.appendChild(openTabBtn);

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
  const year = new Date().getFullYear();
  // only year, © is in HTML
  el.textContent = `${year}`;
}
