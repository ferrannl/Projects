// scripts/script.js

/* -------------------------------------------------------
   Ferran’s Projects – Main JS
   - Multi-language UI (NL / EN / DE / PL / TR / ES)
   - Live age text in About section
   - Projects + Media switcher with filters
   - Smart thumbnails + fullscreen image modal
   - No-JS fallback (handled via body.js-enabled)
------------------------------------------------------- */

/* ---------- Language + global view state ---------- */

const SUPPORTED_LANGS = ["nl", "en", "de", "pl", "tr", "es"];
const DEFAULT_LANG = "nl";
const LANG_STORAGE_KEY = "ferranProjectsLang";
const LANG_GATE_SEEN_KEY = "ferranProjectsLangSeenGate";

let currentView = "projects";
let currentLang = DEFAULT_LANG;

// Birthday: 15-08-1999 23:10 Amsterdam time
const BIRTH_DATE = new Date(1999, 7, 15, 23, 10); // months are 0-based

const AGE_UNITS = {
  nl: { y: "j", m: "mnd", w: "w", d: "d", h: "u", min: "min", s: "s" },
  en: { y: "y", m: "mo", w: "w", d: "d", h: "h", min: "m", s: "s" },
  de: { y: "J", m: "M", w: "W", d: "T", h: "Std", min: "Min", s: "s" },
  pl: { y: "l", m: "m", w: "tyg", d: "d", h: "g", min: "min", s: "s" },
  tr: { y: "y", m: "ay", w: "hf", d: "g", h: "sa", min: "dk", s: "sn" },
  es: { y: "a", m: "m", w: "sem", d: "d", h: "h", min: "min", s: "s" }
};

/* ---------- Translations ---------- */

