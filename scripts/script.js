// scripts/script.js

/* ---------- Language + global view state ---------- */

const SUPPORTED_LANGS = ["nl", "en", "de", "pl", "tr", "es"];
const DEFAULT_LANG = "nl";
const LANG_STORAGE_KEY = "ferranProjectsLang";
const LANG_GATE_SEEN_KEY = "ferranProjectsLangSeenGate";

const LANGUAGE_NAMES = {
  nl: "Nederlands",
  en: "English",
  de: "Deutsch",
  pl: "Polski",
  tr: "Türkçe",
  es: "Español",
};

// which tab is active: "projects" or "media"
let currentView = "projects";
// current language
let currentLang = DEFAULT_LANG;

// Birthday: 15-08-1999 23:10 local (Amsterdam time)
const BIRTH_DATE = new Date(1999, 7, 15, 23, 10); // month 7 = August

// Units per language
const AGE_UNITS = {
  nl: { y: "j", m: "mnd", d: "d", h: "u", min: "min", s: "s" },
  en: { y: "y", m: "mo", d: "d", h: "h", min: "m", s: "s" },
  de: { y: "J", m: "M", d: "T", h: "Std", min: "Min", s: "s" },
  pl: { y: "l", m: "m", d: "d", h: "g", min: "min", s: "s" },
  tr: { y: "y", m: "ay", d: "g", h: "sa", min: "dk", s: "sn" },
  es: { y: "a", m: "m", d: "d", h: "h", min: "min", s: "s" },
};

/* ---------- Translations (with 🇳🇱 flag) ---------- */

const TRANSLATIONS = {
  en: {
    subtitle:
      "All my programming & coding projects in one place – websites, apps, school work, guides, APIs and more.",
    aboutTitle: "About Me",
    // 🇳🇱 flag here
    aboutP1:
      "Hey Ferran ({age}) here. I am a Dutch 🇳🇱 developer from Utrecht / 's-Hertogenbosch. I like building websites, apps and small tools to help myself and others.",
    aboutP2: "",
    tabProjects: "Projects",
    tabMedia: "Media",
    searchProjectsPlaceholder:
      "Search by name, description, language or tag…",
    searchMediaPlaceholder:
      "Search media by title, filename or type…",
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
      "No projects match your search/filter. Try another search term.",
    mediaEmptyState:
      "No media match your search/filter. Try another search term.",
    footerBuiltWith: "Built with ♥ by Ferran",
    footerViewOnPages: "View this site on GitHub Pages",
  },

  nl: {
    subtitle:
      "Al mijn programmeer- en codeprojecten op één plek – websites, apps, schoolopdrachten, guides, API’s en meer.",
    aboutTitle: "Over mij",
    // 🇳🇱 flag here
    aboutP1:
      "Hey Ferran ({age}) hier. Ik ben een Nederlandse 🇳🇱 developer uit Utrecht / ’s-Hertogenbosch. Ik bouw graag websites, apps en kleine tools om mezelf en anderen te helpen.",
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
      "Geen projecten gevonden met deze zoekopdracht of filters. Probeer iets anders.",
    mediaEmptyState:
      "Geen media gevonden met deze zoekopdracht of filters.",
    footerBuiltWith: "Gemaakt met ♥ door Ferran",
    footerViewOnPages: "Bekijk deze site op GitHub Pages",
  },

  de: {
    subtitle:
      "Alle meine Programmier- und Coding-Projekte an einem Ort – Websites, Apps, Studienprojekte, Guides, APIs und mehr.",
    aboutTitle: "Über mich",
    // 🇳🇱 flag here
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
      "Keine Projekte für diese Suche oder Filter. Bitte etwas anderes versuchen.",
    mediaEmptyState:
      "Keine Medien für diese Suche oder Filter.",
    footerBuiltWith: "Mit ♥ erstellt von Ferran",
    footerViewOnPages: "Diese Seite auf GitHub Pages ansehen",
  },

  pl: {
    subtitle:
      "Wszystkie moje projekty programistyczne w jednym miejscu – strony WWW, aplikacje, zadania ze szkoły, poradniki, API i więcej.",
    aboutTitle: "O mnie",
    // 🇳🇱 flag here
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
      "Brak projektów dla tych filtrów. Spróbuj innego wyszukiwania.",
    mediaEmptyState:
      "Brak mediów dla tych filtrów.",
    footerBuiltWith: "Stworzone z ♥ przez Ferrana",
    footerViewOnPages: "Zobacz tę stronę na GitHub Pages",
  },

  tr: {
    subtitle:
      "Tüm programlama projelerim tek bir yerde – web siteleri, uygulamalar, okul projeleri, rehberler, API’ler ve daha fazlası.",
    aboutTitle: "Hakkımda",
    // 🇳🇱 flag here
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
      "Bu arama / filtre ile eşleşen proje yok. Başka bir şey dene.",
    mediaEmptyState:
      "Bu arama / filtre ile eşleşen medya yok.",
    footerBuiltWith: "♥ ile geliştirildi – Ferran",
    footerViewOnPages:
      "Bu siteyi GitHub Pages üzerinde görüntüle",
  },

  es: {
    subtitle:
      "Todos mis proyectos y media en un solo lugar: repos de GitHub, webs, apps, trabajos de estudio, experimentos de código y más.",
    aboutTitle: "Sobre mí",
    // 🇳🇱 flag here
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
      "No hay proyectos para esta búsqueda o filtros.",
    mediaEmptyState:
      "No hay media para esta búsqueda o filtros.",
    footerBuiltWith: "Hecho con ♥ por Ferran",
    footerViewOnPages:
      "Ver este sitio en GitHub Pages",
  },
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

  // approximate months/years (good enough for a fun live timer)
  const d = totalSeconds % 30;
  totalSeconds = (totalSeconds - d) / 30;

  const m = totalSeconds % 12;
  const y = (totalSeconds - m) / 12;

  return { y, m, d, h, min, s };
}

