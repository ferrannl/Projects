const GITHUB_USER = "ferrannl";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;

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

function prettifyName(raw) {
  if (!raw) return "";
  let s = raw.replace(/[-_.]+/g, " ");
  s = s.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  s = s.replace(/\s+/g, " ").trim();

  const originalWords = s.split(" ");
  const lowerWords = s.toLowerCase().split(" ");

  const resultWords = lowerWords.map((word, idx) => {
    if (!word.length) return word;

    if (SPECIAL_WORDS[word]) return SPECIAL_WORDS[word];
    if (idx > 0 && SMALL_WORDS.has(word)) return word;

    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return resultWords.join(" ");
}

// Just use GitHub description directly; no extra README fetches.
function buildShortSummaryFromDescription(desc) {
  if (!desc) return "No description yet.";
  const maxLen = 220;
  let text = desc.trim();
  if (text.length > maxLen) {
    text = text.slice(0, maxLen - 1);
    const lastSpace = text.lastIndexOf(" ");
    if (lastSpace > 60) {
      text = text.slice(0, lastSpace);
    }
    text += "…";
  }
  return text;
}

function inferType(repo) {
  const name = (repo.name || "").toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const lang = (repo.language || "").toLowerCase();

  if (repo.has_pages) return "website";

  if (["html", "css", "javascript", "typescript", "php"].includes(lang)) {
    return "website";
  }

  if (
    ["swift", "java", "kotlin"].includes(lang) &&
    (name.includes("android") || name.includes("ios") || desc.includes("android") || desc.includes("ios"))
  ) {
    return "mobile";
  }

  if (name.includes("api") || desc.includes("api")) {
    return "api";
  }

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

function getEmojiForProject(project) {
  switch (project.type) {
    case "website": return "🌐";
    case "mobile":  return "📱";
    case "api":     return "🔌";
    case "school":  return "🎓";
    default:        return "🧪";
  }
}

function mapRepo(repo) {
  const type = inferType(repo);
  const baseDesc = repo.description || "No description yet.";

  const project = {
    rawName: repo.name,
    displayName: prettifyName(repo.name),
    language: repo.language || "Various",
    type,
    tags: buildTags(repo, type),
    githubUrl: repo.html_url,
    pagesUrl: repo.has_pages
      ? `https://${GITHUB_USER}.github.io/${repo.name}/`
      : null,
    summary: buildShortSummaryFromDescription(baseDesc),
    thumbnailEmoji: null
  };

  project.thumbnailEmoji = getEmojiForProject(project);
  return project;
}

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

// Modal only matters if we ever put real images back in.
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

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";

  const titleRow = document.createElement("div");
  titleRow.className = "project-title-row";

  // Emoji "thumbnail"
  const thumbBtn = document.createElement("div");
  thumbBtn.className = "project-thumb";
  const emojiSpan = document.createElement("span");
  emojiSpan.className = "project-thumb-emoji";
  emojiSpan.textContent = project.thumbnailEmoji || getEmojiForProject(project);
  thumbBtn.appendChild(emojiSpan);
  titleRow.appendChild(thumbBtn);

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

function renderProjects() {
  if (!gridEl) return;
  gridEl.innerHTML = "";

  const filtered = repos.filter(matchesFilters);

  if (!filtered.length) {
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = "No projects match your search/filter.";
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

async function loadRepos() {
  if (gridEl) {
    gridEl.innerHTML = "<p class='project-footer-meta'>Loading projects from GitHub…</p>";
  }
  if (emptyEl) emptyEl.hidden = true;

  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("GitHub API error:", res.status, text);
      throw new Error(`GitHub API error: ${res.status}`);
    }
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("GitHub API did not return a list of repos.");
    }

    repos = data
      .filter(r => !r.private)
      .map(mapRepo);

    console.log("Loaded repos:", repos.length);

    if (!repos.length) {
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.textContent = "No public repositories found for this user.";
      }
      if (gridEl) gridEl.innerHTML = "";
      return;
    }

    initLanguageFilter();
    renderProjects();
  } catch (err) {
    console.error("Error loading repos:", err);
    if (gridEl) gridEl.innerHTML = "";
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent =
        "Could not load projects from GitHub (API or network error). See console for details.";
    }
  }
}

(function init() {
  initFiltersAndSearch();
  loadRepos();
})();
