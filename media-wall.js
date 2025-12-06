// ---------- CONFIG: add your media here ----------
//
// Drop files in:
//   media/images/...  (png, jpg, jpeg, gif, webp, bmp, svg, etc.)
//   media/videos/...  (mp4, webm, mov, etc.)
//   media/audio/...   (mp3, wav, ogg, etc.)
//
// Then list them below. url is from site root.

const MEDIA_ITEMS = [
  // IMAGES
  {
    type: "image",
    url: "media/images/example-photo-1.jpg",
    title: "Example Photo 1",
    description: "Replace this with your own image description.",
    tags: ["photo", "example"]
  },
  {
    type: "image",
    url: "media/images/example-artwork.bmp",
    title: "Retro Artwork",
    description: "Supports bmp, png, jpg, svg and more.",
    tags: ["art", "retro"]
  },

  // VIDEOS
  {
    type: "video",
    url: "media/videos/example-video.mp4",
    title: "Example Clip",
    description: "MP4 / WebM or whatever your browser supports.",
    tags: ["clip", "2000s"]
  },

  // AUDIO
  {
    type: "audio",
    url: "media/audio/example-audio.mp3",
    title: "Example Track",
    description: "MP3 / WAV / OGG etc.",
    tags: ["audio", "music"]
  }

  // 👉 Add more entries here:
  // {
  //   type: "image" | "video" | "audio",
  //   url: "media/images/your-file-name.xxx",
  //   title: "Nice title",
  //   description: "Optional description",
  //   tags: ["optional", "tags"]
  // }
];

// ---------- State & DOM ----------

const mediaGridEl = document.getElementById("mediaGrid");
const mediaEmptyEl = document.getElementById("mediaEmptyState");
const mediaSearchEl = document.getElementById("mediaSearch");
const mediaFilterButtons = document.querySelectorAll("[data-media-filter]");

const lightboxEl = document.getElementById("mediaLightbox");
const lightboxCloseEl = document.getElementById("mediaLightboxClose");
const lightboxContentEl = document.getElementById("mediaLightboxContent");
const lightboxCaptionEl = document.getElementById("mediaLightboxCaption");

const mediaState = {
  filter: "all",
  search: ""
};

// ---------- Utils ----------

function normalizeText(str) {
  return (str || "").toLowerCase();
}

function mediaMatchesFilters(item) {
  if (mediaState.filter !== "all" && item.type !== mediaState.filter) {
    return false;
  }

  if (mediaState.search) {
    const haystack = [
      item.title,
      item.description,
      ...(item.tags || [])
    ].join(" ");
    return normalizeText(haystack).includes(mediaState.search);
  }

  return true;
}

function getShortTags(item) {
  const tags = item.tags || [];
  if (!tags.length) return "";
  return tags.slice(0, 3).map(t => `#${t}`).join(" ");
}

function getTypeLabel(item) {
  if (item.type === "image") return "Image";
  if (item.type === "video") return "Video";
  if (item.type === "audio") return "Audio";
  return "Media";
}

// ---------- Tile creation ----------

