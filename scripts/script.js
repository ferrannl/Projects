// scripts/script.js

/* -------------------------------------------------------
   Ferran’s Projects – Main JS

   - Multi-language UI (NL / EN / DE / PL / TR / ES)
   - Age text in About section (full precision at load)
   - Projects + Media switcher with filters
   - Fancy media wall (zoom, download, share)
   - Auto thumbnails from repo root via GitHub API
   - Pretty repo titles (no more hyphen hell)
   - Tags from projects.json (no language duplication)
   - No-JS fallback (handled via body.js-enabled)
------------------------------------------------------- */

/* ---------- GitHub + thumbnail cache ---------- */

const GITHUB_USER = "ferrannl";
const THUMB_CACHE_KEY = "ferranThumbCacheV1";
const THUMB_CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

function loadThumbCache() {
  try {
    const raw = localStorage.getItem(THUMB_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch (_) {}
  return {};
}

function saveThumbCache() {
  try {
    localStorage.setItem(THUMB_CACHE_KEY, JSON.stringify(thumbCache));
  } catch (_) {}
}

let thumbCache = loadThumbCache();

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
  pl: { y: "l", m: "m", w: "t", d: "d", h: "g", min: "min", s: "s" },
  tr: { y: "y", m: "ay", w: "hf", d: "g", h: "sa", min: "dk", s: "sn" },
  es: { y: "a", m: "m", w: "s", d: "d", h: "h", min: "min", s: "s" }
};

/* ---------- Translations (with 🇳🇱 flag in About) ---------- */

const TRANSLATIONS = {
  en: {
    headerLangButton: "Language",
    subtitle:
      "All my projects and media in one place – websites, apps, school work, guides, APIs and more.",
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
    footerBuiltWith: "Built with ♥ by Ferran"
  },

  nl: {
    headerLangButton: "Taal",
    subtitle:
      "Al mijn programmeer- en codeprojecten op één plek – websites, apps, schoolopdrachten, guides, API’s en meer.",
    aboutTitle: "Over mij",
    aboutP1:
      "Hey 👋🏻 Ferran ({age}) hier. Ik ben een Nederlandse 🇳🇱 developer uit Utrecht / ’s-Hertogenbosch. Ik bouw graag websites, apps en kleine tools om mezelf en anderen te helpen.",
    aboutP2: "",
    tabProjects: "Projecten",
    tabMedia: "Media",
    searchProjectsPlaceholder: "Zoek op naam, beschrijving, taal of tag…",
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
    footerBuiltWith: "Gemaakt met ♥ door Ferran"
  },

  de: {
    headerLangButton: "Sprache",
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
    footerBuiltWith: "Mit ♥ erstellt von Ferran"
  },

  pl: {
    headerLangButton: "Język",
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
    footerBuiltWith: "Stworzone z ♥ przez Ferrana"
  },

  tr: {
    headerLangButton: "Dil",
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
    footerBuiltWith: "♥ ile geliştirildi – Ferran"
  },

  es: {
    headerLangButton: "Idioma",
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
    footerBuiltWith: "Hecho con ♥ por Ferran"
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

  const d = totalSeconds % 7;
  totalSeconds = (totalSeconds - d) / 7;

  const w = totalSeconds % 4;
  totalSeconds = (totalSeconds - w) / 4;

  const m = totalSeconds % 12;
  const y = (totalSeconds - m) / 12;

  return { y, m, w, d, h, min, s };
}

function formatAge(lang) {
  const units = AGE_UNITS[lang] || AGE_UNITS[DEFAULT_LANG];
  const { y, m, w, d, h, min, s } = computeAgeComponents(new Date());

  // show full chain: years to seconds
  const parts = [
    `${y}${units.y}`,
    `${m}${units.m}`,
    `${w}${units.w}`,
    `${d}${units.d}`,
    `${h}${units.h}`,
    `${min}${units.min}`,
    `${s}${units.s}`
  ];

  return parts.join(" ");
}

/* ---------- Repo display name prettifier ---------- */

const LOWERCASE_WORDS = new Set([
  "voor",
  "na",
  "met",
  "door",
  "van",
  "en",
  "of",
  "de",
  "het",
  "een",
  "der",
  "den",
  "und",
  "mit",
  "für",
  "im",
  "am",
  "an",
  "vom",
  "del",
  "la",
  "el",
  "y",
  "con",
  "por"
]);

function prettifyRepoName(name) {
  if (!name) return "";

  const cleaned = name.replace(/[-_]+/g, " ");
  const parts = cleaned.split(/\s+/);

  return parts
    .map((raw, index) => {
      const lower = raw.toLowerCase();
      if (lower === "ios") return "iOS";
      if (lower === "html") return "HTML";
      if (lower === "css") return "CSS";
      if (lower === "js") return "JS";
      if (lower === "api" || lower === "apis") return lower.toUpperCase();
      if (lower === "c#") return "C#";
      if (lower === "c++") return "C++";
      if (lower === "php") return "PHP";

      if (LOWERCASE_WORDS.has(lower) && index !== 0) return lower;

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

/* ---------- Tag enrichment (no language duplication) ---------- */

function deriveExtraTags(project) {
  // Only use tags explicitly defined in projects.json
  const tags = new Set(
    Array.isArray(project.tags) ? project.tags.filter(Boolean) : []
  );
  return Array.from(tags);
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

  // Search placeholder depends on current view
  const searchInput = document.getElementById("search");
  if (searchInput) {
    const placeholderKey =
      currentView === "media"
        ? "searchMediaPlaceholder"
        : "searchProjectsPlaceholder";
    if (t[placeholderKey]) {
      searchInput.placeholder = t[placeholderKey];
    }
  }

  // Footer text
  const footerBuilt = document.querySelector("[data-i18n-footer-built]");
  if (footerBuilt && t.footerBuiltWith) {
    footerBuilt.textContent = t.footerBuiltWith;
  }

  // Tabs labels
  const projectsTab = document.getElementById("projectsTab");
  const mediaTab = document.getElementById("mediaTab");
  if (projectsTab && t.tabProjects) projectsTab.textContent = t.tabProjects;
  if (mediaTab && t.tabMedia) mediaTab.textContent = t.tabMedia;

  // Top-right language button label
  const headerLangLabel = document.querySelector(
    ".lang-switch-label[data-i18n='headerLangButton']"
  );
  if (headerLangLabel && t.headerLangButton) {
    headerLangLabel.textContent = t.headerLangButton;
  }
}

/* ---------- Language helpers ---------- */

function detectInitialLang() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  } catch (_) {}

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
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (_) {}
  setActiveLangButton(lang);
  applyTranslations(lang);
}

function initLanguageGate() {
  const gate = document.getElementById("langGate");
  if (!gate) return;

  let alreadySeen = false;
  try {
    alreadySeen = localStorage.getItem(LANG_GATE_SEEN_KEY) === "1";
  } catch (_) {}

  if (alreadySeen) {
    gate.style.display = "none";
  }

  gate.querySelectorAll(".btn-lang[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
      try {
        localStorage.setItem(LANG_GATE_SEEN_KEY, "1");
      } catch (_) {}
      gate.style.display = "none";
    });
  });
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
  tabsEl;

// modal refs
let imageModal,
  imageModalImg,
  imageModalCaption,
  imageModalDownload,
  imageModalOpen,
  imageModalShare,
  imageModalClose;

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

/* ---------- Thumbnail chooser via GitHub API ---------- */

const THUMB_PRIORITY_NAMES = [
  "logo.png",
  "logo.jpg",
  "logo.jpeg",
  "favicon.png",
  "favicon.jpg",
  "favicon.ico",
  "icon.png",
  "icon.jpg",
  "icon.jpeg",
  "thumbnail.png",
  "thumbnail.jpg",
  "preview.png",
  "preview.jpg",
  "sequencediagram.png",
  "sequencediagram1.png",
  "sequencediagram.jpg",
  "sequencediagram1.jpg"
];

async function ensureThumbnailForProject(project) {
  if (!project || !project.name) return null;

  const repoName = project.name;
  const now = Date.now();

  const cached = thumbCache[repoName];
  if (cached && now - cached.ts < THUMB_CACHE_TTL_MS) {
    return cached.url || null;
  }

  try {
    const contentsRes = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${encodeURIComponent(
        repoName
      )}/contents`
    );
    if (!contentsRes.ok) {
      thumbCache[repoName] = { url: null, ts: now };
      saveThumbCache();
      return null;
    }

    const items = await contentsRes.json();
    if (!Array.isArray(items)) {
      thumbCache[repoName] = { url: null, ts: now };
      saveThumbCache();
      return null;
    }

    let imageFiles = items.filter(
      (it) =>
        it.type === "file" &&
        /\.(png|jpe?g|webp|gif)$/i.test(it.name || "")
    );

    // If no images in root, check /images folder
    if (!imageFiles.length) {
      const imagesDir = items.find(
        (it) => it.type === "dir" && (it.name || "").toLowerCase() === "images"
      );
      if (imagesDir && imagesDir.url) {
        const imagesRes = await fetch(imagesDir.url);
        if (imagesRes.ok) {
          const imgItems = await imagesRes.json();
          if (Array.isArray(imgItems)) {
            imageFiles = imgItems.filter(
              (it) =>
                it.type === "file" &&
                /\.(png|jpe?g|webp|gif)$/i.test(it.name || "")
            );
          }
        }
      }
    }

    if (!imageFiles.length) {
      thumbCache[repoName] = { url: null, ts: now };
      saveThumbCache();
      return null;
    }

    const lowerMap = new Map(
      imageFiles.map((f) => [(f.name || "").toLowerCase(), f])
    );

    let chosen = null;
    for (const candidate of THUMB_PRIORITY_NAMES) {
      const match = lowerMap.get(candidate);
      if (match) {
        chosen = match;
        break;
      }
    }

    if (!chosen) {
      chosen = imageFiles[0];
    }

    const url = chosen.download_url || chosen.html_url || null;
    thumbCache[repoName] = { url, ts: now };
    saveThumbCache();
    return url;
  } catch (err) {
    console.error("Thumbnail fetch failed for", project.name, err);
    thumbCache[repoName] = { url: null, ts: now };
    saveThumbCache();
    return null;
  }
}

function loadAndApplyThumbnail(thumbEl, project) {
  ensureThumbnailForProject(project).then((url) => {
    if (!url || !thumbEl.isConnected) return;

    thumbEl.classList.add("has-image");
    thumbEl.innerHTML = "";
    const img = document.createElement("img");
    img.src = url;
    img.alt = project.name || "";
    img.loading = "lazy";
    thumbEl.appendChild(img);

    thumbEl.addEventListener("click", () => {
      openImageModal({ src: url, title: project.name || "" });
    });
  });
}

/* ---------- Media modal ---------- */

function initImageModal() {
  if (imageModal) return;

  imageModal = document.getElementById("imageModal");
  if (!imageModal) {
    imageModal = document.createElement("div");
    imageModal.id = "imageModal";
    imageModal.className = "image-modal";
    imageModal.hidden = true;
    document.body.appendChild(imageModal);
  }

  imageModal.innerHTML = `
    <div class="image-modal-inner">
      <figure class="image-modal-figure">
        <img id="imageModalImg" class="image-modal-img" alt="">
        <figcaption id="imageModalCaption" class="image-modal-caption"></figcaption>
      </figure>
      <div class="image-modal-actions">
        <a id="imageModalDownload" class="image-modal-btn" download>Download</a>
        <a id="imageModalOpen" class="image-modal-btn" target="_blank" rel="noopener noreferrer">Open in new tab</a>
        <button id="imageModalShare" class="image-modal-btn" type="button">Share</button>
        <button id="imageModalClose" class="image-modal-btn image-modal-close" type="button">Close</button>
      </div>
    </div>
  `;

  imageModalImg = document.getElementById("imageModalImg");
  imageModalCaption = document.getElementById("imageModalCaption");
  imageModalDownload = document.getElementById("imageModalDownload");
  imageModalOpen = document.getElementById("imageModalOpen");
  imageModalShare = document.getElementById("imageModalShare");
  imageModalClose = document.getElementById("imageModalClose");

  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      closeImageModal();
    }
  });

  if (imageModalClose) {
    imageModalClose.addEventListener("click", () => closeImageModal());
  }

  // clicking the big image closes again (minimize)
  if (imageModalImg) {
    imageModalImg.addEventListener("click", () => closeImageModal());
  }

  if (imageModalShare) {
    imageModalShare.addEventListener("click", async () => {
      if (!imageModalOpen) return;
      const url = imageModalOpen.href;
      const title = imageModalCaption?.textContent || "Media";
      if (navigator.share) {
        try {
          await navigator.share({ title, url });
        } catch (_) {}
      } else {
        try {
          await navigator.clipboard.writeText(url);
          imageModalShare.textContent = "Link copied!";
          setTimeout(() => {
            imageModalShare.textContent = "Share";
          }, 1200);
        } catch (_) {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !imageModal.hidden) {
      closeImageModal();
    }
  });
}

function openImageModal(item) {
  if (!item || !item.src) {
    return;
  }

  initImageModal();

  if (!imageModal || !imageModalImg) {
    // hard fallback: just open in new tab
    window.open(item.src, "_blank", "noopener,noreferrer");
    return;
  }

  const src = item.src;
  const title = item.title || "";
  imageModalImg.src = src;
  imageModalImg.alt = title || "Media";

  if (imageModalCaption) {
    imageModalCaption.textContent = title || src;
  }

  if (imageModalDownload) {
    imageModalDownload.href = src;
    imageModalDownload.download = src.split("/").pop() || "media";
  }

  if (imageModalOpen) {
    imageModalOpen.href = src;
  }

  imageModal.hidden = false;
}

function closeImageModal() {
  if (!imageModal) return;
  imageModal.hidden = true;
}

/* ---------- Rendering: Projects ---------- */

function renderProjects() {
  if (!projectsGrid || !projectsEmpty) return;

  const search = state.search.trim().toLowerCase();
  const type = state.typeFilter;
  const langFilter = state.languageFilter;

  const filtered = allProjects.filter((p) => {
    const derivedTags = deriveExtraTags(p);
    const baseTags =
      Array.isArray(p.tags) && p.tags.length ? p.tags.join(" ") : "";
    const tagsText = `${baseTags} ${derivedTags.join(" ")}`.toLowerCase();

    const displayName = prettifyRepoName(p.name || "");

    const inSearch =
      !search ||
      displayName.toLowerCase().includes(search) ||
      (p.name || "").toLowerCase().includes(search) ||
      (p.description || "").toLowerCase().includes(search) ||
      (p.language || "").toLowerCase().includes(search) ||
      tagsText.includes(search);

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

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS[DEFAULT_LANG];

  filtered.forEach((p) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const titleRow = document.createElement("div");
    titleRow.className = "project-title-row";

    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "project-thumb";

    const niceName = prettifyRepoName(p.name || "");
    const displayForLetter = niceName || p.name || "?";

    const span = document.createElement("span");
    span.textContent = displayForLetter.charAt(0).toUpperCase();
    thumb.appendChild(span);

    const titleText = document.createElement("div");
    titleText.className = "project-title-text";

    const title = document.createElement("h3");
    title.className = "project-title";
    title.textContent = niceName;

    const lang = document.createElement("div");
    lang.className = "project-lang";
    lang.textContent = p.language || "";

    titleText.appendChild(title);
    titleText.appendChild(lang);

    titleRow.appendChild(thumb);
    titleRow.appendChild(titleText);
    card.appendChild(titleRow);

    const desc = document.createElement("p");
    desc.className = "project-desc";
    desc.textContent = p.description || "";
    card.appendChild(desc);

    const meta = document.createElement("div");
    meta.className = "project-meta";

    const typeKey = deriveProjectType(p);
    const typeMap = {
      website: t.typeWebsite,
      mobile: t.typeMobile,
      api: t.typeApi,
      school: t.typeSchool,
      other: t.typeOther
    };
    const typeBadge = document.createElement("span");
    typeBadge.className = "badge badge-type";
    typeBadge.textContent = typeMap[typeKey] || t.typeOther;
    meta.appendChild(typeBadge);

    // extra tags (no languages auto-added)
    const extraTags = deriveExtraTags(p);
    extraTags.forEach((tag) => {
      if (!tag) return;
      const tagBadge = document.createElement("span");
      tagBadge.className = "badge";
      tagBadge.textContent = tag;
      meta.appendChild(tagBadge);
    });

    const hasLive = p.hasPages && p.pagesUrl;

    if (hasLive) {
      const live = document.createElement("a");
      live.href = p.pagesUrl;
      live.target = "_blank";
      live.rel = "noopener noreferrer";
      live.className = "btn-card btn-card-live";
      live.innerHTML = `<span>Live site</span>`;
      meta.appendChild(live);
    }

    if (p.name && !hasLive) {
      const repoLink = document.createElement("a");
      repoLink.href = `https://github.com/${GITHUB_USER}/${encodeURIComponent(
        p.name
      )}`;
      repoLink.target = "_blank";
      repoLink.rel = "noopener noreferrer";
      repoLink.className = "btn-card";
      repoLink.textContent = "GitHub";
      meta.appendChild(repoLink);
    }

    card.appendChild(meta);
    projectsGrid.appendChild(card);

    // Try to upgrade thumbnail asynchronously using repo root images
    loadAndApplyThumbnail(thumb, p);
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
    card.appendChild(title);

    const wrapper = document.createElement("div");
    wrapper.className = "media-preview";

    const src = item.src;

    if (item.type === "image") {
      const img = document.createElement("img");
      img.src = src;
      img.alt = item.title || "";
      img.loading = "lazy";
      wrapper.appendChild(img);
      wrapper.classList.add("clickable");

      // click on whole preview (including image) opens modal
      wrapper.addEventListener("click", () => {
        openImageModal(item);
      });
    } else if (item.type === "video") {
      const video = document.createElement("video");
      video.controls = true;
      video.src = src;
      video.preload = "metadata";
      wrapper.appendChild(video);
    } else if (item.type === "audio") {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.src = src;
      audio.preload = "metadata";
      wrapper.appendChild(audio);
    }

    card.appendChild(wrapper);

    const meta = document.createElement("div");
    meta.className = "media-meta";

    const typeSpan = document.createElement("span");
    typeSpan.className = "badge badge-media-type";
    typeSpan.textContent = item.type || "";

    const fmtSpan = document.createElement("span");
    fmtSpan.className = "badge badge-media-format";
    fmtSpan.textContent = getMediaFormat(item) || "-";

    meta.appendChild(typeSpan);
    meta.appendChild(fmtSpan);
    card.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "media-actions";

    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.className = "media-action-btn";
    viewBtn.textContent = item.type === "image" ? "View" : "Open";
    viewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (item.type === "image") {
        openImageModal(item);
      } else {
        window.open(src, "_blank", "noopener,noreferrer");
      }
    });
    actions.appendChild(viewBtn);

    const downloadLink = document.createElement("a");
    downloadLink.className = "media-action-btn";
    downloadLink.href = src;
    downloadLink.download = src.split("/").pop() || "media";
    downloadLink.textContent = "Download";
    actions.appendChild(downloadLink);

    card.appendChild(actions);
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

  if (projectFiltersEl) {
    projectFiltersEl.hidden = currentView !== "projects";
  }
  if (mediaFiltersEl) {
    mediaFiltersEl.hidden = currentView !== "media";
  }

  if (tabsEl) {
    tabsEl.classList.toggle("tabs-media", currentView === "media");
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

  tabsEl = document.querySelector(".tabs");

  // modal base element if present
  imageModal = document.getElementById("imageModal");
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

  // language buttons (gate + any other .btn-lang)
  document.querySelectorAll(".btn-lang[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
    });
  });

  // top-right language pill opens the gate
  const langSwitchBtn = document.getElementById("headerLangButton");
  if (langSwitchBtn) {
    langSwitchBtn.addEventListener("click", () => {
      const gate = document.getElementById("langGate");
      if (gate) {
        gate.style.display = "flex";
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
  document.body.classList.add("js-enabled");

  initDomRefs();

  currentLang = detectInitialLang();
  setLanguage(currentLang);

  initLanguageGate();
  initEvents();
  initImageModal();

  setView("projects");

  loadProjects();
  loadMedia();
});