const TRANSLATIONS = {
  en: {
    subtitle:
      "All my programming & coding projects in one place – websites, apps, school work, guides, APIs and more.",
    aboutTitle: "About Me",
    aboutP1:
      "Hey Ferran ({age}) here. I am a Dutch 🇳🇱 developer from Utrecht / 's-Hertogenbosch. I like building websites, apps and small tools to help myself and others.",
    aboutP2: "",
    tabProjects: "Projects",
    tabMedia: "Media",
    searchProjectsPlaceholder: "Search by name, description, language or tag…",
    searchMediaPlaceholder: "Search media by title, filename or type…",
    filterTypeLabel: "Type",
    typeAll: "All",
    typeWebsite: "Websites",
    typeMobile: "Mobile",
    typeApi: "APIs / Backend",
    typeSchool: "School / Study",
    typeOther: "Other",
    filterLanguageLabel: "Language",
    languageFilterAll: "All languages",
    mediaTypeLabel: "Media type",
    mediaKindAll: "All",
    mediaKindImages: "Images",
    mediaKindVideos: "Videos",
    mediaKindAudio: "Audio",
    mediaFormatLabel: "Format",
    mediaFormatAll: "All formats",
    emptyState:
      "Hmm… no projects loaded right now. Maybe I took them offline, or something went wrong. Try a hard refresh (Shift + F5 / Ctrl + F5) and wait a few seconds.",
    mediaEmptyState:
      "No media to show right now. Try a hard refresh and wait a few seconds.",
    footerBuiltWith: "Built with ♥ by Ferran",
    footerViewOnPages: "View this site on GitHub Pages",
    headerLangButton: "Language"
  },

  nl: {
    subtitle:
      "Al mijn programmeer- en codeprojecten op één plek – websites, apps, schoolopdrachten, guides, API’s en meer.",
    aboutTitle: "Over mij",
    aboutP1:
      "Hey 👋🏻 Ferran ({age}) hier. Ik ben een Nederlandse 🇳🇱 developer uit Utrecht / ’s-Hertogenbosch. Ik bouw graag websites, apps en kleine tools om mezelf en anderen te helpen.",
    aboutP2: "",
    tabProjects: "Projecten",
    tabMedia: "Media",
    searchProjectsPlaceholder:
      "Zoek op naam, beschrijving, taal of tag…",
    searchMediaPlaceholder:
      "Zoek media op titel, bestandsnaam of type…",
    filterTypeLabel: "Type",
    typeAll: "Alles",
    typeWebsite: "Websites",
    typeMobile: "Mobiel",
    typeApi: "API’s / Backend",
    typeSchool: "School / Studie",
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
      "Hmm… geen projecten om te laten zien. Misschien heb ik ze offline gehaald of ging er iets mis. Probeer de pagina hard te verversen (Shift + F5 / Ctrl + F5) en wacht een paar seconden.",
    mediaEmptyState:
      "Geen media om te laten zien. Probeer de pagina opnieuw te laden en wacht even.",
    footerBuiltWith: "Gemaakt met ♥ door Ferran",
    footerViewOnPages: "Bekijk deze site op GitHub Pages",
    headerLangButton: "Taal"
  },

  de: {
    subtitle:
      "Alle meine Programmier- und Coding-Projekte an einem Ort – Websites, Apps, Studienprojekte, Guides, APIs und mehr.",
    aboutTitle: "Über mich",
    aboutP1:
      "Hey hier ist Ferran ({age}). Ich bin ein niederländischer 🇳🇱 Entwickler aus Utrecht / ’s-Hertogenbosch und baue gerne Websites, Apps und kleine Tools, die mir und anderen helfen.",
    aboutP2: "",
    tabProjects: "Projekte",
    tabMedia: "Medien",
    searchProjectsPlaceholder:
      "Suche nach Name, Beschreibung, Sprache oder Tag…",
    searchMediaPlaceholder:
      "Suche Medien nach Titel, Dateiname oder Typ…",
    filterTypeLabel: "Typ",
    typeAll: "Alle",
    typeWebsite: "Websites",
    typeMobile: "Mobile",
    typeApi: "APIs / Backend",
    typeSchool: "Schule / Studium",
    typeOther: "Sonstiges",
    filterLanguageLabel: "Sprache",
    languageFilterAll: "Alle Sprachen",
    mediaTypeLabel: "Medientyp",
    mediaKindAll: "Alle",
    mediaKindImages: "Bilder",
    mediaKindVideos: "Videos",
    mediaKindAudio: "Audio",
    mediaFormatLabel: "Format",
    mediaFormatAll: "Alle Formate",
    emptyState:
      "Keine Projekte für diese Suche oder Filter. Vielleicht sind sie offline oder etwas ist schief gelaufen. Versuche ein hartes Reload (Shift + F5) und warte ein paar Sekunden.",
    mediaEmptyState:
      "Keine Medien für diese Suche oder Filter. Versuche die Seite neu zu laden.",
    footerBuiltWith: "Mit ♥ erstellt von Ferran",
    footerViewOnPages: "Diese Seite auf GitHub Pages ansehen",
    headerLangButton: "Sprache"
  },

  pl: {
    subtitle:
      "Wszystkie moje projekty programistyczne w jednym miejscu – strony WWW, aplikacje, zadania ze szkoły, poradniki, API i więcej.",
    aboutTitle: "O mnie",
    aboutP1:
      "Cześć tu Ferran ({age}). Jestem holenderskim 🇳🇱 deweloperem z Utrechtu / ’s-Hertogenbosch. Lubię tworzyć strony, aplikacje i małe narzędzia, które pomagają mnie i innym.",
    aboutP2: "",
    tabProjects: "Projekty",
    tabMedia: "Media",
    searchProjectsPlaceholder:
      "Szukaj po nazwie, opisie, języku lub tagu…",
    searchMediaPlaceholder:
      "Szukaj mediów po tytule, nazwie pliku lub typie…",
    filterTypeLabel: "Typ",
    typeAll: "Wszystko",
    typeWebsite: "Strony WWW",
    typeMobile: "Mobilne",
    typeApi: "API / Backend",
    typeSchool: "Szkoła / Studia",
    typeOther: "Inne",
    filterLanguageLabel: "Język",
    languageFilterAll: "Wszystkie języki",
    mediaTypeLabel: "Typ mediów",
    mediaKindAll: "Wszystko",
    mediaKindImages: "Obrazy",
    mediaKindVideos: "Wideo",
    mediaKindAudio: "Audio",
    mediaFormatLabel: "Format",
    mediaFormatAll: "Wszystkie formaty",
    emptyState:
      "Brak projektów dla tych filtrów. Może są offline albo coś poszło nie tak. Spróbuj odświeżyć stronę (Shift + F5) i chwilę poczekać.",
    mediaEmptyState:
      "Brak mediów dla tych filtrów. Spróbuj ponownie odświeżyć stronę.",
    footerBuiltWith: "Stworzone z ♥ przez Ferrana",
    footerViewOnPages: "Zobacz tę stronę na GitHub Pages",
    headerLangButton: "Język"
  },

  tr: {
    subtitle:
      "Tüm programlama projelerim tek bir yerde – web siteleri, uygulamalar, okul projeleri, rehberler, API’ler ve daha fazlası.",
    aboutTitle: "Hakkımda",
    aboutP1:
      "Selam ben Ferran ({age}). Utrecht / ’s-Hertogenbosch’ta yaşayan Hollandalı 🇳🇱 bir geliştiriciyim. Kendime ve başkalarına yardımcı olan web siteleri, uygulamalar ve küçük araçlar geliştirmeyi seviyorum.",
    aboutP2: "",
    tabProjects: "Projeler",
    tabMedia: "Medya",
    searchProjectsPlaceholder:
      "İsme, açıklamaya, dile veya etikete göre ara…",
    searchMediaPlaceholder:
      "Medya için başlık, dosya adı veya türe göre ara…",
    filterTypeLabel: "Tür",
    typeAll: "Tümü",
    typeWebsite: "Web siteleri",
    typeMobile: "Mobil",
    typeApi: "API / Backend",
    typeSchool: "Okul / Eğitim",
    typeOther: "Diğer",
    filterLanguageLabel: "Dil",
    languageFilterAll: "Tüm diller",
    mediaTypeLabel: "Medya türü",
    mediaKindAll: "Tümü",
    mediaKindImages: "Görseller",
    mediaKindVideos: "Videolar",
    mediaKindAudio: "Ses",
    mediaFormatLabel: "Biçim",
    mediaFormatAll: "Tüm biçimler",
    emptyState:
      "Bu filtrelerle eşleşen proje yok. Belki offline oldular ya da bir şeyler ters gitti. Sayfayı sert yenile (Shift + F5) ve birkaç saniye bekle.",
    mediaEmptyState:
      "Bu filtrelere uygun medya yok. Sayfayı yenilemeyi dene.",
    footerBuiltWith: "♥ ile geliştirildi – Ferran",
    footerViewOnPages: "Bu siteyi GitHub Pages üzerinde görüntüle",
    headerLangButton: "Dil"
  },

  es: {
    subtitle:
      "Todos mis proyectos y media en un solo lugar: webs, apps, trabajos de estudio, experimentos de código y más.",
    aboutTitle: "Sobre mí",
    aboutP1:
      "Hola soy Ferran ({age}). Soy un desarrollador 🇳🇱 holandés de Utrecht / ’s-Hertogenbosch. Me gusta crear webs, apps y pequeñas herramientas que ayudan a mí y a otras personas.",
    aboutP2: "",
    tabProjects: "Proyectos",
    tabMedia: "Media",
    searchProjectsPlaceholder:
      "Busca por nombre, descripción, idioma o etiqueta…",
    searchMediaPlaceholder:
      "Busca medios por título, archivo o tipo…",
    filterTypeLabel: "Tipo",
    typeAll: "Todo",
    typeWebsite: "Webs",
    typeMobile: "Móvil",
    typeApi: "APIs / Backend",
    typeSchool: "Escuela / Estudio",
    typeOther: "Otros",
    filterLanguageLabel: "Idioma",
    languageFilterAll: "Todos los idiomas",
    mediaTypeLabel: "Tipo de media",
    mediaKindAll: "Todo",
    mediaKindImages: "Imágenes",
    mediaKindVideos: "Vídeos",
    mediaKindAudio: "Audio",
    mediaFormatLabel: "Formato",
    mediaFormatAll: "Todos los formatos",
    emptyState:
      "No hay proyectos con estos filtros. Puede que estén offline o algo ha fallado. Prueba a recargar la página (Shift + F5) y espera unos segundos.",
    mediaEmptyState:
      "No hay media con estos filtros. Prueba a recargar la página.",
    footerBuiltWith: "Hecho con ♥ por Ferran",
    footerViewOnPages: "Ver este sitio en GitHub Pages",
    headerLangButton: "Idioma"
  }
};