function formatAge(lang) {
  const units = AGE_UNITS[lang] || AGE_UNITS[DEFAULT_LANG];
  const { y, m, d, h, min, s } = computeAgeComponents(new Date());
  const parts = [];

  if (y) parts.push(`${y}${units.y}`);
  if (m) parts.push(`${m}${units.m}`);
  if (!y && !m && d) parts.push(`${d}${units.d}`);
  if (!y && !m && !d && h) parts.push(`${h}${units.h}`);
  if (!y && !m && !d && !h && min) parts.push(`${min}${units.min}`);
  if (!y && !m && !d && !h && !min) parts.push(`${s}${units.s}`);

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

    // Use textContent; if you need inner HTML for links, don’t mark those elements with data-i18n
    el.textContent = value;
  });

  // Update search placeholder based on active view
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

  // Footer lines (if present)
  const footerBuilt = document.querySelector("[data-i18n-footer-built]");
  const footerPages = document.querySelector("[data-i18n-footer-pages]");
  if (footerBuilt && t.footerBuiltWith) {
    footerBuilt.textContent = t.footerBuiltWith;
  }
  if (footerPages && t.footerViewOnPages) {
    footerPages.textContent = t.footerViewOnPages;
  }
}

/* ---------- Language init & switch ---------- */

function detectInitialLang() {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && SUPPORTED_LANGS.includes(stored)) {
    return stored;
  }
  const navLang = (navigator.language || "").slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGS.includes(navLang)) {
    return navLang;
  }
  return DEFAULT_LANG;
}

function setActiveLangButton(lang) {
  document
    .querySelectorAll("[data-lang]")
    .forEach((btn) => btn.classList.remove("active"));

  const btn = document.querySelector(`[data-lang="${lang}"]`);
  if (btn) {
    btn.classList.add("active");
  }
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

  gate
    .querySelectorAll("[data-lang]")
    .forEach((btn) =>
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        setLanguage(lang);
        localStorage.setItem(LANG_GATE_SEEN_KEY, "1");
        gate.style.display = "none";
      })
    );
}

/* ---------- View state & filters ---------- */

const state = {
  search: "",
  typeFilter: "all",
  languageFilter: "all",
  mediaTypeFilter: "all",
  mediaFormatFilter: "all",
};

let allProjects = [];
let allMedia = [];

// DOM refs (will be null if elements don’t exist – guarded in code)
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
  mediaView;

/* ---------- Data helpers ---------- */

