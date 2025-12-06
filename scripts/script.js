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

// Birthday: 15-08-1999 23:10 local (Amsterdam time)
const BIRTH_DATE = new Date(1999, 7, 15, 23, 10); // month 7 = August
let currentLang = DEFAULT_LANG;

// Units per language
const AGE_UNITS = {
  nl: { y: "j", m: "mnd", d: "d", h: "u", min: "min", s: "s" },
  en: { y: "y", m: "mo", d: "d", h: "h", min: "m", s: "s" },
  de: { y: "J", m: "M", d: "T", h: "Std", min: "Min", s: "s" },
  pl: { y: "l", m: "m", d: "d", h: "g", min: "min", s: "s" },
  tr: { y: "y", m: "ay", d: "g", h: "sa", min: "dk", s: "sn" },
  es: { y: "a", m: "m", d: "d", h: "h", min: "min", s: "s" },
};

const TRANSLATIONS = {
  en: {
    subtitle:
      "All my programming & coding projects in one place – websites, apps, school work, guides, APIs and more.",
    aboutTitle: "About Me",
    aboutP1:
      "Hey 👋🏻 Ferran ({age}) here. I am a Dutch developer from Utrecht / 's-Hertogenbosch. I like building websites, apps and small tools to help myself and others.",
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
    emptyState: "No projects match your search/filter. Try another search term.",
    mediaEmptyState: "No media match your search/filter. Try another search term.",
    footerBuiltWith: "Built with ♥ by Ferran",
    footerViewOnPages: "View this site on GitHub Pages",
  },
  nl: {
    subtitle:
      "Al mijn programmeer- en codeprojecten op één plek – websites, apps, schoolopdrachten, guides, API’s en meer.",
    aboutTitle: "Over mij",
    aboutP1:
      "Hey 👋🏻 Ferran ({age}) hier. Ik ben een Nederlandse developer uit Utrecht / ’s-Hertogenbosch. Ik bouw graag websites, apps en kleine tools om mezelf en anderen te helpen.",
    aboutP2: "",
    tabProjects: "Projecten",
    tabMedia: "Media",
    searchProjectsPlaceholder: "Zoek op naam, beschrijving, taal of tag…",
    searchMediaPlaceholder: "Zoek media op titel, bestandsnaam of type…",
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
    mediaEmptyState: "Geen media gevonden met deze zoekopdracht of filters.",
    footerBuiltWith: "Gemaakt met ♥ door Ferran",
    footerViewOnPages: "Bekijk deze site op GitHub Pages",
  },
  de: {
    subtitle:
      "Alle meine Programmier- und Coding-Projekte an einem Ort – Websites, Apps, Studienprojekte, Guides, APIs und mehr.",
    aboutTitle: "Über mich",
    aboutP1:
      "Hey 👋🏻 hier ist Ferran ({age}). Ich bin ein niederländischer Entwickler aus Utrecht / ’s-Hertogenbosch und baue gerne Websites, Apps und kleine Tools, die mir und anderen helfen.",
    aboutP2: "",
    tabProjects: "Projekte",
    tabMedia: "Medien",
    searchProjectsPlaceholder: "Suche nach Name, Beschreibung, Sprache oder Tag…",
    searchMediaPlaceholder: "Suche Medien nach Titel, Dateiname oder Typ…",
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
    mediaEmptyState: "Keine Medien für diese Suche oder Filter.",
    footerBuiltWith: "Mit ♥ erstellt von Ferran",
    footerViewOnPages: "Diese Seite auf GitHub Pages ansehen",
  },
  pl: {
    subtitle:
      "Wszystkie moje projekty programistyczne w jednym miejscu – strony WWW, aplikacje, zadania ze szkoły, poradniki, API i więcej.",
    aboutTitle: "O mnie",
    aboutP1:
      "Cześć 👋🏻 tu Ferran ({age}). Jestem holenderskim deweloperem z Utrechtu / ’s-Hertogenbosch. Lubię tworzyć strony, aplikacje i małe narzędzia, które pomagają mnie i innym.",
    aboutP2: "",
    tabProjects: "Projekty",
    tabMedia: "Media",
    searchProjectsPlaceholder: "Szukaj po nazwie, opisie, języku lub tagu…",
    searchMediaPlaceholder: "Szukaj mediów po tytule, nazwie pliku lub typie…",
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
    mediaEmptyState: "Brak mediów dla tych filtrów.",
    footerBuiltWith: "Stworzone z ♥ przez Ferrana",
    footerViewOnPages: "Zobacz tę stronę na GitHub Pages",
  },
  tr: {
    subtitle:
      "Tüm programlama projelerim tek bir yerde – web siteleri, uygulamalar, okul projeleri, rehberler, API’ler ve daha fazlası.",
    aboutTitle: "Hakkımda",
    aboutP1:
      "Selam 👋🏻 ben Ferran ({age}). Utrecht / ’s-Hertogenbosch’ta yaşayan Hollandalı bir geliştiriciyim. Kendime ve başkalarına yardımcı olan web siteleri, uygulamalar ve küçük araçlar geliştirmeyi seviyorum.",
    aboutP2: "",
    tabProjects: "Projeler",
    tabMedia: "Medya",
    searchProjectsPlaceholder: "İsme, açıklamaya, dile veya etikete göre ara…",
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
    mediaEmptyState: "Bu arama / filtre ile eşleşen medya yok.",
    footerBuiltWith: "♥ ile geliştirildi – Ferran",
    footerViewOnPages: "Bu siteyi GitHub Pages üzerinde görüntüle",
  },
  es: {
    subtitle:
      "Todos mis proyectos de programación en un solo lugar: webs, apps, trabajos de estudio, guías, APIs y más.",
    aboutTitle: "Sobre mí",
    aboutP1:
      "Hola 👋🏻 soy Ferran ({age}). Desarrollador holandés de Utrecht / ’s-Hertogenbosch. Me gusta crear webs, apps y pequeñas herramientas que ayudan a mí y a otras personas.",
    aboutP2: "",
    tabProjects: "Proyectos",
    tabMedia: "Media",
    searchProjectsPlaceholder:
      "Busca por nombre, descripción, idioma o etiqueta…",
    searchMediaPlaceholder: "Busca medios por título, archivo o tipo…",
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
      "No hay proyectos para esta búsqueda o filtros. Prueba con otros términos.",
    mediaEmptyState: "No hay medios para estos filtros.",
    footerBuiltWith: "Hecho con ♥ por Ferran",
    footerViewOnPages: "Ver este sitio en GitHub Pages",
  },
};