/* ---------- Age calculation ---------- */

function computeAgeComponents(now) {
  let diffMs = now - BIRTH_DATE;
  if (diffMs < 0) diffMs = 0;

  let totalSeconds = Math.floor(diffMs / 1000);

  const s = totalSeconds % 60;
  totalSeconds = (totalSeconds - s) / 60;

  const min = totalSeconds % 60;
  totalSeconds = (totalSeconds - min) / 60;

  const h = totalSeconds % 24;
  totalSeconds = (totalSeconds - h) / 24;

  // approximate months/years for a fun live timer
  const dRaw = totalSeconds % 30;
  totalSeconds = (totalSeconds - dRaw) / 30;

  const m = totalSeconds % 12;
  const y = (totalSeconds - m) / 12;

  // split days into weeks + remaining days
  const w = Math.floor(dRaw / 7);
  const d = dRaw % 7;

  return { y, m, w, d, h, min, s };
}

function formatAge(lang) {
  const units = AGE_UNITS[lang] || AGE_UNITS[DEFAULT_LANG];
  const { y, m, w, d, h, min, s } = computeAgeComponents(new Date());
  const parts = [];

  if (y) parts.push(`${y}${units.y}`);
  if (m) parts.push(`${m}${units.m}`);
  if (w) parts.push(`${w}${units.w}`);
  if (d) parts.push(`${d}${units.d}`);
  if (h) parts.push(`${h}${units.h}`);
  if (min) parts.push(`${min}${units.min}`);
  if (s || parts.length === 0) parts.push(`${s}${units.s}`);

  return parts.join(" ");
}

