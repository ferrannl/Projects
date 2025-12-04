// --- Config ---
const GITHUB_USER = "ferrannl";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;

// --- State ---
let repos = [];
const state = {
  search: "",
  typeFilter: "all",
  languageFilter: "all"
};

// --- DOM ---
const gridEl = document.getElementById("projectsGrid");
const emptyEl = document.getElementById("emptyState");
const searchEl = document.getElementById("search");
const languageSelectEl = document.getElementById("languageFilter");
const typeChips = document.querySelectorAll(".chip[data-filter-type='type']");

// --- Type inference for each repo ---
function inferType(repo) {
  const name = (repo.name || "").toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const lang = (repo.language || "").toLowerCase();

  // If pages are enabled, treat as website
  if (repo.has_pages) return "website";

  // Typical website languages
  if (["html", "css", "javascript", "typescript", "php"].includes(lang)) {
    return "website";
  }

  // Mobile apps
  if (
    ["swift", "java", "kotlin"].includes(lang) &&
    (name.includes("android") || name.includes("ios") || desc.includes("android") || desc.includes("ios"))
  ) {
    return "mobile";
  }

  // APIs
  if (name.includes("api") || desc.includes("api")) {
    return "api";
  }

  // School / study vibe
  if (
    desc.includes("assignment") ||
    desc.includes("project") ||
    desc.includes("internship") ||
    desc.includes("final") ||
    desc.includes("cppls") ||
    desc.includes("devops")
  ) {
    return "school";
  }

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

// Map GitHub repo JSON → our internal object
function mapRepo(repo) {
  const type = inferType(repo);

  return {
    name: repo.name,
    description: repo.description || "No description yet.",
    language: repo.language || "Various",
    type,
    tags: buildTags(repo, type),
    githubUrl: repo.html_url,
    pagesUrl: repo.has_pages
      ? `https://${GITHUB_USER}.github.io/${repo.name}/`
      : null
  };
}

function buildTags(repo, type) {
  const tags = [];

  if (repo.fork) tags.push("fork");
  if (repo.archived) tags.push("archived");

  if (type === "website") tags.push("web");
  if (type === "mobile") tags.push("mobile");
  if (type === "api") tags.push("api");
  if (type === "school") tags.push("school");

  return tags;
}

// --- Filtering logic ---
function matchesFilters(project) {
  // Type filter
  if (state.typeFilter !== "all" && project.type !== state.typeFilter) {
    return false;
  }

  // Language filter
  if (state.languageFilter !== "all" && project.language !== state.languageFilter) {
    return false;
  }

  // Search filter
  if (state.search) {
    const haystack = [
      project.name,
      project.description,
      project.language,
      project.type,
      ...(project.tags || [])
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(state.search)) return false;
  }

  return true;
}

// --- Card creation (with collapsible description) ---
function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";

  // Title row
  const titleRow = document.createElement("div");
  titleRow.className = "project-title-row";

  const nameEl = document.createElement("h2");
  nameEl.className = "project-name";
  nameEl.textContent = project.name;

  const typePill = document.createElement("span");
  typePill.className = "project-type-pill";
  typePill.textContent = getTypeLabel(project.type);

  titleRow.appendChild(nameEl);
  titleRow.appendChild(typePill);

  // DESCRIPTION (collapsible)
  const descWrapper = document.createElement("div");
  descWrapper.className = "project-description-wrapper";

  const descEl = document.createElement("p");
  descEl.className = "project-description";
  descEl.textContent = project.description;
  descWrapper.appendChild(descEl);

  // Only show "Show more" if description is long-ish
  if (project.description && project.description.length > 140) {
    const toggleBtn = document.createElement("span");
    toggleBtn.className = "show-more-btn";
    toggleBtn.textContent = "Show more";

    toggleBtn.addEventListener("click", () => {
      const expanded = descEl.classList.toggle("expanded");
      toggleBtn.textContent = expanded ? "Show less" : "Show more";
    });

    descWrapper.appendChild(toggleBtn);
  }

  // Meta row (language + tags)
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

  // Links
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

  // Footer meta
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

// --- Rendering ---
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

// --- UI setup (filters & search) ---
function initFiltersAndSearch() {
  // Type chips
  typeChips.forEach(chip => {
    chip.addEventListener("click", () => {
      typeChips.forEach(c => c.classList.remove("chip-active"));
      chip.classList.add("chip-active");
      state.typeFilter = chip.getAttribute("data-filter-value") || "all";
      renderProjects();
    });
  });

  // Search
  if (searchEl) {
    searchEl.addEventListener("input", () => {
      state.search = searchEl.value.toLowerCase().trim();
      renderProjects();
    });
  }
}

// Populate language dropdown based on loaded repos
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

// --- Load repos from GitHub ---
async function loadRepos() {
  if (gridEl) {
    gridEl.innerHTML = "<p class='project-footer-meta'>Loading projects from GitHub…</p>";
  }
  if (emptyEl) emptyEl.hidden = true;

  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }
    const data = await res.json();

    repos = data
      .filter(r => !r.private)
      .map(mapRepo);

    initLanguageFilter();
    renderProjects();
  } catch (err) {
    console.error(err);
    if (gridEl) {
      gridEl.innerHTML = "";
    }
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = "Could not load projects from GitHub (rate limit / network issue?).";
    }
  }
}

// --- Init (script at end of body so DOM is ready) ---
(function init() {
  initFiltersAndSearch();
  loadRepos();
})();
