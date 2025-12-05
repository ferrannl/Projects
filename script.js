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

// --- DOM refs ---
const gridEl = document.getElementById("projectsGrid");
const emptyEl = document.getElementById("emptyState");
const searchEl = document.getElementById("search");
const languageSelectEl = document.getElementById("languageFilter");
const typeChips = document.querySelectorAll(".chip[data-filter-type='type']");

// --- Helpers for README summary ---

/**
 * Extracts a small summary from README markdown:
 * - skips headings / badges / empty top lines
 * - takes a few content lines
 * - splits into "main" and "extra" (for faded lines)
 */
function extractSummaryFromReadme(markdown) {
  if (!markdown) return null;

  const lines = markdown.split(/\r?\n/);
  const cleanLines = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and heading/badge noise at top
    if (
      !cleanLines.length &&
      (
        trimmed === "" ||
        /^#{1,6}\s/.test(trimmed) ||         // markdown headings
        /^\[!\[/.test(trimmed) ||            // badges
        /^!\[/.test(trimmed) ||              // images
        /^<\!--/.test(trimmed)               // comments
      )
    ) {
      continue;
    }

    if (trimmed) {
      cleanLines.push(trimmed);
    }

    // We only need a small preview
    if (cleanLines.length >= 7) break;
  }

  if (!cleanLines.length) return null;

  const primaryLines = cleanLines.slice(0, 3);   // fully visible
  const extraLines   = cleanLines.slice(3, 5);   // faded, clickable
  const main = primaryLines.join(" ");
  const extra = extraLines.join(" ");
  const fullPreview = cleanLines.join(" ");

  return { main, extra, fullPreview };
}

// --- Type inference for each repo ---
function inferType(repo) {
  const name = (repo.name || "").toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const lang = (repo.language || "").toLowerCase();

  // Pages → website
  if (repo.has_pages) return "website";

  // Typical website stack
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

// Map GitHub repo JSON → internal object
function mapRepo(repo) {
  const type = inferType(repo);
  const baseDesc = repo.description || "No description yet.";

  return {
    name: repo.name,
    language: repo.language || "Various",
    type,
    tags: buildTags(repo, type),
    githubUrl: repo.html_url,
    pagesUrl: repo.has_pages
      ? `https://${GITHUB_USER}.github.io/${repo.name}/`
      : null,

    // description-related fields
    baseDescription: baseDesc,        // raw fallback
    descriptionMain: baseDesc,        // main visible summary
    descriptionExtra: "",             // faded “extra lines”
    fullReadme: "",                   // first chunk from README
  };
}

// --- Filtering logic ---
function matchesFilters(project) {
  if (state.typeFilter !== "all" && project.type !== state.typeFilter) {
    return false;
  }

  if (state.languageFilter !== "all" && project.language !== state.languageFilter) {
    return false;
  }

  if (state.search) {
    const haystack = [
      project.name,
      project.descriptionMain,
      project.descriptionExtra,
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

// --- Card creation with README-based summary ---
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

  // DESCRIPTION WRAPPER
  const descWrapper = document.createElement("div");
  descWrapper.className = "project-description-wrapper";

  const mainText = project.descriptionMain || project.baseDescription || "";
  const extraText = project.descriptionExtra || "";

  const descMainEl = document.createElement("p");
  descMainEl.className = "project-description-main";
  descMainEl.textContent = mainText;
  descWrapper.appendChild(descMainEl);

  let extraEl = null;
  if (extraText) {
    extraEl = document.createElement("p");
    extraEl.className = "project-description-extra";
    extraEl.textContent = extraText;
    descWrapper.appendChild(extraEl);
  }

  // Collapsible logic: only for repos where we actually have a fullReadme
  const longEnough = project.fullReadme && project.fullReadme.length > 280;

  if (longEnough) {
    descWrapper.classList.add("is-collapsible", "is-collapsed");

    const toggleBtn = document.createElement("span");
    toggleBtn.className = "show-more-btn";
    toggleBtn.textContent = "Show full README";

    const handleToggle = () => {
      const isCurrentlyCollapsed = descWrapper.classList.contains("is-collapsed");
      if (isCurrentlyCollapsed) {
        // Expand – show a bigger chunk of the README
        const expandedText = project.fullReadme.slice(0, 1600); // still capped
        descMainEl.textContent = expandedText;
        if (extraEl) {
          extraEl.style.display = "none";
        }
        descWrapper.classList.remove("is-collapsed");
        descWrapper.classList.add("is-expanded");
        toggleBtn.textContent = "Show less";
      } else {
        // Collapse – go back to small summary (main + faded extra)
        descMainEl.textContent = mainText;
        if (extraEl) {
          extraEl.style.display = "";
        }
        descWrapper.classList.remove("is-expanded");
        descWrapper.classList.add("is-collapsed");
        toggleBtn.textContent = "Show full README";
      }
    };

    toggleBtn.addEventListener("click", handleToggle);

    // Clicking the faded lines also expands
    if (extraEl) {
      extraEl.addEventListener("click", handleToggle);
    }

    descWrapper.appendChild(toggleBtn);
  }

  // Meta row
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

// --- UI setup ---
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

// Language dropdown
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

// --- Enrich repos with README summaries ---
async function enhanceDescriptionsFromReadme() {
  const tasks = repos.map(async (project) => {
    try {
      const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${project.name}/HEAD/README.md`;
      const res = await fetch(url);
      if (!res.ok) return; // no README, just keep base description

      const text = await res.text();
      const summary = extractSummaryFromReadme(text);
      if (!summary) return;

      project.fullReadme = summary.fullPreview;
      project.descriptionMain = summary.main || project.baseDescription;
      project.descriptionExtra = summary.extra || "";
    } catch (e) {
      console.error("README fetch failed for", project.name, e);
    }
  });

  await Promise.all(tasks);

  // After all summaries are fetched, re-render with nicer descriptions
  renderProjects();
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
    // Initial render with plain descriptions
    renderProjects();
    // Then upgrade descriptions using README summaries
    enhanceDescriptionsFromReadme().catch(console.error);
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

// --- Init ---
(function init() {
  initFiltersAndSearch();
  loadRepos();
})();
