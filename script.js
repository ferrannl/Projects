const GITHUB_USER = "ferrannl";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
const PROJECTS_URL = "./projects.json";

const CACHE_KEY = "ferranProjectsCacheV2";
const RATE_LIMIT_KEY = "ferranProjectsRateLimitV2";
const CACHE_TTL_MS = 1000 * 60 * 30;   // 30 minutes cache
const RATE_LIMIT_BACKOFF_MS = 1000 * 60 * 60; // 1 hour after rate-limit
const LANGUAGE_STORAGE_KEY = "ferranProjectsLang";

let repos = [];
const state = {
  search: "",
  typeFilter: "all",
  languageFilter: "all"
};

let currentLang = "en";

const gridEl = document.getElementById("projectsGrid");
const emptyEl = document.getElementById("emptyState");
const searchEl = document.getElementById("search");
const languageSelectEl = document.getElementById("languageFilter");
const typeChips = document.querySelectorAll(".chip[data-filter-type='type']");

const imageModalEl = document.getElementById("imageModal");
const imageModalImgEl = document.getElementById("imageModalImg");
const langGateEl = document.getElementById("langGate");

const SMALL_WORDS = new Set([
  "voor", "van", "met",
  "en", "of",
  "de", "het", "een",
  "in", "op", "aan", "bij"
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
  ux: "UX"
};

/* ---------- Translations ---------- */

const I18N = {
  en: {
    subtitle: "All my programming & coding projects in one place – websites, apps, school work, guides, APIs and more.",
    filterTypeLabel: "Type",
    filterLanguageLabel: "Language",
    typeAll: "All",
    typeWebsite: "Websites",
    typeMobile: "Mobile",
    typeApi: "APIs / Backend",
    typeSchool: "School / Study",
    typeOther: "Other",
    allLanguagesOption: "All languages",
    searchPlaceholder: "Search by name, description, language or tag…",
    emptyState: "No projects match your search/filter. Try another search term.",
    footerBuiltWith: "Built with ♥ by Ferran",
    footerViewOnPages: "View this site on GitHub Pages",
    loading: "Loading projects…"
  },
  nl: {
    subtitle: "Al mijn programmeer- en codeprojecten op één plek – websites, apps, schoolprojecten, handleidingen, API’s en meer.",
    filterTypeLabel: "Type",
    filterLanguageLabel: "Taal",
    typeAll: "Alles",
    typeWebsite: "Websites",
    typeMobile: "Mobiel",
    typeApi: "API’s / Backend",
    typeSchool: "School / Studie",
    typeOther: "Overig",
    allLanguagesOption: "Alle talen",
    searchPlaceholder: "Zoek op naam, beschrijving, taal of tag…",
    emptyState: "Geen projecten gevonden voor deze zoekopdracht of filters.",
    footerBuiltWith: "Gemaakt met ♥ door Ferran",
    footerViewOnPages: "Bekijk deze site op GitHub Pages",
    loading: "Projecten laden…"
  },
  de: {
    subtitle: "Alle meine Programmier- und Coding-Projekte an einem Ort – Websites, Apps, Studienarbeiten, Guides, APIs und mehr.",
    filterTypeLabel: "Typ",
    filterLanguageLabel: "Sprache",
    typeAll: "Alle",
    typeWebsite: "Websites",
    typeMobile: "Mobile",
    typeApi: "APIs / Backend",
    typeSchool: "Schule / Studium",
    typeOther: "Sonstiges",
    allLanguagesOption: "Alle Sprachen",
    searchPlaceholder: "Suche nach Name, Beschreibung, Sprache oder Tag…",
    emptyState: "Keine Projekte für diese Suche/Filter gefunden.",
    footerBuiltWith: "Mit ♥ erstellt von Ferran",
    footerViewOnPages: "Diese Seite auf GitHub Pages ansehen",
    loading: "Projekte werden geladen…"
  },
  pl: {
    subtitle: "Wszystkie moje projekty programistyczne w jednym miejscu – strony WWW, aplikacje, projekty szkolne, poradniki, API i więcej.",
    filterTypeLabel: "Typ",
    filterLanguageLabel: "Język",
    typeAll: "Wszystko",
    typeWebsite: "Strony WWW",
    typeMobile: "Mobilne",
    typeApi: "API / Backend",
    typeSchool: "Szkoła / Studia",
    typeOther: "Inne",
    allLanguagesOption: "Wszystkie języki",
    searchPlaceholder: "Szukaj po nazwie, opisie, języku lub tagu…",
    emptyState: "Brak projektów pasujących do wyszukiwania/filtrów.",
    footerBuiltWith: "Stworzone z ♥ przez Ferrana",
    footerViewOnPages: "Zobacz tę stronę na GitHub Pages",
    loading: "Ładowanie projektów…"
  },
  tr: {
    subtitle: "Tüm programlama projelerim tek bir yerde – web siteleri, uygulamalar, okul projeleri, rehberler, API’ler ve daha fazlası.",
    filterTypeLabel: "Tür",
    filterLanguageLabel: "Dil",
    typeAll: "Hepsi",
    typeWebsite: "Web siteleri",
    typeMobile: "Mobil",
    typeApi: "API / Backend",
    typeSchool: "Okul / Çalışma",
    typeOther: "Diğer",
    allLanguagesOption: "Tüm diller",
    searchPlaceholder: "Ada, açıklamaya, dile veya etikete göre ara…",
    emptyState: "Arama/filtre için eşleşen proje bulunamadı.",
    footerBuiltWith: "Ferran tarafından ♥ ile geliştirildi",
    footerViewOnPages: "Bu siteyi GitHub Pages üzerinde gör",
    loading: "Projeler yükleniyor…"
  },
  es: {
    subtitle: "Todos mis proyectos de programación en un solo lugar: sitios web, apps, trabajos de estudio, guías, APIs y más.",
    filterTypeLabel: "Tipo",
    filterLanguageLabel: "Idioma",
    typeAll: "Todo",
    typeWebsite: "Sitios web",
    typeMobile: "Móvil",
    typeApi: "APIs / Backend",
    typeSchool: "Escuela / Estudio",
    typeOther: "Otro",
    allLanguagesOption: "Todos los idiomas",
    searchPlaceholder: "Busca por nombre, descripción, idioma o etiqueta…",
    emptyState: "No hay proyectos que coincidan con tu búsqueda/filtros.",
    footerBuiltWith: "Hecho con ♥ por Ferran",
    footerViewOnPages: "Ver este sitio en GitHub Pages",
    loading: "Cargando proyectos…"
  }
};

function t(key) {
  const pack = I18N[currentLang] || I18N.en;
  return pack[key] || I18N.en[key] || "";
}

/* ---------- Helpers ---------- */

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

  let words = s.split(" ").map(w => w.trim());

  words = words.map(w =>
    w === IOS_PLACEHOLDER ? "iOS" : w
  );

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

function looksLikeSchool(text) {
  const t = (text || "").toLowerCase();
  return (
    t.includes("assignment") ||
    t.includes("school") ||
    t.includes("studie") ||
    t.includes("study") ||
    (t.includes("project") && t.includes("school")) ||
    t.includes("hbo-ict") ||
    t.includes("hbo ict") ||
    t.includes("avans") ||
    t.includes("cppls") ||
    t.includes("devops") ||
    t.includes("minor")
  );
}

function inferTypeFromGitHub(repo) {
  const name = (repo.name || "").toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const lang = (repo.language || "").toLowerCase();

  if (looksLikeSchool(`${name} ${desc}`)) return "school";

  if (
    ["swift", "java", "kotlin"].includes(lang) &&
    (name.includes("android") || name.includes("ios") || desc.includes("android") || desc.includes("ios"))
  ) return "mobile";

  if (name.includes("api") || desc.includes("api")) return "api";

  if (repo.has_pages) return "website";
  if (["html", "css", "javascript", "typescript", "php"].includes(lang)) return "website";

  return "other";
}

function inferTypeFromEntry(entry) {
  if (entry.type) return entry.type;
  const lang = (entry.language || "").toLowerCase();
  const name = (entry.name || "").toLowerCase();
  const desc = (entry.description || "").toLowerCase();

  if (looksLikeSchool(`${name} ${desc}`)) return "school";

  if (
    ["swift", "java", "kotlin"].includes(lang) &&
    (name.includes("android") || name.includes("ios") || desc.includes("android") || desc.includes("ios"))
  ) return "mobile";

  if (name.includes("api") || desc.includes("api")) return "api";

  if (["html", "css", "javascript", "typescript", "php"].includes(lang)) return "website";

  return "other";
}

function getTypeLabel(type) {
  switch (type) {
    case "website": return "Website";
    case "mobile":  return "Mobile App";
    case "api":     return "API / Backend";
    case "school":  return "School / Study";
    default:        return "Other";
  }
}

function buildTagsBase(type, primaryLang) {
  const tags = [];
  const langLower = (primaryLang || "").toLowerCase();
  const isWebLang = ["html", "css", "javascript", "typescript", "php"].includes(langLower);

  if (type === "website") tags.push("web");
  if (type === "mobile")  tags.push("mobile");
  if (type === "api")     tags.push("api");
  if (type === "school") {
    tags.push("school");
    if (isWebLang && !tags.includes("web")) tags.push("web");
  }

  if (isWebLang) {
    if (!tags.includes("web")) tags.push("web");
    tags.push("frontend");
  }

  if (langLower === "c#") {
    tags.push("csharp", "dotnet");
  }

  if (langLower === "c++") {
    tags.push("cpp");
  }

  if (langLower === "java") {
    tags.push("java");
  }

  if (langLower === "php") {
    tags.push("backend");
  }

  if (langLower === "python") {
    tags.push("python");
  }

  const unique = [...new Set(tags)];
  return unique.slice(0, 6);
}

function computeLanguages(primaryLang, rawName, desc, type) {
  const langs = [];
  const main = primaryLang || "Various";
  const text = `${rawName || ""} ${desc || ""}`.toLowerCase();
  const typeL = (type || "").toLowerCase();

  function add(lang) {
    if (!lang || !lang.trim()) return;
    if (!langs.includes(lang)) langs.push(lang);
  }

  if (!main || main === "Various") {
    add(main);
    return langs;
  }

  const l = main.toLowerCase();

  if (l === "html") {
    add("HTML");
    add("CSS");
    add("JavaScript");
  } else if (l === "css") {
    add("CSS");
    add("HTML");
    add("JavaScript");
  } else if (l === "javascript") {
    add("JavaScript");
    if (typeL === "website" || typeL === "school" || text.includes("html") || text.includes("css")) {
      add("HTML");
      add("CSS");
    }
  } else if (l === "typescript") {
    add("TypeScript");
    add("JavaScript");
    if (typeL === "website" || typeL === "school" || text.includes("html") || text.includes("css")) {
      add("HTML");
      add("CSS");
    }
  } else if (l === "php") {
    add("PHP");
    if (typeL === "website" || typeL === "school" || text.includes("html")) {
      add("HTML");
      add("CSS");
    }
  } else if (l === "c++") {
    add("C++");
    add("C");
  } else if (l === "c#") {
    add("C#");
    if (text.includes("asp.net")) {
      add("ASP.NET");
    } else {
      add(".NET");
    }
  } else {
    add(main);
  }

  if (langs.length < 3) {
    if (text.includes("asp.net") && !langs.includes("ASP.NET")) {
      add("ASP.NET");
    } else if (text.includes(".net") && !langs.includes(".NET") && !langs.includes("ASP.NET")) {
      add(".NET");
    }
  }

  if (langs.length < 3 && (text.includes("html") || text.includes("css"))) {
    if (!langs.includes("HTML")) add("HTML");
    if (!langs.includes("CSS") && langs.length < 3) add("CSS");
  }

  if (langs.length < 3 && text.includes("javascript") && !langs.includes("JavaScript")) {
    add("JavaScript");
  }

  const unique = [...new Set(langs)];
  return unique.slice(0, 3);
}

/* ---------- Map GitHub repo → internal ---------- */

function mapRepoFromGitHub(repo) {
  const type = inferTypeFromGitHub(repo);
  const baseDesc = repo.description || "No description yet.";
  const primaryLang = repo.language || "Various";
  const languages = computeLanguages(primaryLang, repo.name, repo.description, type);

  const pagesUrl = repo.has_pages
    ? `https://${GITHUB_USER}.github.io/${repo.name}/`
    : null;

  return {
    rawName: repo.name,
    displayName: prettifyName(repo.name),
    language: languages[0] || "Various",
    languages,
    type,
    tags: buildTagsBase(type, primaryLang),
    githubUrl: repo.html_url,
    pagesUrl,
    hasLiveSite: !!pagesUrl,
    baseDescription: baseDesc,
    summary: baseDesc,
    thumbnailUrl: null
  };
}

/* ---------- Map projects.json entry → internal ---------- */

function mapEntryToProject(entry) {
  const type = inferTypeFromEntry(entry);
  const baseDesc = entry.description || "No description yet.";
  const hasPagesFlag = !!entry.hasPages;
  const customPagesUrl = entry.pagesUrl;
  const primaryLang = entry.language || "Various";
  const languages = computeLanguages(primaryLang, entry.name, entry.description, type);

  const tagsFromType = buildTagsBase(type, primaryLang);
  const extraTags = entry.tags ? entry.tags : [];
  const mergedTags = [...new Set([...tagsFromType, ...extraTags])];

  let thumbnailUrl = null;
  if (entry.thumbnailUrl && entry.thumbnailUrl.trim()) {
    thumbnailUrl = entry.thumbnailUrl.trim();
  }

  const pagesUrl = hasPagesFlag
    ? (customPagesUrl || `https://${GITHUB_USER}.github.io/${entry.name}/`)
    : null;

  return {
    rawName: entry.name,
    displayName: prettifyName(entry.name),
    language: languages[0] || "Various",
    languages,
    type,
    tags: mergedTags.slice(0, 8),
    githubUrl: `https://github.com/${GITHUB_USER}/${entry.name}`,
    pagesUrl,
    hasLiveSite: !!pagesUrl,
    baseDescription: baseDesc,
    summary: baseDesc,
    thumbnailUrl
  };
}

/* ---------- Filters / search ---------- */

function matchesFilters(project) {
  const rawName = project.rawName || "";
  if (isSelfProjectsRepoName(rawName)) return false;

  if (state.typeFilter !== "all" && project.type !== state.typeFilter) return false;

  if (state.languageFilter !== "all") {
    const langs = project.languages && project.languages.length
      ? project.languages
      : (project.language ? [project.language] : []);
    const matchLang = langs.some(l => (l || "").toLowerCase() === state.languageFilter.toLowerCase());
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
      ...(project.tags || [])
    ].join(" ").toLowerCase();

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

/* ---------- Language gate + i18n ---------- */

function applyTranslations() {
  const subtitleEl = document.querySelector("[data-i18n='subtitle']");
  const typeLabelEl = document.querySelector("[data-i18n='filterTypeLabel']");
  const langLabelEl = document.querySelector("[data-i18n='filterLanguageLabel']");
  const footerBuiltEl = document.querySelector("[data-i18n='footerBuiltWith']");
  const footerViewEl = document.querySelector("[data-i18n='footerViewOnPages']");

  if (subtitleEl) subtitleEl.textContent = t("subtitle");
  if (typeLabelEl) typeLabelEl.textContent = t("filterTypeLabel");
  if (langLabelEl) langLabelEl.textContent = t("filterLanguageLabel");
  if (footerBuiltEl) footerBuiltEl.textContent = t("footerBuiltWith");
  if (footerViewEl) footerViewEl.textContent = t("footerViewOnPages");

  if (searchEl) searchEl.placeholder = t("searchPlaceholder");

  const chipAll = document.querySelector("[data-i18n='typeAll']");
  const chipWebsite = document.querySelector("[data-i18n='typeWebsite']");
  const chipMobile = document.querySelector("[data-i18n='typeMobile']");
  const chipApi = document.querySelector("[data-i18n='typeApi']");
  const chipSchool = document.querySelector("[data-i18n='typeSchool']");
  const chipOther = document.querySelector("[data-i18n='typeOther']");

  if (chipAll) chipAll.textContent = t("typeAll");
  if (chipWebsite) chipWebsite.textContent = t("typeWebsite");
  if (chipMobile) chipMobile.textContent = t("typeMobile");
  if (chipApi) chipApi.textContent = t("typeApi");
  if (chipSchool) chipSchool.textContent = t("typeSchool");
  if (chipOther) chipOther.textContent = t("typeOther");

  if (emptyEl) emptyEl.textContent = t("emptyState");

  if (languageSelectEl) {
    const first = languageSelectEl.querySelector("option[value='all']");
    if (first) first.textContent = t("allLanguagesOption");
  }
}

function hideLangGate() {
  if (langGateEl) {
    langGateEl.hidden = true;
  }
}

function showLangGate() {
  if (langGateEl) {
    langGateEl.hidden = false;
  }
}

function setLanguage(lang) {
  if (!I18N[lang]) lang = "en";
  currentLang = lang;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLang);
  applyTranslations();
  hideLangGate();
}

function initLanguageGate() {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved && I18N[saved]) {
    currentLang = saved;
    applyTranslations();
    hideLangGate();
  } else {
    currentLang = "en";
    applyTranslations();
    showLangGate();
  }

  if (langGateEl) {
    langGateEl.addEventListener("click", (e) => {
      if (e.target === langGateEl) {
        setLanguage("en");
      }
    });
  }

  const langButtons = document.querySelectorAll(".btn-lang[data-lang]");
  langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang || "en");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !langGateEl.hidden) {
      setLanguage("en");
    }
  });
}