/* ---------- i18n application ---------- */

function applyTranslations(lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key || !(key in t)) return;

    let value = t[key];
    if (key === "aboutP1") {
      value = value.replace("{age}", formatAge(lang));
    }

    el.textContent = value;
  });

  // Update search placeholder depending on view
  const searchInput = document.getElementById("search");
  if (searchInput) {
    const placeholderKey =
      currentView === "media"
        ? "searchMediaPlaceholder"
        : "searchProjectsPlaceholder";
    if (t[placeholderKey]) searchInput.placeholder = t[placeholderKey];
  }

  // Footer text
  const footerBuilt = document.querySelector("[data-i18n-footer-built]");
  const footerPages = document.querySelector("[data-i18n-footer-pages]");
  if (footerBuilt && t.footerBuiltWith) {
    footerBuilt.textContent = t.footerBuiltWith;
  }
  if (footerPages && t.footerViewOnPages) {
    footerPages.textContent = t.footerViewOnPages;
  }

  // Tab labels
  const projectsTab = document.getElementById("projectsTab");
  const mediaTab = document.getElementById("mediaTab");
  if (projectsTab && t.tabProjects) projectsTab.textContent = t.tabProjects;
  if (mediaTab && t.tabMedia) mediaTab.textContent = t.tabMedia;

  // Header language button label
  const headerLangButton = document.getElementById("headerLangButton");
  if (headerLangButton) {
    const span = headerLangButton.querySelector(".lang-switch-label");
    if (span && t.headerLangButton) span.textContent = t.headerLangButton;
  }
}

/* ---------- Language helpers ---------- */

function detectInitialLang() {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

  const navLang = (navigator.language || "").slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGS.includes(navLang)) return navLang;

  return DEFAULT_LANG;
}

function setActiveLangButton(lang) {
  document
    .querySelectorAll(".btn-lang[data-lang]")
    .forEach((btn) => btn.classList.remove("active"));

  const btn = document.querySelector(`.btn-lang[data-lang="${lang}"]`);
  if (btn) btn.classList.add("active");
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  currentLang = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  setActiveLangButton(lang);
  applyTranslations(lang);
}

