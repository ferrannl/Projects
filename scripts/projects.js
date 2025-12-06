import { TRANSLATIONS, DEFAULT_LANG, getCurrentLang } from "./common.js";

// ---------- Projects logic (GitHub + projects.json) ----------

const GITHUB_USER = "ferrannl";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
const PROJECTS_URL = "./projects.json";

const CACHE_KEY = "ferranProjectsCacheV2";
const RATE_LIMIT_KEY = "ferranProjectsRateLimitV2";
const CACHE_TTL_MS = 1000 * 60 * 30;   // 30 minutes
const RATE_LIMIT_BACKOFF_MS = 1000 * 60 * 60; // 1 hour after rate-limit

let repos = [];

const state = {
  search: "",
  typeFilter: "all",
  languageFilter: "all"
};

const gridEl = document.getElementById("projectsGrid");
const emptyEl = document.getElementById("emptyState");
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

function choosePrimaryType(types) {
  if (!types || !types.length) return "other";
  const order = ["website", "mobile", "api", "school", "other"];
  const found = order.find(t => types.includes(t));
  return found || types[0];
}

function inferTypesFromGitHub(repo) {
  const types = [];
  const name = (repo.name || "").toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const lang = (repo.language || "").toLowerCase();

  const looksWebLang = ["html", "css", "javascript", "typescript", "php"].includes(lang);
  const looksMobileText =
    name.includes("android") || desc.includes("android") ||
    name.includes("ios") || desc.includes("ios");
  const looksMobileLang = ["swift", "java", "kotlin"].includes(lang);
  const seemsSchool =
    desc.includes("assignment") ||
    desc.includes("project") ||
    desc.includes("internship") ||
    desc.includes("final") ||
    desc.includes("cppls") ||
    desc.includes("devops");

  if (repo.has_pages || looksWebLang) {
    types.push("website");
  }

  if (looksMobileText || looksMobileLang) {
    types.push("mobile");
  }

  if (name.includes("api") || desc.includes("api")) {
    types.push("api");
  }

  if (seemsSchool) {
    types.push("school");
  }

  if (!types.length) {
    types.push("other");
  }

  return [...new Set(types)];
}

function inferTypesFromEntry(entry) {
  const types = [];
  const lang = (entry.language || "").toLowerCase();
  const name = (entry.name || "").toLowerCase();
  const desc = (entry.description || "").toLowerCase();

  const looksWebLang = ["html", "css", "javascript", "typescript", "php"].includes(lang);
  const looksMobileText =
    name.includes("android") || desc.includes("android") ||
    name.includes("ios") || desc.includes("ios");
  const looksMobileLang = ["swift", "java", "kotlin"].includes(lang);
  const seemsSchool =
    desc.includes("assignment") ||
    desc.includes("project") ||
    desc.includes("internship") ||
    desc.includes("final") ||
    desc.includes("cppls") ||
    desc.includes("devops");

  if (looksWebLang) {
    types.push("website");
  }

  if (looksMobileText || looksMobileLang) {
    types.push("mobile");
  }

  if (name.includes("api") || desc.includes("api")) {
    types.push("api");
  }

  if (seemsSchool) {
    types.push("school");
  }

  if (!types.length) {
    types.push("other");
  }

  return [...new Set(types)];
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
  types.forEach(t => {
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
    thumbnailUrl: null
  };
}

function mapEntryToProject(entry) {
  const types = inferTypesFromEntry(entry);
  const primaryType = choosePrimaryType(types);

  const baseDesc = entry.description || "No description yet.";
  const hasPagesFlag = !!entry.hasPages;
  const customPagesUrl = entry.pagesUrl;
  const primaryLang = entry.language || "Various";
  const languages = computeLanguages(primaryLang, entry.name, entry.description, types);

  let tagsFromType = [];
  types.forEach(t => {
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
    ? (customPagesUrl || `https://${GITHUB_USER}.github.io/${entry.name}/`)
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
    thumbnailUrl
  };
}

// ---------- Filter / search (projects) ----------

function matchesProjectFilters(project) {
  const rawName = project.rawName || "";
  if (isSelfProjectsRepoName(rawName)) return false;

  const projectTypes = project.types && project.types.length
    ? project.types
    : (project.type ? [project.type] : []);

  if (state.typeFilter !== "all") {
    if (!projectTypes.includes(state.typeFilter)) return false;
  }

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
      ...(project.tags || []),
      ...(project.types || [])
    ].join(" ").toLowerCase();

    if (!haystack.includes(state.search)) return false;
  }

  return true;
}

// ---------- Modal ----------

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

// ---------- Project cards ----------

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

  const mainFooterType = mainType;
  footerMeta.textContent =
    mainFooterType === "school" ? "Study / assignment project" :
    mainFooterType === "website" ? "Front-end / website project" :
    mainFooterType === "mobile" ? "Mobile client app" :
    mainFooterType === "api"    ? "Backend / API project" :
                                  "Misc project";

  card.appendChild(titleRow);
  card.appendChild(descWrapper);
  card.appendChild(metaRow);
  card.appendChild(linksRow);
  card.appendChild(footerMeta);

  return card;
}

// ---------- Render projects ----------

function renderProjects() {
  if (!gridEl) return;
  gridEl.innerHTML = "";

  let filtered = repos.filter(matchesProjectFilters);

  if (!filtered.length) {
    if (emptyEl) emptyEl.hidden = false;
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

// ---------- Filters (UI hooks) ----------

function initTypeFilter() {
  typeChips.forEach(chip => {
    chip.addEventListener("click", () => {
      typeChips.forEach(c => c.classList.remove("chip-active"));
      chip.classList.add("chip-active");
      state.typeFilter = chip.getAttribute("data-filter-value") || "all";
      renderProjects();
    });
  });
}

function initLanguageFilter() {
  if (!languageSelectEl) return;
  languageSelectEl.innerHTML = "";

  const lang = getCurrentLang();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.setAttribute("data-i18n", "languageFilterAll");
  allOption.textContent = dict.languageFilterAll || "All languages";
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

  languages.forEach(langName => {
    const opt = document.createElement("option");
    opt.value = langName;
    opt.textContent = langName;
    languageSelectEl.appendChild(opt);
  });

  languageSelectEl.addEventListener("change", () => {
    state.languageFilter = languageSelectEl.value;
    renderProjects();
  });
}

// ---------- Cache helpers ----------

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

// ---------- Thumbnail autodetect ----------

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

// ---------- Live site verification ----------

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

// ---------- Fallback: projects.json ----------

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
    }
  }
}

// ---------- Load repos from GitHub ----------

async function loadRepos() {
  if (gridEl) {
    gridEl.innerHTML = "<p class='project-footer-meta'>Loading projects…</p>";
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

// ---------- Public API for main.js ----------

export function setProjectSearch(query) {
  state.search = (query || "").toLowerCase().trim();
  renderProjects();
}

export function refreshProjectsView() {
  renderProjects();
}

export function initProjects() {
  initTypeFilter();
  loadRepos();
}
