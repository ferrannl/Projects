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

function prettifyName(raw) {
  if (!raw) return "";

  // Normalize separators
  let s = raw.replace(/[-_.]+/g, " ");

  // Split camelCase and weird capitals like IOS / iOS / IoS
  s = s.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  s = s.replace(/\s+/g, " ").trim();

  let words = s.split(" ").map(w => w.trim());

  // If any combination equals "ios", force it back into a single word iOS
  const reIOS = /^i?os$/i;
  words = words.flatMap((w, i) => {
    if (reIOS.test(w)) return ["iOS"];
    return [w];
  });

  // Lowercase original words but preserve SPECIAL_WORDS and iOS
  const lowerWords = words.map(w => w.toLowerCase());

  const resultWords = lowerWords.map((word, idx) => {
    if (word === "ios") return "iOS";  // force correct Apple branding

    if (SPECIAL_WORDS[word]) {
      return SPECIAL_WORDS[word];
    }

    if (idx > 0 && SMALL_WORDS.has(word)) {
      return word;
    }

    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return resultWords.join(" ");
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

function buildTagsBase(type) {
  const tags = [];
  if (type === "website") tags.push("web");
  if (type === "mobile")  tags.push("mobile");
  if (type === "api")     tags.push("api");
  if (type === "school")  tags.push("school");
  return tags;
}

/* ---------- Map GitHub repo → internal ---------- */

function mapRepoFromGitHub(repo) {
  const type = inferTypeFromGitHub(repo);
  const baseDesc = repo.description || "No description yet.";

  return {
    rawName: repo.name,
    displayName: prettifyName(repo.name),
    language: repo.language || "Various",
    type,
    tags: buildTagsBase(type),
    githubUrl: repo.html_url,
    pagesUrl: repo.has_pages
      ? `https://${GITHUB_USER}.github.io/${repo.name}/`
      : null,
    baseDescription: baseDesc,
    summary: baseDesc,
    thumbnailUrl: null  // may be filled from projects.json or auto-detect
  };
}

/* ---------- Map projects.json entry → internal ---------- */

function mapEntryToProject(entry) {
  const type = inferTypeFromEntry(entry);
  const baseDesc = entry.description || "No description yet.";
  const hasPages = !!entry.hasPages;
  const customPagesUrl = entry.pagesUrl;

  const tagsFromType = buildTagsBase(type);
  const extraTags = entry.tags ? entry.tags : [];
  const mergedTags = [...new Set([...tagsFromType, ...extraTags])];

  return {
    rawName: entry.name,
    displayName: prettifyName(entry.name),
    language: entry.language || "Various",
    type,
    tags: mergedTags,
    githubUrl: `https://github.com/${GITHUB_USER}/${entry.name}`,
    pagesUrl: hasPages
      ? (customPagesUrl || `https://${GITHUB_USER}.github.io/${entry.name}/`)
      : null,
    baseDescription: baseDesc,
    summary: baseDesc,
    thumbnailUrl: entry.thumbnailUrl && entry.thumbnailUrl.trim()
      ? entry.thumbnailUrl.trim()
      : null
  };
}

/* ---------- Filter / search ---------- */

function matchesFilters(project) {
  if (state.typeFilter !== "all" && project.type !== state.typeFilter) return false;
  if (state.languageFilter !== "all" && project.language !== state.languageFilter) return false;

  if (state.search) {
    const haystack = [
      project.rawName,
      project.displayName,
      project.summary,
      project.language,
      project.type,
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

  if (project.language) {
    const langPill = document.createElement("span");
    langPill.className = "meta-pill language";
    langPill.textContent = project.language;
    metaRow.appendChild(langPill);
  }

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

  if (project.pagesUrl) {
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

  const filtered = repos.filter(matchesFilters);

  if (!filtered.length) {
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = "No projects match your search/filter. Try another search term.";
    }
    return;
  }

  if (emptyEl) emptyEl.hidden = true;

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
    new Set(repos.map(r => r.language).filter(Boolean))
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
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(projects) {
  try {
    const payload = {
      projects,
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

function getThumbnailCandidates(project) {
  // Root-level usual suspects
  const base = [
    "logo.png",
    "logo.jpg",
    "logo.jpeg",
    "logo.svg",
    "favicon.png",
    "favicon.ico",
    "banner.png",
    "banner.jpg",
    "hero.png",
    "hero.jpg",
    "screenshot.png",
    "screenshot.jpg",
    "class-diagram.png",
    "class-diagram.jpg",
    "diagram.png",
    "diagram.jpg",
    "uml.png",
    "uml.jpg",
    "model.png",
    "model.jpg"
  ];

  // Common subfolders
  const nested = [
    "images/logo.png",
    "images/logo.jpg",
    "images/logo.jpeg",
    "images/favicon.png",
    "images/favicon.ico",
    "images/class-diagram.png",
    "images/diagram.png",
    "images/uml.png",

    "img/logo.png",
    "img/logo.jpg",
    "img/favicon.png",
    "img/class-diagram.png",
    "img/diagram.png",

    "assets/logo.png",
    "assets/logo.jpg",
    "assets/banner.png",
    "assets/hero.png",

    "public/logo.png",
    "public/logo.jpg",
    "public/favicon.png"
  ];

  return [...base, ...nested];
}

async function findThumbnailForRepo(project) {
  if (project.thumbnailUrl) return; // already has one from projects.json

  const candidates = getThumbnailCandidates(project);

  for (const path of candidates) {
    const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${project.rawName}/HEAD/${path}`;
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.ok) {
        project.thumbnailUrl = url;
        return;
      }
    } catch (e) {
      console.error("Thumb fetch failed", project.rawName, path, e);
    }
  }
}

async function enhanceThumbnails() {
  // Don't hammer too hard: limit how many repos we probe per load
  const subset = repos.slice(0, 60);
  const tasks = subset.map((project) => findThumbnailForRepo(project));
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
    const projects = Array.isArray(data) ? data.map(mapEntryToProject) : [];
    repos = projects;
    initLanguageFilter();
    renderProjects();
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
    gridEl.innerHTML = "<p class='project-footer-meta'>Loading projects…</p>";
  }
  if (emptyEl) emptyEl.hidden = true;

  const cache = getCache();
  let usedCache = false;

  // 1) Use cache if present
  if (cache && Array.isArray(cache.projects)) {
    const age = Date.now() - (cache.fetchedAt || 0);
    repos = cache.projects;
    initLanguageFilter();
    renderProjects();
    usedCache = true;

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
      .map(mapRepoFromGitHub);

    // Merge projects.json extras (thumbnails, better descriptions) if available
    try {
      const fallbackRes = await fetch(PROJECTS_URL);
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (Array.isArray(fallbackData)) {
          const byName = new Map(
            fallbackData.map(entry => [entry.name, mapEntryToProject(entry)])
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
  initFiltersAndSearch();
  loadRepos();
})();