/* ---------- Age calculation ---------- */

function getAgeParts(now = new Date()) {
  let y = now.getFullYear() - BIRTH_DATE.getFullYear();
  let m = now.getMonth() - BIRTH_DATE.getMonth();
  let d = now.getDate() - BIRTH_DATE.getDate();
  let h = now.getHours() - BIRTH_DATE.getHours();
  let min = now.getMinutes() - BIRTH_DATE.getMinutes();
  let s = now.getSeconds() - BIRTH_DATE.getSeconds();

  if (s < 0) {
    s += 60;
    min -= 1;
  }
  if (min < 0) {
    min += 60;
    h -= 1;
  }
  if (h < 0) {
    h += 24;
    d -= 1;
  }
  if (d < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    d += prevMonth.getDate();
    m -= 1;
  }
  if (m < 0) {
    m += 12;
    y -= 1;
  }

  return { y, m, d, h, min, s };
}

function formatAge(parts, lang) {
  const { y, m, d, h, min, s } = parts;
  const units = AGE_UNITS[lang] || AGE_UNITS[DEFAULT_LANG];
  return `${y}${units.y} ${m}${units.m} ${d}${units.d} ${h}${units.h} ${min}${units.min} ${s}${units.s}`;
}

function updateAgeInAbout() {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS[DEFAULT_LANG];
  const tmpl = dict.aboutP1;
  if (!tmpl) return;
  const ageStr = formatAge(getAgeParts(), currentLang);
  const text = tmpl.replace("{age}", ageStr);
  document.querySelectorAll('[data-i18n="aboutP1"]').forEach((el) => {
    el.textContent = text;
  });
}

/* ---------- i18n ---------- */

function applyTranslations(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key || key === "aboutP1") return; // aboutP1 handled separately
    const value = dict[key];
    if (typeof value === "string") {
      el.textContent = value;
    }
  });

  currentLang = lang;
  updateAgeInAbout();
  updateSearchPlaceholderForView();
}

function updateLangLabel(lang) {
  const labelEl = document.getElementById("uiLangLabel");
  if (!labelEl) return;
  const name = LANGUAGE_NAMES[lang] || LANGUAGE_NAMES[DEFAULT_LANG];
  labelEl.textContent = name;
}

function updateSearchPlaceholderForView() {
  const searchEl = document.getElementById("search");
  if (!searchEl) return;
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS[DEFAULT_LANG];
  const key =
    currentView === "projects"
      ? "searchProjectsPlaceholder"
      : "searchMediaPlaceholder";
  if (dict[key]) {
    searchEl.placeholder = dict[key];
  }
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  updateLangLabel(lang);
  applyTranslations(lang);
}

/* ---------- Language UI + gate ---------- */

function setupLanguageUI() {
  const langGateEl = document.getElementById("langGate");
  const gateButtons = document.querySelectorAll(".btn-lang[data-lang]");
  const uiLangButton = document.getElementById("uiLangButton");

  let saved = localStorage.getItem(LANG_STORAGE_KEY);
  if (!saved || !SUPPORTED_LANGS.includes(saved)) {
    saved = DEFAULT_LANG;
  }
  setLanguage(saved);

  const hasSeenGate = localStorage.getItem(LANG_GATE_SEEN_KEY) === "1";
  if (!hasSeenGate && langGateEl) {
    langGateEl.hidden = false;
  } else if (langGateEl) {
    langGateEl.hidden = true;
  }

  gateButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
      if (langGateEl) langGateEl.hidden = true;
      localStorage.setItem(LANG_GATE_SEEN_KEY, "1");
    });
  });

  if (uiLangButton && langGateEl) {
    uiLangButton.addEventListener("click", () => {
      langGateEl.hidden = false;
    });
  }

  if (langGateEl) {
    langGateEl.addEventListener("click", (e) => {
      if (e.target === langGateEl) {
        langGateEl.hidden = true;
      }
    });
  }

  // keep age ticking (every second)
  updateAgeInAbout();
  setInterval(updateAgeInAbout, 1000);
}

/* ---------- Projects logic (GitHub + projects.json) ---------- */

const GITHUB_USER = "ferrannl";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
const PROJECTS_URL = "./projects.json";

const CACHE_KEY = "ferranProjectsCacheV2";
const RATE_LIMIT_KEY = "ferranProjectsRateLimitV2";
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache
const RATE_LIMIT_BACKOFF_MS = 1000 * 60 * 60; // 1 hour after rate-limit

