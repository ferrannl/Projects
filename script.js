/* ---------- Language / i18n ---------- */

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
  es: "Español"
};

const TRANSLATIONS = {
  en: {
    subtitle:
      "All my programming & coding projects in one place – websites, apps, school work, guides, APIs and more.",
    aboutTitle: "About Me",
    aboutP1:
      "Hey 👋🏻 Ferran here. I am a Dutch developer from Utrecht / 's-Hertogenbosch. I like building websites, apps and small tools and putting everything together on this page.",
    aboutP2:
      "In my free time I enjoy inline skating, ice skating, longboarding, skateboarding, cycling and going for small walks. I also like rock, rap and electronic music, videogames and modding game consoles, something I started doing when I was about 12 years old.",
    filterTypeLabel: "Type",
    typeAll: "All",
    typeWebsite: "Websites",
    typeMobile: "Mobile",
    typeApi: "APIs / Backend",
    typeSchool: "School / Study",
    typeOther: "Other",
    filterLanguageLabel: "Language",
    emptyState: "No projects match your search/filter. Try another search term.",
    footerBuiltWith: "Built with ♥ by Ferran",
    footerViewOnPages: "View this site on GitHub Pages"
  },
  nl: {
    subtitle:
      "Al mijn programmeer- en codeprojecten op één plek – websites, apps, schoolopdrachten, guides, API’s en meer.",
    aboutTitle: "Over mij",
    aboutP1:
      "Hey 👋🏻 Ferran hier. Ik ben een Nederlandse developer uit Utrecht / ’s-Hertogenbosch. Ik bouw graag websites, apps en kleine tools en verzamel alles op deze pagina.",
    aboutP2:
      "In mijn vrije tijd skate ik graag (inline en op ijs), longboard ik, fiets ik en maak ik kleine wandelingen. Ik ben fan van rock, rap en elektronische muziek, videogames en het modden van spelconsoles, iets wat ik ben gaan doen rond mijn twaalfde.",
    filterTypeLabel: "Type",
    typeAll: "Alles",
    typeWebsite: "Websites",
    typeMobile: "Mobiel",
    typeApi: "API’s / Backend",
    typeSchool: "School / Studie",
    typeOther: "Overig",
    filterLanguageLabel: "Taal",
    emptyState: "Geen projecten gevonden met deze zoekopdracht of filters. Probeer iets anders.",
    footerBuiltWith: "Gemaakt met ♥ door Ferran",
    footerViewOnPages: "Bekijk deze site op GitHub Pages"
  },
  de: {
    subtitle:
      "Alle meine Programmier- und Coding-Projekte an einem Ort – Websites, Apps, Studienprojekte, Guides, APIs und mehr.",
    aboutTitle: "Über mich",
    aboutP1:
      "Hey 👋🏻 hier ist Ferran. Ich bin ein niederländischer Entwickler aus Utrecht / ’s-Hertogenbosch und baue gerne Websites, Apps und kleine Tools, die ich hier sammle.",
    aboutP2:
      "In meiner Freizeit fahre ich gerne Inline-Skates, Eislaufe, longboarde, skate und fahre Rad. Außerdem mag ich Rock, Rap und elektronische Musik, Videospiele und das Modden von Konsolen – damit habe ich ungefähr mit 12 angefangen.",
    filterTypeLabel: "Typ",
    typeAll: "Alle",
    typeWebsite: "Websites",
    typeMobile: "Mobile",
    typeApi: "APIs / Backend",
    typeSchool: "Schule / Studium",
    typeOther: "Sonstiges",
    filterLanguageLabel: "Sprache",
    emptyState: "Keine Projekte für diese Suche oder Filter. Bitte etwas anderes versuchen.",
    footerBuiltWith: "Mit ♥ erstellt von Ferran",
    footerViewOnPages: "Diese Seite auf GitHub Pages ansehen"
  },
  pl: {
    subtitle:
      "Wszystkie moje projekty programistyczne w jednym miejscu – strony WWW, aplikacje, zadania ze szkoły, poradniki, API i więcej.",
    aboutTitle: "O mnie",
    aboutP1:
      "Cześć 👋🏻 tu Ferran. Jestem holenderskim deweloperem z Utrechtu / ’s-Hertogenbosch. Lubię tworzyć strony, aplikacje i małe narzędzia i zbieram je tutaj.",
    aboutP2:
      "W wolnym czasie jeżdżę na rolkach, łyżwach, longboardzie i rowerze oraz chodzę na krótkie spacery. Lubię rock, rap, elektronikę, gry wideo i modyfikowanie konsol – zacząłem mniej więcej w wieku 12 lat.",
    filterTypeLabel: "Typ",
    typeAll: "Wszystko",
    typeWebsite: "Strony WWW",
    typeMobile: "Mobilne",
    typeApi: "API / Backend",
    typeSchool: "Szkoła / Studia",
    typeOther: "Inne",
    filterLanguageLabel: "Język",
    emptyState: "Brak projektów dla tych filtrów. Spróbuj innego wyszukiwania.",
    footerBuiltWith: "Stworzone z ♥ przez Ferrana",
    footerViewOnPages: "Zobacz tę stronę na GitHub Pages"
  },
  tr: {
    subtitle:
      "Tüm programlama projelerim tek bir yerde – web siteleri, uygulamalar, okul projeleri, rehberler, API’ler ve daha fazlası.",
    aboutTitle: "Hakkımda",
    aboutP1:
      "Selam 👋🏻 ben Ferran. Utrecht / ’s-Hertogenbosch’ta yaşayan Hollandalı bir geliştiriciyim. Web siteleri, uygulamalar ve küçük araçlar geliştirmeyi seviyorum ve hepsini burada topluyorum.",
    aboutP2:
      "Boş zamanlarımda paten, buz pateni, longboard ve bisiklet sürmeyi, kısa yürüyüşler yapmayı seviyorum. Rock, rap ve elektronik müzik, video oyunları ve oyun konsollarını modlamak da hoşuma gidiyor – buna yaklaşık 12 yaşında başladım.",
    filterTypeLabel: "Tür",
    typeAll: "Tümü",
    typeWebsite: "Web siteleri",
    typeMobile: "Mobil",
    typeApi: "API / Backend",
    typeSchool: "Okul / Eğitim",
    typeOther: "Diğer",
    filterLanguageLabel: "Dil",
    emptyState: "Bu arama / filtre ile eşleşen proje yok. Başka bir şey dene.",
    footerBuiltWith: "♥ ile geliştirildi – Ferran",
    footerViewOnPages: "Bu siteyi GitHub Pages üzerinde görüntüle"
  },
  es: {
    subtitle:
      "Todos mis proyectos de programación en un solo lugar: webs, apps, trabajos de estudio, guías, APIs y más.",
    aboutTitle: "Sobre mí",
    aboutP1:
      "Hola 👋🏻 soy Ferran. Desarrollador holandés de Utrecht / ’s-Hertogenbosch. Me gusta crear webs, apps y pequeñas herramientas y juntarlo todo en esta página.",
    aboutP2:
      "En mi tiempo libre patino en línea, sobre hielo, hago longboard, voy en bici y doy paseos cortos. Me gustan el rock, el rap, la música electrónica, los videojuegos y modificar consolas, algo que empecé a hacer sobre los 12 años.",
    filterTypeLabel: "Tipo",
    typeAll: "Todo",
    typeWebsite: "Webs",
    typeMobile: "Móvil",
    typeApi: "APIs / Backend",
    typeSchool: "Escuela / Estudio",
    typeOther: "Otros",
    filterLanguageLabel: "Idioma",
    emptyState: "No hay proyectos para esta búsqueda o filtros. Prueba con otros términos.",
    footerBuiltWith: "Hecho con ♥ por Ferran",
    footerViewOnPages: "Ver este sitio en GitHub Pages"
  }
};