function createMediaTile(item, index) {
  const tile = document.createElement("article");
  tile.className = "media-tile";

  // little random-ish tilt for 2000s vibe
  const tilt = (index % 3 === 0) ? -1.5 : (index % 3 === 1 ? 1.5 : 0.5);
  tile.style.setProperty("--media-tilt", `${tilt}deg`);

  const preview = document.createElement("div");
  preview.className = "media-tile-preview";

  const previewInner = document.createElement("div");
  previewInner.className = "media-tile-preview-inner";

  if (item.type === "image") {
    const img = document.createElement("img");
    img.src = item.url;
    img.alt = item.title || "Image";
    previewInner.appendChild(img);
  } else if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.style.pointerEvents = "none";
    previewInner.appendChild(video);

    const badge = document.createElement("div");
    badge.className = "media-play-badge";
    badge.innerHTML = `<span>▶</span><span>Play</span>`;
    preview.appendChild(badge);
  } else if (item.type === "audio") {
    const icon = document.createElement("div");
    icon.className = "media-audio-icon";
    icon.textContent = "♫";
    previewInner.appendChild(icon);

    const badge = document.createElement("div");
    badge.className = "media-play-badge";
    badge.innerHTML = `<span>▶</span><span>Listen</span>`;
    preview.appendChild(badge);
  }

  preview.appendChild(previewInner);
  tile.appendChild(preview);

  const body = document.createElement("div");
  body.className = "media-tile-body";

  const titleEl = document.createElement("div");
  titleEl.className = "media-tile-title";
  titleEl.textContent = item.title || "Untitled";
  body.appendChild(titleEl);

  const metaRow = document.createElement("div");
  metaRow.className = "media-tile-meta";

  const typePill = document.createElement("span");
  typePill.className = "media-tile-type-pill";
  typePill.textContent = getTypeLabel(item);
  metaRow.appendChild(typePill);

  const tagsEl = document.createElement("span");
  tagsEl.className = "media-tile-tags";
  tagsEl.textContent = getShortTags(item);
  metaRow.appendChild(tagsEl);

  body.appendChild(metaRow);
  tile.appendChild(body);

  tile.addEventListener("click", () => openLightbox(item));

  return tile;
}

// ---------- Lightbox ----------

function openLightbox(item) {
  if (!lightboxEl || !lightboxContentEl || !lightboxCaptionEl) return;

  lightboxContentEl.innerHTML = "";

  if (item.type === "image") {
    const img = document.createElement("img");
    img.src = item.url;
    img.alt = item.title || "Image";
    lightboxContentEl.appendChild(img);
  } else if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.url;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    lightboxContentEl.appendChild(video);
  } else if (item.type === "audio") {
    const audio = document.createElement("audio");
    audio.src = item.url;
    audio.controls = true;
    audio.autoplay = true;
    lightboxContentEl.appendChild(audio);
  } else {
    const p = document.createElement("p");
    p.textContent = "Unsupported media type.";
    lightboxContentEl.appendChild(p);
  }

  const pieces = [];
  if (item.title) pieces.push(item.title);
  if (item.description) pieces.push(item.description);
  if (item.tags && item.tags.length) pieces.push(item.tags.map(t => `#${t}`).join(" "));

  lightboxCaptionEl.textContent = pieces.join(" · ");

  lightboxEl.hidden = false;
}

function closeLightbox() {
  if (!lightboxEl) return;
  lightboxEl.hidden = true;

  if (lightboxContentEl) {
    lightboxContentEl.innerHTML = "";
  }
}

// ---------- Render ----------

function renderMediaWall() {
  if (!mediaGridEl) return;
  mediaGridEl.innerHTML = "";

  const filtered = MEDIA_ITEMS.filter(mediaMatchesFilters);

  if (!filtered.length) {
    if (mediaEmptyEl) mediaEmptyEl.hidden = false;
    return;
  } else if (mediaEmptyEl) {
    mediaEmptyEl.hidden = true;
  }

  filtered.forEach((item, index) => {
    const tile = createMediaTile(item, index);
    mediaGridEl.appendChild(tile);
  });
}

// ---------- Init UI ----------

function initMediaFilters() {
  mediaFilterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-media-filter") || "all";
      mediaState.filter = value;

      mediaFilterButtons.forEach(b => b.classList.remove("chip-active"));
      btn.classList.add("chip-active");

      renderMediaWall();
    });
  });

  if (mediaSearchEl) {
    mediaSearchEl.addEventListener("input", () => {
      mediaState.search = normalizeText(mediaSearchEl.value.trim());
      renderMediaWall();
    });
  }
}

function initLightboxEvents() {
  if (lightboxCloseEl) {
    lightboxCloseEl.addEventListener("click", closeLightbox);
  }

  if (lightboxEl) {
    lightboxEl.addEventListener("click", (e) => {
      if (e.target === lightboxEl) {
        closeLightbox();
      }
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLightbox();
    }
  });
}

// ---------- Init ----------

(function init() {
  console.log("Initializing Media Wall…");
  initMediaFilters();
  initLightboxEvents();
  renderMediaWall();
})();