/* ---------- Cards ---------- */

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
  typePill.textContent = getTypeLabel(project.type);

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

  const langList = project.languages && project.languages.length
    ? project.languages
    : (project.language ? [project.language] : []);

  langList.slice(0, 3).forEach(lang => {
    if (!lang) return;
    const langPill = document.createElement("span");
    langPill.className = "meta-pill language";
    langPill.textContent = lang;
    metaRow.appendChild(langPill);
  });

  (project.tags || []).forEach(tag => {
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
  footerMeta.textContent =
    project.type === "school" ? "Study / assignment project" :
    project.type === "website" ? "Front-end / website project" :
    project.type === "mobile" ? "Mobile client app" :
    project.type === "api"    ? "Backend / API project" :
                                "Misc project";

  card.appendChild(titleRow);
  card.appendChild(descWrapper);
  card.appendChild(metaRow);
  card.appendChild(linksRow);
  card.appendChild(footerMeta);

  return card;
}

/* ---------- Render & UI ---------- */

function renderProjects() {
  if (!gridEl) return;
  gridEl.innerHTML = "";

  let filtered = repos.filter(matchesFilters);

  if (!filtered.length) {
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = t("emptyState");
    }
    return;
  }

  if (emptyEl) emptyEl.hidden = true;

  filtered = filtered.slice().sort((a, b) => {
    const aLive = a.hasLiveSite && a.pagesUrl ? 1 : 0;
    const bLive = b.hasLiveSite && b.pagesUrl ? 1 : 0;
    if (bLive !== aLive) return bLive - aLive;
    const nameA = (a.displayName || a.rawName || "").toLowerCase();
    const nameB = (b.displayName || b.rawName || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

  filtered.forEach(project => {
    const card = createProjectCard(project);
    gridEl.appendChild(card);
  });
}

function initFiltersAndSearch() {
  typeChips.forEach(chip => {
    chip.addEventListener("click", () => {
      typeChips.forEach(c => c.classList.remove("chip-active"));
      chip.classList.add("chip-active");
      state.typeFilter = chip.getAttribute("data-filter-value") || "all";
      renderProjects();
    });
  });

  if (searchEl) {
    searchEl.addEventListener("input", () => {
      state.search = searchEl.value.toLowerCase().trim();
      renderProjects();
    });
  }
}

function initLanguageFilter() {
  if (!languageSelectEl) return;
  languageSelectEl.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = t("allLanguagesOption");
  languageSelectEl.appendChild(allOption);

  const languages = Array.from(
    new Set(
      repos.flatMap(r => {
        if (r.languages && r.languages.length) return r.languages;
        if (r.language) return [r.language];
        return [];
      }).filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  languages.forEach(lang => {
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
      p => !isSelfProjectsRepoName(p.rawName)
    );
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(projects) {
  try {
    const payload = {
      projects: projects.filter(p => !isSelfProjectsRepoName(p.rawName)),
      fetchedAt: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
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
  }
}

function canCallApiNow() {
  const info = getRateLimitInfo();
  if (!info || !info.until) return true;
  return Date.now() > info.until;
}

/* ---------- Thumbnails ---------- */

const thumbnailCandidates = [
  "logo.png", "logo.jpg", "logo.jpeg", "logo.svg",
  "banner.png", "banner.jpg",
  "screenshot.png", "screenshot.jpg",
  "screenshot-1.png", "screenshot-1.jpg",
  "hero.png", "hero.jpg",
  "thumbnail.png", "thumbnail.jpg",
  "cover.png", "cover.jpg",
  "favicon.png", "favicon.jpg", "favicon.ico",
  "icon.png", "icon.jpg",
  "NewClassDiagram.png", "NewClassDiagram.jpg",
  "OldClassDiagram.png", "OldClassDiagram.jpg",
  "SequenceDiagram.png", "SequenceDiagram.jpg",
  "ClassDiagram.png", "ClassDiagram.jpg",
  "class-diagram.png", "class-diagram.jpg",
  "diagram.png", "diagram.jpg",
  "Diagram.png", "Diagram.jpg",
  "uml.png", "uml.jpg",
  "model.png", "model.jpg"
];

const thumbnailFolders = [
  "",
  "images",
  "img",
  "media",
  "assets",
  "public"
];

async function findThumbnailForRepo(project) {
  if (project.thumbnailUrl) {
    return;
  }

  for (const folder of thumbnailFolders) {
    for (const file of thumbnailCandidates) {
      const path = folder ? `${folder}/${file}` : file;
      const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${project.rawName}/HEAD/${path}`;

      try {
        const res = await fetch(url);
        if (res.ok) {
          console.log(`Found thumbnail for ${project.rawName}: ${url}`);
          project.thumbnailUrl = url;
          return;
        }
      } catch (err) {
        console.warn(`Error checking thumbnail for ${project.rawName} at ${url}`, err);
      }
    }
  }

  console.log(`No thumbnail found for ${project.rawName}`);
}

async function enhanceThumbnails() {
  const subset = repos.slice(0, 60);
  console.log(`Enhancing thumbnails for ${subset.length} projects...`);
  const tasks = subset.map(project => findThumbnailForRepo(project));
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
    console.warn(`Error checking live site for ${project.rawName} at ${project.pagesUrl}`, err);
    project.hasLiveSite = false;
    project.pagesUrl = null;
  }
}

async function verifyLiveSites() {
  console.log("Verifying live sites for projects with pagesUrl...");
  const tasks = repos
    .filter(p => p.pagesUrl)
    .map(p => checkLiveSite(p));

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
          .filter(entry => !isSelfProjectsRepoName(entry.name))
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
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent =
        "Could not load project list (GitHub API and projects.json both failed).";
    }
  }
}

/* ---------- Main loader ---------- */

async function loadRepos() {
  if (gridEl) {
    gridEl.innerHTML = `<p class='project-footer-meta'>${t("loading")}</p>`;
  }
  if (emptyEl) emptyEl.hidden = true;

  const cache = getCache();
  let usedCache = false;

  if (cache && Array.isArray(cache.projects)) {
    const age = Date.now() - (cache.fetchedAt || 0);
    repos = cache.projects.filter(p => !isSelfProjectsRepoName(p.rawName));
    console.log("Loaded projects from cache. Age (ms):", age);
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
    console.warn("Skipping GitHub API call due to recent rate-limit; using cache or fallback.");
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
        if (!usedCache) {
          await loadFromProjectsJson();
        }
        return;
      }

      if (!usedCache) {
        await loadFromProjectsJson();
      }
      return;
    }

    const data = await res.json();
    repos = data
      .filter(r => !r.private)
      .filter(r => !isSelfProjectsRepoName(r.name))
      .map(mapRepoFromGitHub);

    console.log(`Fetched ${repos.length} repos from GitHub API`);

    try {
      const fallbackRes = await fetch(PROJECTS_URL);
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (Array.isArray(fallbackData)) {
          const byName = new Map(
            fallbackData
              .filter(entry => !isSelfProjectsRepoName(entry.name))
              .map(entry => [entry.name, mapEntryToProject(entry)])
          );
          repos = repos.map(p => {
            const extra = byName.get(p.rawName);
            if (!extra) return p;
            return {
              ...p,
              summary: extra.summary || p.summary,
              thumbnailUrl: extra.thumbnailUrl || p.thumbnailUrl,
              tags: [...new Set([...(p.tags || []), ...(extra.tags || [])])]
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

/* ---------- Init ---------- */

(function init() {
  console.log("Initializing Ferran Projects page…");
  initLanguageGate();
  initFiltersAndSearch();
  loadRepos();
})();