function applyTranslations(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const value = dict[key];
    if (typeof value === "string") {
      el.textContent = value;
    }
  });
}

function updateLangLabel(lang) {
  const labelEl = document.getElementById("uiLangLabel");
  if (!labelEl) return;
  const name = LANGUAGE_NAMES[lang] || LANGUAGE_NAMES[DEFAULT_LANG];
  labelEl.textContent = name;
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  updateLangLabel(lang);
  applyTranslations(lang);
}

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
}

setupLanguageUI();

/* ---------- Projects logic (GitHub + projects.json) ---------- */

const GITHUB_USER = "ferrannl";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
const PROJECTS_URL = "./projects.json";

const CACHE_KEY = "ferranProjectsCacheV2";
const RATE_LIMIT_KEY = "ferranProjectsRateLimitV2";
const CACHE_TTL_MS = 1000 * 60 * 30;   // 30 minutes cache
const RATE_LIMIT_BACKOFF_MS = 1000 * 60 * 60; // 1 hour after rate-limit

let repos = [];
const state = {
  search: "",
  typeFilter: "all",
  languageFilter: "all"
};

const gridEl = document.getElementById("projectsGrid");
const emptyEl = document.getElementById("emptyState");
const searchEl = document.getElementById("search");
const languageSelectEl = document.getElementById("languageFilter");
const typeChips = document.querySelectorAll(".chip[data-filter-type='type']");