function initLanguageGate() {
  const gate = document.getElementById("langGate");
  if (!gate) return;

  const alreadySeen = localStorage.getItem(LANG_GATE_SEEN_KEY) === "1";
  if (alreadySeen) {
    gate.style.display = "none";
  }

  gate.querySelectorAll(".btn-lang[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
      localStorage.setItem(LANG_GATE_SEEN_KEY, "1");
      gate.style.display = "none";
    });
  });
}

function openLanguageGate() {
  const gate = document.getElementById("langGate");
  if (!gate) return;
  gate.style.display = "flex";
}

/* ---------- View state & filters ---------- */

const state = {
  search: "",
  typeFilter: "all",
  languageFilter: "all",
  mediaTypeFilter: "all",
  mediaFormatFilter: "all"
};

let allProjects = [];
let allMedia = [];

// DOM refs
let projectsGrid,
  projectsEmpty,
  mediaGrid,
  mediaEmpty,
  searchInput,
  typeSelect,
  languageSelect,
  mediaTypeSelect,
  mediaFormatSelect,
  projectFiltersEl,
  mediaFiltersEl,
  projectsTab,
  mediaTab,
  projectsView,
  mediaView,
  imageModal,
  imageModalImg;

/* ---------- Data helpers ---------- */

const PROJECTS_URL = "./projects.json";
const MEDIA_URL = "./media/media-index.json";

function deriveProjectType(project) {
  const name = (project.name || "").toLowerCase();
  const desc = (project.description || "").toLowerCase();
  const lang = (project.language || "").toLowerCase();

  if (
    project.hasPages ||
    ["html", "scss", "less", "php"].includes(lang) ||
    desc.includes("website")
  ) {
    return "website";
  }

  if (
    ["java", "swift", "kotlin"].includes(lang) ||
    name.includes("android") ||
    name.includes("ios")
  ) {
    return "mobile";
  }

  if (
    desc.includes("api") ||
    desc.includes("rest") ||
    desc.includes("backend")
  ) {
    return "api";
  }

  if (
    desc.includes("assignment") ||
    desc.includes("course") ||
    desc.includes("school") ||
    desc.includes("exam") ||
    desc.includes("eindopdracht")
  ) {
    return "school";
  }

  return "other";
}

function getMediaFormat(item) {
  const src = item.src || "";
  const dot = src.lastIndexOf(".");
  if (dot === -1) return "";
  return src.slice(dot + 1).toLowerCase();
}

/* ---------- Thumbnail helper ---------- */

function buildThumbnailCandidates(project) {
  const candidates = [];

  // explicit thumbnail path in JSON
  if (project.thumbnail) {
    candidates.push(project.thumbnail);
  }

  if (!project.name) return candidates;

  const repo = project.name;
  const rawBase = `https://raw.githubusercontent.com/ferrannl/${encodeURIComponent(
    repo
  )}/main/`;

  const rootFiles = [
    "logo.png",
    "logo.jpg",
    "logo.jpeg",
    "banner.png",
    "banner.jpg",
    "banner.jpeg",
    "thumb.png",
    "thumb.jpg",
    "thumbnail.png",
    "thumbnail.jpg",
    "screenshot.png",
    "screenshot.jpg",
    "diagram.png",
    "diagram.jpg",
    "class-diagram.png",
    "class-diagram.jpg"
  ];

  const imageDirFiles = rootFiles.map((f) => `images/${f}`);

  rootFiles.concat(imageDirFiles).forEach((file) => {
    candidates.push(rawBase + file);
  });

  return candidates;
}

function openImageModal(src, alt) {
  if (!imageModal || !imageModalImg) return;
  imageModalImg.src = src;
  imageModalImg.alt = alt || "";
  imageModal.hidden = false;
}

function closeImageModal() {
  if (!imageModal || !imageModalImg) return;
  imageModal.hidden = true;
  imageModalImg.src = "";
  imageModalImg.alt = "";
}