const PROJECTS_URL = "./projects.json";
const MEDIA_URL = "./media/media-index.json";

function deriveProjectType(project) {
  const name = (project.name || "").toLowerCase();
  const desc = (project.description || "").toLowerCase();
  const lang = (project.language || "").toLowerCase();

  // website
  if (
    project.hasPages ||
    ["html", "scss", "less", "php"].includes(lang) ||
    desc.includes("website")
  ) {
    return "website";
  }

  // mobile
  if (
    ["java", "swift", "kotlin"].includes(lang) ||
    name.includes("android") ||
    name.includes("ios")
  ) {
    return "mobile";
  }

  // api / backend
  if (
    desc.includes("api") ||
    desc.includes("rest") ||
    desc.includes("backend")
  ) {
    return "api";
  }

  // school / study
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

/* ---------- Rendering ---------- */

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

    const title = document.createElement("h3");
    title.className = "project-title";
    title.textContent = p.name || "";

    const lang = document.createElement("div");
    lang.className = "project-lang";
    lang.textContent = p.language || "";

    const desc = document.createElement("p");
    desc.className = "project-desc";
    desc.textContent = p.description || "";

    const meta = document.createElement("div");
    meta.className = "project-meta";

    // Type badge
    const typeBadge = document.createElement("span");
    typeBadge.className = `badge badge-type badge-type-${deriveProjectType(
      p
    )}`;
    typeBadge.textContent = (function () {
      const t = TRANSLATIONS[currentLang] || TRANSLATIONS[DEFAULT_LANG];
      const map = {
        website: t.typeWebsite,
        mobile: t.typeMobile,
        api: t.typeApi,
        school: t.typeSchool,
        other: t.typeOther,
      };
      return map[deriveProjectType(p)] || t.typeOther;
    })();

    meta.appendChild(typeBadge);

    // Live site link if hasPages
    if (p.hasPages && p.pagesUrl) {
      const link = document.createElement("a");
      link.href = p.pagesUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "btn-card btn-card-live";
      link.textContent = "Live site";
      meta.appendChild(link);
    }

    // GitHub repo link
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

    card.appendChild(title);
    card.appendChild(lang);
    card.appendChild(desc);
    card.appendChild(meta);

    projectsGrid.appendChild(card);
  });
}

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

    const src = item.src;

    if (item.type === "image") {
      const img = document.createElement("img");
      img.src = src;
      img.alt = item.title || "";
      img.loading = "lazy";
      wrapper.appendChild(img);
    } else if (item.type === "video") {
      const video = document.createElement("video");
      video.controls = true;
      video.src = src;
      wrapper.appendChild(video);
    } else if (item.type === "audio") {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.src = src;
      wrapper.appendChild(audio);
    }

    const meta = document.createElement("div");
    meta.className = "media-meta";
    const typeSpan = document.createElement("span");
    typeSpan.className = "badge badge-media-type";
    typeSpan.textContent = item.type;

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

  if (projectFiltersEl) {
    projectFiltersEl.hidden = currentView !== "projects";
  }
  if (mediaFiltersEl) {
    mediaFiltersEl.hidden = currentView !== "media";
  }

  // Re-apply translations so the search placeholder switches
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

/* ---------- Event wiring ---------- */

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

  // Header language buttons
  document.querySelectorAll(".btn-lang[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
    });
  });
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

      // Populate language filter (if empty / only "all")
      if (languageSelect) {
        const existingValues = new Set(
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
          if (existingValues.has(lower)) return;
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

      // Populate format filter (if present)
      if (mediaFormatSelect) {
        const formats = Array.from(
          new Set(allMedia.map(getMediaFormat).filter(Boolean))
        ).sort();
        const existingValues = new Set(
          Array.from(mediaFormatSelect.options).map((o) =>
            (o.value || "").toLowerCase()
          )
        );
        formats.forEach((fmt) => {
          if (existingValues.has(fmt.toLowerCase())) return;
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
  initDomRefs();

  currentLang = detectInitialLang();
  setLanguage(currentLang);

  initLanguageGate();
  initEvents();

  // default view is projects
  setView("projects");

  // load data
  loadProjects();
  loadMedia();

  // live age update
  setInterval(() => {
    applyTranslations(currentLang);
  }, 1000);
});
