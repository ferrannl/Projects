/* ---------- Ferran’s Projects – main.js ---------- */

const GITHUB_USER = "ferrannl";
const PROJECTS_URL = "./projects/projects.json";
const MEDIA_URL = "./media/media.json";

const CACHE_KEY = "ferranProjectsCacheV2";
const RATE_LIMIT_KEY = "ferranProjectsRateLimitV2";
const CACHE_TTL_MS = 1000 * 60 * 30;
const RATE_LIMIT_BACKOFF_MS = 1000 * 60 * 60;

let repos = [];
let mediaItems = [];

const state = {
  search: "",
  typeFilter: "all",
  languageFilter: "all",
  mediaType: "all",
  mediaFormat: "all",
};

const gridEl = document.getElementById("projectsGrid");
const mediaGridEl = document.getElementById("mediaGrid");
const emptyEl = document.getElementById("emptyState");
const mediaEmptyEl = document.getElementById("mediaEmptyState");
const searchEl = document.getElementById("search");
const typeSelect = document.getElementById("typeFilter");
const langSelect = document.getElementById("languageFilter");
const mediaTypeSelect = document.getElementById("mediaTypeFilter");
const mediaFormatSelect = document.getElementById("mediaFormatFilter");

/* ---------- Load & render projects ---------- */
async function loadProjects() {
  const res = await fetch(PROJECTS_URL);
  if (!res.ok) throw new Error("Failed to load projects.json");
  repos = await res.json();
  renderProjects();
}

function renderProjects() {
  if (!repos.length) {
    gridEl.innerHTML = "";
    emptyEl.hidden = false;
    return;
  }

  const filtered = repos.filter((repo) => {
    const textMatch =
      repo.name.toLowerCase().includes(state.search) ||
      repo.description.toLowerCase().includes(state.search);
    const typeMatch =
      state.typeFilter === "all" || repo.type === state.typeFilter;
    const langMatch =
      state.languageFilter === "all" || repo.language === state.languageFilter;
    return textMatch && typeMatch && langMatch;
  });

  gridEl.innerHTML = filtered
    .map(
      (r) => `
      <article class="project-card">
        <div class="project-title-row">
          <div class="project-thumb ${
            r.thumbnailUrl ? "has-image" : ""
          }">${r.thumbnailUrl ? `<img src="${r.thumbnailUrl}" alt="${r.name}" />` : `<span>${r.name[0].toUpperCase()}</span>`}</div>
          <div class="project-title-text">
            <h3 class="project-title">${r.name}</h3>
            <p class="project-lang">${r.language || "—"}</p>
          </div>
        </div>
        <p class="project-desc">${r.description || "No description"}</p>
        <div class="project-actions">
          <a href="${r.html_url}" target="_blank" class="btn-card">GitHub</a>
          ${
            r.hasPages
              ? `<a href="${r.pagesUrl}" target="_blank" class="btn-card btn-card-live"><span>Live site</span></a>`
              : ""
          }
        </div>
      </article>
    `
    )
    .join("");

  emptyEl.hidden = filtered.length > 0;
}

/* ---------- Load & render media ---------- */
async function loadMedia() {
  const res = await fetch(MEDIA_URL);
  if (!res.ok) throw new Error("Failed to load media.json");
  const data = await res.json();
  mediaItems = data.items || [];
  renderMedia();
}

function renderMedia() {
  const filtered = mediaItems.filter((m) => {
    const searchMatch = m.title.toLowerCase().includes(state.search);
    const typeMatch = state.mediaType === "all" || m.type === state.mediaType;
    const ext = m.src.split(".").pop().toLowerCase();
    const formatMatch = state.mediaFormat === "all" || ext === state.mediaFormat;
    return searchMatch && typeMatch && formatMatch;
  });

  mediaGridEl.innerHTML = filtered
    .map(
      (m) => `
      <article class="media-card">
        <div class="media-preview ${
          m.type === "image" ? "clickable" : ""
        }">${renderMediaPreview(m)}</div>
        <h3 class="media-title">${m.title}</h3>
        <div class="media-meta">
          <span class="badge-media-type">${m.type}</span>
          <span class="badge-media-format">${m.src.split(".").pop()}</span>
        </div>
        <div class="media-actions">
          <a href="${m.src}" target="_blank" class="media-action-btn">View</a>
          <a href="${m.src}" download class="media-action-btn">Download</a>
        </div>
      </article>
    `
    )
    .join("");

  mediaEmptyEl.hidden = filtered.length > 0;
}

function renderMediaPreview(m) {
  if (m.type === "image") return `<img src="${m.src}" alt="${m.title}" />`;
  if (m.type === "video") return `<video src="${m.src}" controls></video>`;
  if (m.type === "audio") return `<audio src="${m.src}" controls></audio>`;
  return `<span>Unknown</span>`;
}

/* ---------- Search & filters ---------- */
searchEl.addEventListener("input", (e) => {
  state.search = e.target.value.toLowerCase();
  renderProjects();
  renderMedia();
});
typeSelect.addEventListener("change", (e) => {
  state.typeFilter = e.target.value;
  renderProjects();
});
langSelect.addEventListener("change", (e) => {
  state.languageFilter = e.target.value;
  renderProjects();
});
mediaTypeSelect.addEventListener("change", (e) => {
  state.mediaType = e.target.value;
  renderMedia();
});
mediaFormatSelect.addEventListener("change", (e) => {
  state.mediaFormat = e.target.value;
  renderMedia();
});

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  document.body.classList.add("js-enabled");
  try {
    await loadProjects();
    await loadMedia();
  } catch (err) {
    console.error(err);
  }
});