let repos = [];
const state = {
  search: "",
  typeFilter: "all",
  languageFilter: "all",
};

const gridEl = document.getElementById("projectsGrid");
const emptyEl = document.getElementById("emptyState");
const searchEl = document.getElementById("search");
const languageSelectEl = document.getElementById("languageFilter");
const typeChips = document.querySelectorAll(".chip[data-filter-type='type']");

const imageModalEl = document.getElementById("imageModal");
const imageModalImgEl = document.getElementById("imageModalImg");

const SMALL_WORDS = new Set([
  "voor",
  "van",
  "met",
  "en",
  "of",
  "de",
  "het",
  "een",
  "in",
  "op",
  "aan",
  "bij",
]);

const SPECIAL_WORDS = {
  ios: "iOS",
  android: "Android",
  api: "API",
  rest: "REST",
  http: "HTTP",
  https: "HTTPS",
  url: "URL",
  ui: "UI",
  ux: "UX",
};

function isSelfProjectsRepoName(name) {
  return (name || "").toLowerCase() === "projects";
}

function prettifyName(raw) {
  if (!raw) return "";

  let s = raw.replace(/[-_.]+/g, " ");

  const IOS_PLACEHOLDER = "__IOS__";
  s = s.replace(/iOS|IOS|Ios|ioS/gi, IOS_PLACEHOLDER);

  s = s.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  s = s.replace(/\s+/g, " ").trim();

  let words = s.split(" ").map((w) => w.trim());

  words = words.map((w) => (w === IOS_PLACEHOLDER ? "iOS" : w));

  return words
    .map((w, i) => {
      const lw = w.toLowerCase();

      if (lw === "ios") return "iOS";
      if (SPECIAL_WORDS[lw]) return SPECIAL_WORDS[lw];

      if (i > 0 && SMALL_WORDS.has(lw)) return lw;

      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function choosePrimaryType(types) {
  if (!types || !types.length) return "other";
  const order = ["website", "mobile", "api", "school", "other"];
  const found = order.find((t) => types.includes(t));
  return found || types[0];
}

function inferTypesFromGitHub(repo) {
  const types = [];
  const name = (repo.name || "").toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const lang = (repo.language || "").toLowerCase();

  const looksWebLang = ["html", "css", "javascript", "typescript", "php"].includes(
    lang
  );
  const looksMobileText =
    name.includes("android") ||
    desc.includes("android") ||
    name.includes("ios") ||
    desc.includes("ios");
  const looksMobileLang = ["swift", "java", "kotlin"].includes(lang);
  const seemsSchool =
    desc.includes("assignment") ||
    desc.includes("project") ||
    desc.includes("internship") ||
    desc.includes("final") ||
    desc.includes("cppls") ||
    desc.includes("devops");

  if (repo.has_pages || looksWebLang) types.push("website");
  if (looksMobileText || looksMobileLang) types.push("mobile");
  if (name.includes("api") || desc.includes("api")) types.push("api");
  if (seemsSchool) types.push("school");
  if (!types.length) types.push("other");
  return [...new Set(types)];
}

function inferTypesFromEntry(entry) {
  const types = [];
  const lang = (entry.language || "").toLowerCase();
  const name = (entry.name || "").toLowerCase();
  const desc = (entry.description || "").toLowerCase();

  const looksWebLang = ["html", "css", "javascript", "typescript", "php"].includes(
    lang
  );
  const looksMobileText =
    name.includes("android") ||
    desc.includes("android") ||
    name.includes("ios") ||
    desc.includes("ios");
  const looksMobileLang = ["swift", "java", "kotlin"].includes(lang);
  const seemsSchool =
    desc.includes("assignment") ||
    desc.includes("project") ||
    desc.includes("internship") ||
    desc.includes("final") ||
    desc.includes("cppls") ||
    desc.includes("devops");

  if (looksWebLang) types.push("website");
  if (looksMobileText || looksMobileLang) types.push("mobile");
  if (name.includes("api") || desc.includes("api")) types.push("api");
  if (seemsSchool) types.push("school");
  if (!types.length) types.push("other");
  return [...new Set(types)];
}

function getTypeLabel(type) {
  switch (type) {
    case "website":
      return "Website";
    case "mobile":
      return "Mobile App";
    case "api":
      return "API / Backend";
    case "school":
      return "School / Study";
    default:
      return "Other";
  }
}

function buildTagsBase(type, language) {
  const tags = [];
  const langLower = (language || "").toLowerCase();

  if (type === "website") tags.push("web");
  if (type === "mobile") tags.push("mobile");
  if (type === "api") tags.push("api");
  if (type === "school") {
    tags.push("school");
    if (["html", "css", "javascript", "typescript", "php"].includes(langLower)) {
      tags.push("web");
    }
  }

  return tags;
}

function computeLanguages(primaryLang, rawName, desc, typeOrTypes) {
  const langs = [];
  const main = primaryLang || "Various";
  const descL = (desc || "").toLowerCase();
  const nameL = (rawName || "").toLowerCase();

  if (!main || main === "Various") {
    langs.push(main);
    return langs;
  }

  const l = main.toLowerCase();

  if (l === "html") {
    langs.push("HTML", "CSS", "JavaScript");
  } else if (l === "css") {
    langs.push("CSS", "HTML", "JavaScript");
  } else if (l === "javascript") {
    const types = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes];
    const hasWebsite = types.includes("website");
    if (hasWebsite) {
      langs.push("JavaScript", "HTML", "CSS");
    } else {
      langs.push("JavaScript");
    }
  } else if (l === "typescript") {
    langs.push("TypeScript", "JavaScript");
  } else if (l === "c++") {
    langs.push("C++", "C");
  } else if (l === "c#") {
    langs.push("C#");
    if (descL.includes("asp.net") || nameL.includes("asp.net")) {
      langs.push("ASP.NET");
    } else {
      langs.push(".NET");
    }
  } else {
    langs.push(main);
  }

  const unique = [...new Set(langs)];
  return unique.slice(0, 3);
}

function mapRepoFromGitHub(repo) {
  const types = inferTypesFromGitHub(repo);
  const primaryType = choosePrimaryType(types);

  const baseDesc = repo.description || "No description yet.";
  const primaryLang = repo.language || "Various";
  const languages = computeLanguages(primaryLang, repo.name, repo.description, types);

  const pagesUrl = repo.has_pages
    ? `https://${GITHUB_USER}.github.io/${repo.name}/`
    : null;

  let tags = [];
  types.forEach((t) => {
    tags = tags.concat(buildTagsBase(t, primaryLang));
  });
  tags = [...new Set(tags)];

  return {
    rawName: repo.name,
    displayName: prettifyName(repo.name),
    language: languages[0] || "Various",
    languages,
    types,
    primaryType,
    type: primaryType,
    tags,
    githubUrl: repo.html_url,
    pagesUrl,
    hasLiveSite: !!pagesUrl,
    baseDescription: baseDesc,
    summary: baseDesc,
    thumbnailUrl: null,
  };
}

function mapEntryToProject(entry) {
  const types = inferTypesFromEntry(entry);
  const primaryType = choosePrimaryType(types);

  const baseDesc = entry.description || "No description yet.";
  const hasPagesFlag = !!entry.hasPages;
  const customPagesUrl = entry.pagesUrl;
  const primaryLang = entry.language || "Various";
  const languages = computeLanguages(
    primaryLang,
    entry.name,
    entry.description,
    types
  );

  let tagsFromType = [];
  types.forEach((t) => {
    tagsFromType = tagsFromType.concat(buildTagsBase(t, primaryLang));
  });
  tagsFromType = [...new Set(tagsFromType)];

  const extraTags = entry.tags ? entry.tags : [];
  const mergedTags = [...new Set([...tagsFromType, ...extraTags])];

  let thumbnailUrl = null;
  if (entry.thumbnailUrl && entry.thumbnailUrl.trim()) {
    thumbnailUrl = entry.thumbnailUrl.trim();
  }

  const pagesUrl = hasPagesFlag
    ? customPagesUrl || `https://${GITHUB_USER}.github.io/${entry.name}/`
    : null;

  return {
    rawName: entry.name,
    displayName: prettifyName(entry.name),
    language: languages[0] || "Various",
    languages,
    types,
    primaryType,
    type: primaryType,
    tags: mergedTags,
    githubUrl: `https://github.com/${GITHUB_USER}/${entry.name}`,
    pagesUrl,
    hasLiveSite: !!pagesUrl,
    baseDescription: baseDesc,
    summary: baseDesc,
    thumbnailUrl,
  };
}

/* ---------- Filter / search (projects) ---------- */

function matchesProjectFilters(project) {
  const rawName = project.rawName || "";
  if (isSelfProjectsRepoName(rawName)) return false;

  const projectTypes =
    project.types && project.types.length
      ? project.types
      : project.type
      ? [project.type]
      : [];

  if (state.typeFilter !== "all") {
    if (!projectTypes.includes(state.typeFilter)) return false;
  }

  if (state.languageFilter !== "all") {
    const langs =
      project.languages && project.languages.length
        ? project.languages
        : project.language
        ? [project.language]
        : [];
    const matchLang = langs.some(
      (l) => (l || "").toLowerCase() === state.languageFilter.toLowerCase()
    );
    if (!matchLang) return false;
  }

  if (state.search) {
    const haystack = [
      project.rawName,
      project.displayName,
      project.summary,
      project.language,
      project.type,
      ...(project.languages || []),
      ...(project.tags || []),
      ...(project.types || []),
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(state.search)) return false;
  }

  return true;
}

/* ---------- Modal ---------- */

function openImageModal(url, alt) {
  if (!imageModalEl || !imageModalImgEl) return;
  imageModalImgEl.src = url;
  imageModalImgEl.alt = alt || "";
  imageModalEl.hidden = false;
}

function closeImageModal() {
  if (!imageModalEl || !imageModalImgEl) return;
  imageModalImgEl.src = "";
  imageModalImgEl.alt = "";
  imageModalEl.hidden = true;
}

if (imageModalEl) {
  imageModalEl.addEventListener("click", closeImageModal);
}

/* ---------- Project cards ---------- */

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";

  const titleRow = document.createElement("div");
  titleRow.className = "project-title-row";

  if (project.thumbnailUrl) {
    const thumbBtn = document.createElement("button");
    thumbBtn.className = "project-thumb has-image";
    thumbBtn.type = "button";

    const thumbImg = document.createElement("img");
    thumbImg.src = project.thumbnailUrl;
    thumbImg.alt = `${project.displayName} thumbnail`;
    thumbBtn.appendChild(thumbImg);

    thumbBtn.addEventListener("click", () =>
      openImageModal(project.thumbnailUrl, project.displayName)
    );

    titleRow.appendChild(thumbBtn);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "project-thumb placeholder";
    const span = document.createElement("span");
    const base = project.displayName || project.rawName || "?";
    span.textContent = base.charAt(0).toUpperCase();
    placeholder.appendChild(span);
    titleRow.appendChild(placeholder);
  }

  const titleBlock = document.createElement("div");
  titleBlock.className = "project-title-text";

  const nameEl = document.createElement("h2");
  nameEl.className = "project-name";
  nameEl.textContent = project.displayName;

  const typePill = document.createElement("span");
  typePill.className = "project-type-pill";
  const mainType = project.primaryType || project.type || "other";
  typePill.textContent = getTypeLabel(mainType);

  titleBlock.appendChild(nameEl);
  titleBlock.appendChild(typePill);
  titleRow.appendChild(titleBlock);

  const descWrapper = document.createElement("div");
  descWrapper.className = "project-description-wrapper";

  const descEl = document.createElement("p");
  descEl.className = "project-description";
  descEl.textContent = project.summary;
  descWrapper.appendChild(descEl);

  const metaRow = document.createElement("div");
  metaRow.className = "project-meta";

  const langList =
    project.languages && project.languages.length
      ? project.languages
      : project.language
      ? [project.language]
      : [];

  langList.slice(0, 3).forEach((lang) => {
    if (!lang) return;
    const langPill = document.createElement("span");
    langPill.className = "meta-pill language";
    langPill.textContent = lang;
    metaRow.appendChild(langPill);
  });

  (project.tags || []).forEach((tag) => {
    const tagPill = document.createElement("span");
    tagPill.className = "meta-pill tag-pill";
    tagPill.textContent = `#${tag}`;
    metaRow.appendChild(tagPill);
  });

  const linksRow = document.createElement("div");
  linksRow.className = "project-links";

  const ghLink = document.createElement("a");
  ghLink.className = "project-link-btn primary-link";
  ghLink.href = project.githubUrl;
  ghLink.target = "_blank";
  ghLink.rel = "noopener noreferrer";
  ghLink.innerHTML = "<span>View on GitHub</span>";
  linksRow.appendChild(ghLink);

  if (project.hasLiveSite && project.pagesUrl) {
    const pagesLink = document.createElement("a");
    pagesLink.className = "project-link-btn";
    pagesLink.href = project.pagesUrl;
    pagesLink.target = "_blank";
    pagesLink.rel = "noopener noreferrer";
    pagesLink.innerHTML = "<span>Open live site</span>";
    linksRow.appendChild(pagesLink);
  }

  const footerMeta = document.createElement("div");
  footerMeta.className = "project-footer-meta";

  const mainFooterType = mainType;
  footerMeta.textContent =
    mainFooterType === "school"
      ? "Study / assignment project"
      : mainFooterType === "website"
      ? "Front-end / website project"
      : mainFooterType === "mobile"
      ? "Mobile client app"
      : mainFooterType === "api"
      ? "Backend / API project"
      : "Misc project";

  card.appendChild(titleRow);
  card.appendChild(descWrapper);
  card.appendChild(metaRow);
  card.appendChild(linksRow);
  card.appendChild(footerMeta);

  return card;
}

/* ---------- Render projects ---------- */

function renderProjects() {
  if (!gridEl) return;
  gridEl.innerHTML = "";

  let filtered = repos.filter(matchesProjectFilters);

  if (!filtered.length) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;

  filtered = filtered
    .slice()
    .sort((a, b) => {
      const aLive = a.hasLiveSite && a.pagesUrl ? 1 : 0;
      const bLive = b.hasLiveSite && b.pagesUrl ? 1 : 0;
      if (bLive !== aLive) return bLive - aLive;
      const nameA = (a.displayName || a.rawName || "").toLowerCase();
      const nameB = (b.displayName || b.rawName || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });

  filtered.forEach((project) => {
    const card = createProjectCard(project);
    gridEl.appendChild(card);
  });
}

/* ---------- Filters + search (UI hooks) ---------- */

function initFiltersAndSearch() {
  typeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      typeChips.forEach((c) => c.classList.remove("chip-active"));
      chip.classList.add("chip-active");
      state.typeFilter = chip.getAttribute("data-filter-value") || "all";
      renderProjects();
    });
  });

  if (searchEl) {
    searchEl.addEventListener("input", () => {
      const q = searchEl.value.toLowerCase().trim();
      if (currentView === "projects") {
        state.search = q;
        renderProjects();
      } else {
        mediaState.search = q;
        renderMedia();
      }
    });
  }
}