function createProjectThumbnail(project) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "project-thumb";

  const firstLetter = (project.name || "?")[0].toUpperCase();
  const placeholderSpan = document.createElement("span");
  placeholderSpan.textContent = firstLetter;
  btn.appendChild(placeholderSpan);

  const candidates = buildThumbnailCandidates(project);
  if (!candidates.length) {
    // only placeholder
    return btn;
  }

  const img = document.createElement("img");
  img.loading = "lazy";

  let index = 0;

  function tryNext() {
    if (index >= candidates.length) {
      return;
    }
    img.src = candidates[index++];
  }

  img.addEventListener("error", () => {
    if (index < candidates.length) {
      tryNext();
    }
  });

  img.addEventListener("load", () => {
    btn.classList.add("has-image");
    btn.innerHTML = "";
    btn.appendChild(img);
  });

  btn.addEventListener("click", () => {
    if (!img.src) return;
    openImageModal(img.src, project.name || "");
  });

  tryNext();

  return btn;
}

/* ---------- Rendering: Projects ---------- */

function renderProjects() {
  if (!projectsGrid || !projectsEmpty) return;

  const search = state.search.trim().toLowerCase();
  const type = state.typeFilter;
  const langFilter = state.languageFilter;

  const filtered = allProjects.filter((p) => {
    const inSearch =
      !search ||
      (p.name || "").toLowerCase().includes(search) ||
      (p.description || "").toLowerCase().includes(search) ||
      (p.language || "").toLowerCase().includes(search) ||
      (Array.isArray(p.tags)
        ? p.tags.join(" ").toLowerCase().includes(search)
        : false);

    if (!inSearch) return false;

    const derivedType = deriveProjectType(p);
    if (type !== "all" && derivedType !== type) return false;

    if (
      langFilter !== "all" &&
      (p.language || "").toLowerCase() !== langFilter.toLowerCase()
    ) {
      return false;
    }

    return true;
  });

  projectsGrid.innerHTML = "";

  if (filtered.length === 0) {
    projectsEmpty.style.display = "block";
    projectsGrid.style.display = "none";
    return;
  }

  projectsEmpty.style.display = "none";
  projectsGrid.style.display = "grid";

  filtered.forEach((p) => {
    const card = document.createElement("article");
    card.className = "project-card";

    // header row with thumbnail + title/lang
    const headerRow = document.createElement("div");
    headerRow.className = "project-title-row";

    const thumb = createProjectThumbnail(p);
    headerRow.appendChild(thumb);

    const titleText = document.createElement("div");
    titleText.className = "project-title-text";

    const title = document.createElement("h3");
    title.className = "project-title";
    title.textContent = p.name || "";

    const lang = document.createElement("div");
    lang.className = "project-lang";
    lang.textContent = p.language || "";

    titleText.appendChild(title);
    titleText.appendChild(lang);

    headerRow.appendChild(titleText);
    card.appendChild(headerRow);

    const desc = document.createElement("p");
    desc.className = "project-desc";
    desc.textContent = p.description || "";
    card.appendChild(desc);

    const meta = document.createElement("div");
    meta.className = "project-meta";

    // Type badge
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS[DEFAULT_LANG];
    const typeKey = deriveProjectType(p);
    const typeMap = {
      website: t.typeWebsite,
      mobile: t.typeMobile,
      api: t.typeApi,
      school: t.typeSchool,
      other: t.typeOther
    };
    const typeBadge = document.createElement("span");
    typeBadge.className = `badge badge-type badge-type-${typeKey}`;
    typeBadge.textContent = typeMap[typeKey] || t.typeOther;
    meta.appendChild(typeBadge);

    // Live site
    if (p.hasPages && p.pagesUrl) {
      const link = document.createElement("a");
      link.href = p.pagesUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "btn-card btn-card-live";
      link.textContent = "Live site";
      meta.appendChild(link);
    }

    // GitHub link
    if (p.name) {
      const repoLink = document.createElement("a");
      repoLink.href = `https://github.com/ferrannl/${encodeURIComponent(
        p.name
      )}`;
      repoLink.target = "_blank";
      repoLink.rel = "noopener noreferrer";
      repoLink.className = "btn-card btn-card-github";
      repoLink.textContent = "GitHub";
      meta.appendChild(repoLink);
    }

    card.appendChild(meta);
    projectsGrid.appendChild(card);
  });
}