const imageModalEl = document.getElementById("imageModal");
const imageModalImgEl = document.getElementById("imageModalImg");

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

/* ---------- Helpers ---------- */

function isSelfProjectsRepoName(name) {
  return (name || "").toLowerCase() === "projects";
}

function prettifyName(raw) {
  if (!raw) return "";

  // Normalize separators first
  let s = raw.replace(/[-_.]+/g, " ");

  // TEMPORARILY protect iOS so CamelCase splitting doesn't break it
  const IOS_PLACEHOLDER = "__IOS__";
  s = s.replace(/iOS|IOS|Ios|ioS/gi, IOS_PLACEHOLDER);

  // Split camelCase and PascalCase EXCEPT the placeholder
  s = s.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  s = s.replace(/\s+/g, " ").trim();

  let words = s.split(" ").map(w => w.trim());

  // Now restore proper iOS style
  words = words.map(w =>
    w === IOS_PLACEHOLDER ? "iOS" : w
  );

  // Basic dictionary corrections
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

function inferTypeFromGitHub(repo) {
  const name = (repo.name || "").toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const lang = (repo.language || "").toLowerCase();

  if (repo.has_pages) return "website";
  if (["html", "css", "javascript", "typescript", "php"].includes(lang)) return "website";

  if (
    ["swift", "java", "kotlin"].includes(lang) &&
    (name.includes("android") || name.includes("ios") || desc.includes("android") || desc.includes("ios"))
  ) return "mobile";

  if (name.includes("api") || desc.includes("api")) return "api";

  if (
    desc.includes("assignment") ||
    desc.includes("project") ||
    desc.includes("internship") ||
    desc.includes("final") ||
    desc.includes("cppls") ||
    desc.includes("devops")
  ) return "school";

  return "other";
}

function inferTypeFromEntry(entry) {
  if (entry.type) return entry.type;
  const lang = (entry.language || "").toLowerCase();
  const name = (entry.name || "").toLowerCase();
  const desc = (entry.description || "").toLowerCase();

  if (["html", "css", "javascript", "typescript", "php"].includes(lang)) return "website";

  if (
    ["swift", "java", "kotlin"].includes(lang) &&
    (name.includes("android") || name.includes("ios") || desc.includes("android") || desc.includes("ios"))
  ) return "mobile";

  if (name.includes("api") || desc.includes("api")) return "api";

  if (
    desc.includes("assignment") ||
    desc.includes("project") ||
    desc.includes("internship") ||
    desc.includes("final") ||
    desc.includes("cppls") ||
    desc.includes("devops")
  ) return "school";

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

function buildTagsBase(type, language) {
  const tags = [];
  const langLower = (language || "").toLowerCase();

  if (type === "website") tags.push("web");
  if (type === "mobile")  tags.push("mobile");
  if (type === "api")     tags.push("api");
  if (type === "school") {
    tags.push("school");
    if (["html", "css", "javascript", "typescript", "php"].includes(langLower)) {
      tags.push("web");
    }
  }

  return tags;
}

/**
 * Compute language array based on primary language, type and name/description.
 * Returns an array with primary language first, up to 3 total.
 */
function computeLanguages(primaryLang, rawName, desc, type) {
  const langs = [];
  const main = primaryLang || "Various";
  const nameL = (rawName || "").toLowerCase();
  const descL = (desc || "").toLowerCase();
  const typeL = (type || "").toLowerCase();

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
    if (typeL === "website") {
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

  // Deduplicate + cap to 3
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
    hasLiveSite: !!pagesUrl, // will be verified later
    baseDescription: baseDesc,
    summary: baseDesc,
    thumbnailUrl: null  // may be filled from projects.json or auto-detect
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
    tags: mergedTags,
    githubUrl: `https://github.com/${GITHUB_USER}/${entry.name}`,
    pagesUrl,
    hasLiveSite: !!pagesUrl, // will be verified later
    baseDescription: baseDesc,
    summary: baseDesc,
    thumbnailUrl
  };
}

/* ---------- Filter / search ---------- */

function matchesFilters(project) {
  const rawName = project.rawName || "";
  if (isSelfProjectsRepoName(rawName)) return false; // never show self repo

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

  // Languages (show up to 3)
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

  // Tags
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
      // text already handled by i18n
    }
    return;
  }

  if (emptyEl) emptyEl.hidden = true;

  // Sort: live sites first, then alphabetically by displayName
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
  allOption.textContent = "All languages";
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

    // Clean out self repo from cache as well
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

/* ---------- Thumbnail autodetect (raw.githubusercontent.com) ---------- */
/* logo.* has highest priority; if not found, fall back to banner/screenshot/etc. */

const thumbnailCandidates = [
  // HIGH PRIORITY: logos first
  "logo.png", "logo.jpg", "logo.jpeg", "logo.svg",

  // Website / app style images
  "banner.png", "banner.jpg",
  "screenshot.png", "screenshot.jpg",
  "screenshot-1.png", "screenshot-1.jpg",
  "hero.png", "hero.jpg",
  "thumbnail.png", "thumbnail.jpg",
  "cover.png", "cover.jpg",

  // Icons & favicons
  "favicon.png", "favicon.jpg", "favicon.ico",
  "icon.png", "icon.jpg",

  // Diagrams and model images
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
  "",          // root
  "images",
  "img",
  "media",
  "assets",
  "public"
];

async function findThumbnailForRepo(project) {
  // If projects.json already defined an explicit thumbnail, leave it
  if (project.thumbnailUrl) {
    return;
  }

  for (const folder of thumbnailFolders) {
    for (const file of thumbnailCandidates) {
      const path = folder ? `${folder}/${file}` : file;
      const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${project.rawName}/HEAD/${path}`;

      try {
        const res = await fetch(url); // GET instead of HEAD
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
  // To avoid hammering GitHub: only probe a subset per page load
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
      // text handled by i18n
    }
  }
}

/* ---------- Main loader ---------- */

async function loadRepos() {
  if (gridEl) {
    gridEl.innerHTML = "<p class='project-footer-meta'>Loading projects…</p>";
  }
  if (emptyEl) emptyEl.hidden = true;

  const cache = getCache();
  let usedCache = false;

  // 1) Use cache if present
  if (cache && Array.isArray(cache.projects)) {
    const age = Date.now() - (cache.fetchedAt || 0);
    repos = cache.projects.filter(p => !isSelfProjectsRepoName(p.rawName));
    console.log("Loaded projects from cache. Age (ms):", age);
    initLanguageFilter();
    renderProjects();
    usedCache = true;

    // Run verification and thumbnail enhancement even when cache is "fresh"
    verifyLiveSites();
    enhanceThumbnails();

    if (age < CACHE_TTL_MS) {
      return;
    }
    // else: cache old, we may refresh below
  }

  // 2) Respect rate-limit backoff
  if (!canCallApiNow()) {
    console.warn("Skipping GitHub API call due to recent rate-limit; using cache or fallback.");
    if (!usedCache) {
      await loadFromProjectsJson();
    }
    return;
  }

  // 3) Try GitHub API
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

    // Merge projects.json extras (thumbnails, better descriptions) if available
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
  initFiltersAndSearch();
  loadRepos();
})();
