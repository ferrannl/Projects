import { TRANSLATIONS, DEFAULT_LANG, getCurrentLang } from "./common.js";

// ---------- Media Wall logic ----------

let mediaItems = [];
const mediaState = {
  search: "",
  kind: "all",
  format: "all"
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

function buildMediaFormatOptions() {
  if (!mediaFormatSelectEl) return;

  const lang = getCurrentLang();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];

  mediaFormatSelectEl.innerHTML = "";

  const optAll = document.createElement("option");
  optAll.value = "all";
  optAll.setAttribute("data-i18n", "mediaFormatAll");
  optAll.textContent = dict.mediaFormatAll || "All formats";
  mediaFormatSelectEl.appendChild(optAll);

  const exts = Array.from(
    new Set(
      mediaItems.map(item => getExtension(item.src)).filter(Boolean)
    )
  ).sort();

  exts.forEach(ext => {
    const opt = document.createElement("option");
    opt.value = ext;
    opt.textContent = ext.toUpperCase();
    mediaFormatSelectEl.appendChild(opt);
  });
}

function mediaMatches(item) {
  if (mediaState.kind !== "all" && item.type !== mediaState.kind) {
    return false;
  }

  if (mediaState.format !== "all") {
    const ext = getExtension(item.src);
    if (ext !== mediaState.format) return false;
  }

  if (mediaState.search) {
    const hay = `${item.title || ""} ${item.src || ""} ${item.type || ""}`.toLowerCase();
    if (!hay.includes(mediaState.search)) return false;
  }

  return true;
}

function createMediaCard(item) {
  const card = document.createElement("article");
  card.className = "media-card";

  const thumb = document.createElement("div");
  thumb.className = "media-thumb";

  if (item.type === "image") {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.title || "";
    thumb.appendChild(img);
  } else if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.src;
    video.controls = true;
    video.playsInline = true;
    thumb.appendChild(video);
  } else if (item.type === "audio") {
    thumb.classList.add("media-thumb-audio");
    const audio = document.createElement("audio");
    audio.src = item.src;
    audio.controls = true;
    thumb.appendChild(audio);
  }

  const titleEl = document.createElement("p");
  titleEl.className = "media-title";
  titleEl.textContent = item.title || item.src;

  const metaRow = document.createElement("div");
  metaRow.className = "media-meta-row";

  const kindPill = document.createElement("span");
  kindPill.className = "media-pill";
  kindPill.textContent = item.type;
  metaRow.appendChild(kindPill);

  const ext = getExtension(item.src);
  if (ext) {
    const extPill = document.createElement("span");
    extPill.className = "media-pill";
    extPill.textContent = ext.toUpperCase();
    metaRow.appendChild(extPill);
  }

  card.appendChild(thumb);
  card.appendChild(titleEl);
  card.appendChild(metaRow);

  return card;
}

function renderMedia() {
  if (!mediaGridEl) return;
  mediaGridEl.innerHTML = "";

  let filtered = mediaItems.filter(mediaMatches);

  if (!filtered.length) {
    if (mediaEmptyEl) mediaEmptyEl.hidden = false;
    return;
  }

  if (mediaEmptyEl) mediaEmptyEl.hidden = true;

  filtered.forEach(item => {
    const card = createMediaCard(item);
    mediaGridEl.appendChild(card);
  });
}

async function loadMediaIndex() {
  try {
    const res = await fetch("./media/media-index.json", { cache: "no-store" });
    if (!res.ok) {
      console.warn("No media-index.json found or HTTP error:", res.status);
      return;
    }
    const data = await res.json();
    mediaItems = Array.isArray(data.items) ? data.items : [];
    console.log(`Loaded ${mediaItems.length} media items from media-index.json`);
    buildMediaFormatOptions();
    renderMedia();
  } catch (err) {
    console.error("Error loading media-index.json:", err);
  }
}

function initMediaFilters() {
  mediaKindButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      mediaKindButtons.forEach(b => b.classList.remove("chip-active"));
      btn.classList.add("chip-active");
      mediaState.kind = btn.getAttribute("data-media-kind") || "all";
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

// ---------- Public API for main.js ----------

export function setMediaSearch(query) {
  mediaState.search = (query || "").toLowerCase().trim();
  renderMedia();
}

export function refreshMediaView() {
  renderMedia();
}

export function initMediaWall() {
  initMediaFilters();
  loadMediaIndex();
}