/* ---------- Rendering: Media ---------- */

function renderMedia() {
  if (!mediaGrid || !mediaEmpty) return;

  const search = state.search.trim().toLowerCase();
  const type = state.mediaTypeFilter;
  const formatFilter = state.mediaFormatFilter;

  const filtered = allMedia.filter((item) => {
    const inSearch =
      !search ||
      (item.title || "").toLowerCase().includes(search) ||
      (item.src || "").toLowerCase().includes(search) ||
      (item.type || "").toLowerCase().includes(search);

    if (!inSearch) return false;

    if (type !== "all" && (item.type || "").toLowerCase() !== type) {
      return false;
    }

    const fmt = getMediaFormat(item);
    if (formatFilter !== "all" && fmt !== formatFilter) {
      return false;
    }

    return true;
  });

  mediaGrid.innerHTML = "";

  if (filtered.length === 0) {
    mediaEmpty.style.display = "block";
    mediaGrid.style.display = "none";
    return;
  }

  mediaEmpty.style.display = "none";
  mediaGrid.style.display = "grid";

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "media-card";

    const title = document.createElement("h3");
    title.className = "media-title";
    title.textContent = item.title || "";

    const wrapper = document.createElement("div");
    wrapper.className = "media-preview";

    if (item.type === "image") {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.title || "";
      img.loading = "lazy";
      wrapper.appendChild(img);
    } else if (item.type === "video") {
      const video = document.createElement("video");
      video.controls = true;
      video.src = item.src;
      wrapper.appendChild(video);
    } else if (item.type === "audio") {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.src = item.src;
      wrapper.appendChild(audio);
    }

    const meta = document.createElement("div");
    meta.className = "media-meta";

    const typeSpan = document.createElement("span");
    typeSpan.className = "badge badge-media-type";
    typeSpan.textContent = item.type || "";

    const fmtSpan = document.createElement("span");
    fmtSpan.className = "badge badge-media-format";
    fmtSpan.textContent = getMediaFormat(item);

    meta.appendChild(typeSpan);
    meta.appendChild(fmtSpan);

    card.appendChild(title);
    card.appendChild(wrapper);
    card.appendChild(meta);

    mediaGrid.appendChild(card);
  });
}

/* ---------- View switching ---------- */

function updateViewVisibility() {
  if (projectsView) {
    projectsView.style.display = currentView === "projects" ? "block" : "none";
  }
  if (mediaView) {
    mediaView.style.display = currentView === "media" ? "block" : "none";
  }

  if (projectsTab) {
    projectsTab.classList.toggle("active", currentView === "projects");
  }
  if (mediaTab) {
    mediaTab.classList.toggle("active", currentView === "media");
  }

  // hide filters that don’t make sense in current view
  if (projectFiltersEl) {
    projectFiltersEl.hidden = currentView !== "projects";
  }
  if (mediaFiltersEl) {
    mediaFiltersEl.hidden = currentView !== "media";
  }

  applyTranslations(currentLang);

  if (currentView === "projects") {
    renderProjects();
  } else {
    renderMedia();
  }
}

function setView(view) {
  if (view !== "projects" && view !== "media") view = "projects";
  currentView = view;
  updateViewVisibility();
}

/* ---------- DOM refs & events ---------- */

function initDomRefs() {
  projectsGrid = document.getElementById("projectsGrid");
  projectsEmpty = document.getElementById("emptyState");
  mediaGrid = document.getElementById("mediaGrid");
  mediaEmpty = document.getElementById("mediaEmptyState");

  searchInput = document.getElementById("search");
  typeSelect = document.getElementById("typeFilter");
  languageSelect = document.getElementById("languageFilter");
  mediaTypeSelect = document.getElementById("mediaTypeFilter");
  mediaFormatSelect = document.getElementById("mediaFormatFilter");

  projectFiltersEl = document.getElementById("projectFilters");
  mediaFiltersEl = document.getElementById("mediaFilters");

  projectsTab = document.getElementById("projectsTab");
  mediaTab = document.getElementById("mediaTab");

  projectsView = document.getElementById("projectsView");
  mediaView = document.getElementById("mediaView");

  imageModal = document.getElementById("imageModal");
  imageModalImg = document.getElementById("imageModalImg");
}