function initLanguageFilter() {
  if (!languageSelectEl) return;
  languageSelectEl.innerHTML = "";

  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS[DEFAULT_LANG];

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.setAttribute("data-i18n", "languageFilterAll");
  allOption.textContent = dict.languageFilterAll || "All languages";
  languageSelectEl.appendChild(allOption);

  const languages = Array.from(
    new Set(
      repos
        .flatMap((r) => {
          if (r.languages && r.languages.length) return r.languages;
          if (r.language) return [r.language];
          return [];
        })
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  languages.forEach((lang) => {
    const opt = document.createElement("option");
    opt.value = lang;
    opt.textContent = lang;
    languageSelectEl.appendChild(opt);
  });

  languageSelectEl.addEventListener("change", () => {
    state.languageFilter = languageSelectEl.value;
    renderProjects();
  });
}

/* ---------- Cache helpers ---------- */

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.projects)) return null;

    parsed.projects = parsed.projects.filter(
      (p) => !isSelfProjectsRepoName(p.rawName)
    );
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(projects) {
  try {
    const payload = {
      projects: projects.filter((p) => !isSelfProjectsRepoName(p.rawName)),
      fetchedAt: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function getRateLimitInfo() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setRateLimited() {
  try {
    const payload = { until: Date.now() + RATE_LIMIT_BACKOFF_MS };
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function canCallApiNow() {
  const info = getRateLimitInfo();
  if (!info || !info.until) return true;
  return Date.now() > info.until;
}

/* ---------- Thumbnail autodetect ---------- */

const thumbnailCandidates = [
  "logo.png",
  "logo.jpg",
  "logo.jpeg",
  "logo.svg",
  "banner.png",
  "banner.jpg",
  "screenshot.png",
  "screenshot.jpg",
  "screenshot-1.png",
  "screenshot-1.jpg",
  "hero.png",
  "hero.jpg",
  "thumbnail.png",
  "thumbnail.jpg",
  "cover.png",
  "cover.jpg",
  "favicon.png",
  "favicon.jpg",
  "favicon.ico",
  "icon.png",
  "icon.jpg",
  "NewClassDiagram.png",
  "NewClassDiagram.jpg",
  "OldClassDiagram.png",
  "OldClassDiagram.jpg",
  "SequenceDiagram.png",
  "SequenceDiagram.jpg",
  "ClassDiagram.png",
  "ClassDiagram.jpg",
  "class-diagram.png",
  "class-diagram.jpg",
  "diagram.png",
  "diagram.jpg",
  "Diagram.png",
  "Diagram.jpg",
  "uml.png",
  "uml.jpg",
  "model.png",
  "model.jpg",
];

const thumbnailFolders = ["", "images", "img", "media", "assets", "public"];

async function findThumbnailForRepo(project) {
  if (project.thumbnailUrl) return;

  for (const folder of thumbnailFolders) {
    for (const file of thumbnailCandidates) {
      const path = folder ? `${folder}/${file}` : file;
      const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${project.rawName}/HEAD/${path}`;

      try {
        const res = await fetch(url);
        if (res.ok) {
          project.thumbnailUrl = url;
          return;
        }
      } catch (err) {
        console.warn(
          `Error checking thumbnail for ${project.rawName} at ${url}`,
          err
        );
      }
    }
  }
}

async function enhanceThumbnails() {
  const subset = repos.slice(0, 60);
  const tasks = subset.map((project) => findThumbnailForRepo(project));
  await Promise.all(tasks);
  saveCache(repos);
  renderProjects();
}

/* ---------- Live site verification ---------- */

async function checkLiveSite(project) {
  if (!project.pagesUrl) {
    project.hasLiveSite = false;
    return;
  }

  try {
    const res = await fetch(project.pagesUrl, { method: "GET" });
    if (res.ok) {
      project.hasLiveSite = true;
    } else {
      project.hasLiveSite = false;
      project.pagesUrl = null;
    }
  } catch (err) {
    console.warn(
      `Error checking live site for ${project.rawName} at ${project.pagesUrl}`,
      err
    );
    project.hasLiveSite = false;
    project.pagesUrl = null;
  }
}

async function verifyLiveSites() {
  const tasks = repos.filter((p) => p.pagesUrl).map((p) => checkLiveSite(p));
  await Promise.all(tasks);
  saveCache(repos);
  renderProjects();
}

/* ---------- Fallback: projects.json ---------- */

async function loadFromProjectsJson() {
  try {
    const res = await fetch(PROJECTS_URL);
    if (!res.ok) throw new Error(`projects.json HTTP ${res.status}`);
    const data = await res.json();
    const projects = Array.isArray(data)
      ? data
          .filter((entry) => !isSelfProjectsRepoName(entry.name))
          .map(mapEntryToProject)
      : [];
    repos = projects;
    initLanguageFilter();
    renderProjects();
    await verifyLiveSites();
    await enhanceThumbnails();
  } catch (err) {
    console.error("Error loading projects.json fallback:", err);
    if (gridEl) gridEl.innerHTML = "";
    if (emptyEl) emptyEl.hidden = false;
  }
}

/* ---------- Load repos ---------- */

async function loadRepos() {
  if (gridEl) {
    gridEl.innerHTML =
      "<p class='project-footer-meta'>Loading projects…</p>";
  }
  if (emptyEl) emptyEl.hidden = true;

  const cache = getCache();
  let usedCache = false;

  if (cache && Array.isArray(cache.projects)) {
    const age = Date.now() - (cache.fetchedAt || 0);
    repos = cache.projects.filter((p) => !isSelfProjectsRepoName(p.rawName));
    initLanguageFilter();
    renderProjects();
    usedCache = true;

    verifyLiveSites();
    enhanceThumbnails();

    if (age < CACHE_TTL_MS) {
      return;
    }
  }

  if (!canCallApiNow()) {
    console.warn(
      "Skipping GitHub API call due to recent rate-limit; using cache or fallback."
    );
    if (!usedCache) {
      await loadFromProjectsJson();
    }
    return;
  }

  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      let body = "";
      try {
        body = await res.text();
      } catch {
        body = "";
      }
      console.error("GitHub API error:", res.status, res.statusText, body.slice(0, 200));

      if (res.status === 403 && /rate limit/i.test(body)) {
        setRateLimited();
        if (!usedCache) await loadFromProjectsJson();
        return;
      }

      if (!usedCache) await loadFromProjectsJson();
      return;
    }

    const data = await res.json();
    repos = data
      .filter((r) => !r.private)
      .filter((r) => !isSelfProjectsRepoName(r.name))
      .map(mapRepoFromGitHub);

    try {
      const fallbackRes = await fetch(PROJECTS_URL);
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (Array.isArray(fallbackData)) {
          const byName = new Map(
            fallbackData
              .filter((entry) => !isSelfProjectsRepoName(entry.name))
              .map((entry) => [entry.name, mapEntryToProject(entry)])
          );
          repos = repos.map((p) => {
            const extra = byName.get(p.rawName);
            if (!extra) return p;
            return {
              ...p,
              summary: extra.summary || p.summary,
              thumbnailUrl: extra.thumbnailUrl || p.thumbnailUrl,
              tags: [...new Set([...(p.tags || []), ...(extra.tags || [])])],
            };
          });
        }
      }
    } catch (e) {
      console.warn("Could not merge data from projects.json:", e);
    }

    saveCache(repos);
    initLanguageFilter();
    renderProjects();
    await verifyLiveSites();
    await enhanceThumbnails();
  } catch (err) {
    console.error("Network / fetch error while calling GitHub API:", err);
    if (!usedCache) {
      await loadFromProjectsJson();
    }
  }
}

/* ---------- Media Wall logic ---------- */

let mediaItems = [];
const mediaState = {
  search: "",
  kind: "all", // all | image | video | audio
  format: "all", // extension or "all"
};

const mediaGridEl = document.getElementById("mediaGrid");
const mediaEmptyEl = document.getElementById("mediaEmptyState");
const mediaKindButtons = document.querySelectorAll(".chip-media-kind");
const mediaFormatSelectEl = document.getElementById("mediaFormatFilter");

function getExtension(path) {
  if (!path) return "";
  const parts = path.split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Infer media type from path / extension if not present:
 * - media/images/*  -> image
 * - media/videos/*  -> video
 * - media/audio/*   -> audio
 * - else by known extensions
 */
function ensureMediaType(item) {
  const result = { ...item };
  if (result.type) return result;

  const src = (result.src || "").toLowerCase();
  const ext = getExtension(result.src);

  if (src.includes("/images/")) {
    result.type = "image";
    return result;
  }
  if (src.includes("/videos/")) {
    result.type = "video";
    return result;
  }
  if (src.includes("/audio/")) {
    result.type = "audio";
    return result;
  }

  const imageExts = ["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp"];
  const videoExts = ["mp4", "webm", "mkv", "mov", "avi"];
  const audioExts = ["mp3", "wav", "flac", "ogg", "m4a"];

  if (imageExts.includes(ext)) {
    result.type = "image";
  } else if (videoExts.includes(ext)) {
    result.type = "video";
  } else if (audioExts.includes(ext)) {
    result.type = "audio";
  } else {
    result.type = "image"; // default
  }

  return result;
}

/**
 * Build format options **based on current mediaState.kind**:
 * - kind = all   -> include all formats
 * - kind = image -> only extensions found on images
 * - kind = video -> only video extensions
 * - kind = audio -> only audio extensions
 */
function buildMediaFormatOptions() {
  if (!mediaFormatSelectEl) return;

  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS[DEFAULT_LANG];

  mediaFormatSelectEl.innerHTML = "";

  const optAll = document.createElement("option");
  optAll.value = "all";
  optAll.setAttribute("data-i18n", "mediaFormatAll");
  optAll.textContent = dict.mediaFormatAll || "All formats";
  mediaFormatSelectEl.appendChild(optAll);

  const targetKind = mediaState.kind || "all";

  const exts = Array.from(
    new Set(
      mediaItems
        .filter((item) => targetKind === "all" || item.type === targetKind)
        .map((item) => getExtension(item.src))
        .filter(Boolean)
    )
  ).sort();

  exts.forEach((ext) => {
    const opt = document.createElement("option");
    opt.value = ext;
    opt.textContent = ext.toUpperCase();
    mediaFormatSelectEl.appendChild(opt);
  });

  mediaFormatSelectEl.value = mediaState.format || "all";
}

/**
 * Filter function for a media item against mediaState.
 */
function mediaMatches(item) {
  if (mediaState.kind !== "all" && item.type !== mediaState.kind) return false;

  if (mediaState.format !== "all") {
    const ext = getExtension(item.src);
    if (ext !== mediaState.format) return false;
  }

  if (mediaState.search) {
    const hay = `${item.title || ""} ${item.src || ""} ${
      item.type || ""
    }`.toLowerCase();
    if (!hay.includes(mediaState.search)) return false;
  }

  return true;
}

function createMediaCard(item) {
  const card = document.createElement("article");
  card.className = "media-card";

  const thumb = document.createElement("div");
  thumb.className = "media-thumb";

  const ext = getExtension(item.src);
  const titleText = item.title || item.src;

  // 🖼 IMAGE: clickable -> fullscreen modal
  if (item.type === "image") {
    thumb.classList.add("media-thumb-clickable");

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = titleText;
    thumb.appendChild(img);

    // reuse the existing imageModal used for project thumbnails
    thumb.addEventListener("click", () => {
      openImageModal(item.src, titleText);
    });

  // 🎬 VIDEO: full browser controls, metadata preload
  } else if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.src;
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;
    // you *can* add this if you want to discourage download:
    // video.controlsList = "nodownload";
    thumb.appendChild(video);

  // 🎧 AUDIO: full controls, metadata preload
  } else if (item.type === "audio") {
    thumb.classList.add("media-thumb-audio");
    const audio = document.createElement("audio");
    audio.src = item.src;
    audio.controls = true;
    audio.preload = "metadata";
    thumb.appendChild(audio);
  }

  const titleEl = document.createElement("p");
  titleEl.className = "media-title";
  titleEl.textContent = titleText;

  const metaRow = document.createElement("div");
  metaRow.className = "media-meta-row";

  const kindPill = document.createElement("span");
  kindPill.className = "media-pill";
  kindPill.textContent = item.type;
  metaRow.appendChild(kindPill);

  if (ext) {
    const extPill = document.createElement("span");
    extPill.className = "media-pill";
    extPill.textContent = ext.toUpperCase();
    metaRow.appendChild(extPill);
  }

  // 🔗 Fancy: little "Open file" button using your existing button style
  const actionsRow = document.createElement("div");
  actionsRow.className = "project-links"; // reuse project-links styling

  const openFileLink = document.createElement("a");
  openFileLink.className = "project-link-btn";
  openFileLink.href = item.src;
  openFileLink.target = "_blank";
  openFileLink.rel = "noopener noreferrer";
  openFileLink.textContent = "Open file";

  actionsRow.appendChild(openFileLink);

  card.appendChild(thumb);
  card.appendChild(titleEl);
  card.appendChild(metaRow);
  card.appendChild(actionsRow);

  return card;
}

function renderMedia() {
  if (!mediaGridEl) return;
  mediaGridEl.innerHTML = "";

  const filtered = mediaItems.filter(mediaMatches);

  if (!filtered.length) {
    if (mediaEmptyEl) mediaEmptyEl.hidden = false;
    return;
  }

  if (mediaEmptyEl) mediaEmptyEl.hidden = true;

  filtered.forEach((item) => {
    const card = createMediaCard(item);
    mediaGridEl.appendChild(card);
  });
}

async function loadMediaIndex() {
  try {
    // Try both common filenames: media_index.json and media-index.json
    const candidates = ["media/media_index.json", "media/media-index.json"];
    let res = null;
    let urlUsed = null;

    for (const url of candidates) {
      try {
        const attempt = await fetch(url, { cache: "no-store" });
        if (attempt.ok) {
          res = attempt;
          urlUsed = url;
          break;
        }
      } catch (e) {
        console.warn("[Media] Fetch error for", url, e);
      }
    }

    if (!res) {
      console.warn(
        "[Media] No media index file found (media_index.json or media-index.json)."
      );
      return;
    }

    const data = await res.json();

    let rawItems;
    if (Array.isArray(data)) {
      rawItems = data;
    } else if (Array.isArray(data.items)) {
      rawItems = data.items;
    } else {
      console.warn(
        "[Media] Media index has unexpected shape, expected [] or { items: [] }"
      );
      rawItems = [];
    }

    mediaItems = rawItems.map((item) => {
      if (!item.src && item.path) {
        return ensureMediaType({ ...item, src: item.path });
      }
      return ensureMediaType(item);
    });

    buildMediaFormatOptions();
    renderMedia();
  } catch (err) {
    console.error("[Media] Error loading media index:", err);
  }
}

function initMediaFilters() {
  mediaKindButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      mediaKindButtons.forEach((b) => b.classList.remove("chip-active"));
      btn.classList.add("chip-active");

      mediaState.kind = btn.getAttribute("data-media-kind") || "all";

      // reset format filter to "all" whenever kind changes
      mediaState.format = "all";
      if (mediaFormatSelectEl) {
        mediaFormatSelectEl.value = "all";
      }

      buildMediaFormatOptions();
      renderMedia();
    });
  });

  if (mediaFormatSelectEl) {
    mediaFormatSelectEl.addEventListener("change", () => {
      mediaState.format = mediaFormatSelectEl.value;
      renderMedia();
    });
  }
}

/* ---------- View switching (Projects vs Media) ---------- */

const projectsViewEl   = document.getElementById("projectsView");
const mediaViewEl      = document.getElementById("mediaView");
const projectFiltersEl = document.getElementById("projectFilters");
const mediaFiltersEl   = document.getElementById("mediaFilters");
const viewTabs         = document.querySelectorAll(".view-tab");

function setView(view) {
  // "projects" or "media"
  currentView = view === "media" ? "media" : "projects";

  // Active state on tabs
  viewTabs.forEach((tab) => {
    const tabView = tab.getAttribute("data-view");
    if (tabView === currentView) {
      tab.classList.add("view-tab-active");
    } else {
      tab.classList.remove("view-tab-active");
    }
  });

  // ✅ Use the `hidden` property instead of style.display
  if (projectsViewEl) {
    projectsViewEl.hidden = currentView !== "projects";
  }
  if (mediaViewEl) {
    mediaViewEl.hidden = currentView !== "media";
  }

  // ✅ Same for filters
  if (projectFiltersEl) {
    projectFiltersEl.hidden = currentView !== "projects";
  }
  if (mediaFiltersEl) {
    mediaFiltersEl.hidden = currentView !== "media";
  }

  // Update search placeholder
  updateSearchPlaceholderForView();

  // Render correct list
  if (currentView === "projects") {
    renderProjects();
  } else {
    buildMediaFormatOptions();
    renderMedia();
  }
}

function initViewSwitch() {
  viewTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const view = tab.getAttribute("data-view");
      setView(view);
    });
  });

  // default: projects view
  setView("projects");
}

/* ---------- Init ---------- */

(function init() {
  console.log("Initializing Ferran Projects + Media page…");
  setupLanguageUI();
  initFiltersAndSearch();
  initMediaFilters();
  initViewSwitch();
  loadRepos();
  loadMediaIndex();
})();