function initEvents() {
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.search = e.target.value || "";
      if (currentView === "projects") {
        renderProjects();
      } else {
        renderMedia();
      }
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", (e) => {
      state.typeFilter = e.target.value || "all";
      renderProjects();
    });
  }

  if (languageSelect) {
    languageSelect.addEventListener("change", (e) => {
      state.languageFilter = e.target.value || "all";
      renderProjects();
    });
  }

  if (mediaTypeSelect) {
    mediaTypeSelect.addEventListener("change", (e) => {
      state.mediaTypeFilter = e.target.value || "all";
      renderMedia();
    });
  }

  if (mediaFormatSelect) {
    mediaFormatSelect.addEventListener("change", (e) => {
      state.mediaFormatFilter = e.target.value || "all";
      renderMedia();
    });
  }

  if (projectsTab) {
    projectsTab.addEventListener("click", () => setView("projects"));
  }
  if (mediaTab) {
    mediaTab.addEventListener("click", () => setView("media"));
  }

  // header language button: re-open gate
  const headerLangButton = document.getElementById("headerLangButton");
  if (headerLangButton) {
    headerLangButton.addEventListener("click", () => {
      openLanguageGate();
    });
  }

  // language buttons inside gate
  document.querySelectorAll(".btn-lang[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
    });
  });

  // image modal interactions
  if (imageModal) {
    imageModal.addEventListener("click", (e) => {
      if (e.target === imageModal || e.target === imageModalImg) {
        closeImageModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !imageModal.hidden) {
        closeImageModal();
      }
    });
  }
}

/* ---------- Data loading ---------- */

function loadProjects() {
  return fetch(PROJECTS_URL)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load projects.json");
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) return;
      allProjects = data;

      // Language select options from data
      if (languageSelect) {
        const existing = new Set(
          Array.from(languageSelect.options).map((o) =>
            (o.value || "").toLowerCase()
          )
        );
        const langs = Array.from(
          new Set(
            allProjects
              .map((p) => (p.language || "").trim())
              .filter(Boolean)
          )
        ).sort();
        langs.forEach((l) => {
          const lower = l.toLowerCase();
          if (existing.has(lower)) return;
          const opt = document.createElement("option");
          opt.value = l;
          opt.textContent = l;
          languageSelect.appendChild(opt);
        });
      }

      renderProjects();
    })
    .catch((err) => {
      console.error(err);
    });
}

function loadMedia() {
  return fetch(MEDIA_URL)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load media-index.json");
      return res.json();
    })
    .then((data) => {
      if (!data || !Array.isArray(data.items)) return;
      allMedia = data.items;

      // Format select from data
      if (mediaFormatSelect) {
        const existing = new Set(
          Array.from(mediaFormatSelect.options).map((o) =>
            (o.value || "").toLowerCase()
          )
        );
        const formats = Array.from(
          new Set(allMedia.map(getMediaFormat).filter(Boolean))
        ).sort();
        formats.forEach((fmt) => {
          if (existing.has(fmt.toLowerCase())) return;
          const opt = document.createElement("option");
          opt.value = fmt;
          opt.textContent = fmt;
          mediaFormatSelect.appendChild(opt);
        });
      }

      renderMedia();
    })
    .catch((err) => {
      console.error(err);
    });
}

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", () => {
  // Mark page as JS-enabled so CSS can hide fallback UI
  document.body.classList.add("js-enabled");

  initDomRefs();

  currentLang = detectInitialLang();
  setLanguage(currentLang);

  initLanguageGate();
  initEvents();

  // default view
  setView("projects");

  // load data
  loadProjects();
  loadMedia();

  // live age update
  setInterval(() => {
    applyTranslations(currentLang);
  }, 1000);
});
