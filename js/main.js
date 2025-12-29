/* js/main.js */
/* =========================================================
   Ferran’s Projects — Cleaned + synced with current CSS/HTML
   Key change: Projects render with a FIXED banner thumbnail
   ========================================================= */

/* ---------- Config ---------- */

const GITHUB_USER = "ferrannl";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
const PROJECTS_URL = "./projects/projects.json";
const MEDIA_INDEX_URL = "./media/media.json";

const CACHE_KEY = "ferranProjectsCacheV2";
const THUMB_CACHE_KEY = "ferranProjectsThumbsV3";
const ASSET_CACHE_KEY = "ferranProjectsAssetsV1";

const SUPPORTED_LANGS = ["nl", "en", "de", "es"];
const DEFAULT_LANG = "nl";
const LANG_STORAGE_KEY = "ferranProjectsLang";
const LANG_GATE_SEEN_KEY = "ferranProjectsLangSeenGate";

/* ---------- Random fun websites list ---------- */

const USELESS_WEB_URLS = [
  "https://corndog.io",
  "https://eelslap.com",
  "https://heeeeeeeey.com",
  "https://pointerpointer.com",
  "https://www.bouncingdvdlogo.com",
  "https://www.koalastothemax.com",
  "https://www.rrrgggbbb.com",
  "https://www.trypap.com",
  "https://www.cat-bounce.com",
  "https://www.donothingfor2minutes.com",
  "https://www.fallingfalling.com",
  "https://www.zoomquilt.org",
  "https://www.zoomquilt2.com",
  "https://endless.horse",
  "https://papertoilet.com",
  "https://isitchristmas.com",
  "https://beesbeesbeesbees.com",
  "https://puginarug.com",
  "https://wowenwilsonquiz.com",
  "https://findtheinvisiblecow.com",
  "https://neal.fun/deep-sea/",
  "https://neal.fun/spend/",
  "https://neal.fun/password-game/",
  "https://neal.fun/dark-patterns/",
  "https://neal.fun/absurd-trolley-problems/",
  "https://neal.fun/infinite-craft/",
  "https://neal.fun/space-elevator/",
  "https://neal.fun/life-checklist/",
  "https://neal.fun/where-does-the-day-go/",
  "https://neal.fun/wonders-of-street-view/",
  "https://neal.fun/lets-settle-this/",
  "https://neal.fun/ambient-chaos/",
  "https://neal.fun/universe-forecast/",
  "https://neal.fun/sun-vs-moon/",
  "https://neal.fun/earth-view/",
  "https://neal.fun/baby-map/",
  "https://neal.fun/design-the-next-iphone/",
  "https://neal.fun/printing-money/",
  "https://neal.fun/logos-from-memory/",
  "https://neal.fun/auction-game/",
  "https://neal.fun/asteroid-launcher/",
  "https://neal.fun/rocks/",
  "https://neal.fun/the-weight-of-the-internet/",
  "https://neal.fun/how-many-days/",
  "https://neal.fun/how-many-emojis/",
  "https://neal.fun/speed/",
  "https://neal.fun/size-of-space/"
];

/* ---------- State ---------- */

let repos = [];
let projects = [];
let mediaItems = [];
let thumbCache = loadThumbCache();
let assetCache = loadAssetCache();
let paintIframe = null;

const state = {
  activeTab: "projects",
  search: "",
  typeFilter: "all",
  languageFilter: "all",
  mediaTypeFilter: "all",
  lang: DEFAULT_LANG
};

const SMALL_WORDS = ["voor", "na", "met", "door", "en", "of", "und", "mit", "von", "the", "and", "of"];
const BLOCKED_LANGUAGES = ["roff", "nix", "emacs lisp"];

/* =========================================================
   Avatar “playing” helpers
   ========================================================= */

function setAvatarPlaying(isPlaying) {
  const avatar = document.querySelector(".profile-avatar");
  if (!avatar) return;
  avatar.classList.toggle("profile-avatar--playing", isPlaying);
}

function updateAvatarPlayingFromMedia() {
  const mediaEls = document.querySelectorAll("audio, video");
  const anyPlaying = Array.from(mediaEls).some(
    (el) => !el.paused && !el.ended && el.currentTime > 0
  );
  setAvatarPlaying(anyPlaying);
}

function attachMediaPlaybackHooks(mediaElement) {
  if (!mediaElement) return;
  mediaElement.addEventListener("play", updateAvatarPlayingFromMedia);
  mediaElement.addEventListener("playing", updateAvatarPlayingFromMedia);
  mediaElement.addEventListener("pause", updateAvatarPlayingFromMedia);
  mediaElement.addEventListener("ended", updateAvatarPlayingFromMedia);
}

/* =========================================================
   Secret background video (YouTube API globals)
   ========================================================= */

let bgPlayer = null;
let bgPlayerReady = false;

function onYouTubeIframeAPIReady() {
  const containerId = "bgVideoContainer";
  const el = document.getElementById(containerId);
  if (!el || !window.YT || !YT.Player) return;

  bgPlayer = new YT.Player(containerId, {
    videoId: "YeUE1G07yH8",
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      rel: 0,
      modestbranding: 1,
      loop: 1,
      playlist: "YeUE1G07yH8",
      playsinline: 1
    },
    events: {
      onReady: (event) => {
        bgPlayerReady = true;
        try { event.target.setVolume(20); } catch (_) {}
      }
    }
  });
}

/* =========================================================
   i18n dictionary
   ========================================================= */

const I18N = {
  nl: {
    gateTitle: "Kies je taal",
    gateHint: "Je kunt dit later wijzigen met de taalknop bovenaan.",
    gateNlSub: "Moedertaal",
    gateEnSub: "Internationaal",
    gateDeSub: "Voor mijn buren",
    gateEsSub: "Voor vrienden uit Spanje en de Canarische Eilanden",

    subtitle:
      "Op deze website vind je al mijn programmeer- en codeprojecten op één plek – websites, apps, schoolopdrachten, guides, API’s en meer.",
    aboutTitle: "Over mij",
    aboutP1:
      "Hey 👋🏻 Ferran hier. Ik ben een Nederlandse 🇳🇱 developer uit Utrecht / ’s-Hertogenbosch. Ik bouw graag websites, apps en kleine tools om mezelf en anderen te helpen.",
    aboutP2: "",

    playgroundPaintTitle: "MS Paint Playground",
    playgroundPaintText: "MS Paint-remake, veel tekenplezier!",
    paintClearButton: "Wissen",
    paintClearShortcutHint: "(Ctrl+Shift+N)",
    confirmClear: "Canvas wissen? Dit reset de Paint-app.",

    playgroundRandomTitle: "Random website-knop",
    playgroundRandomText:
      "Nieuwsgierig of verveeld? Klik op de knop en er opent een willekeurige, rare website in een nieuw tabblad.",
    randomButtonLabel: "Neem me mee naar een willekeurige website",

    tabProjects: "Projecten",
    tabMedia: "Media",
    tabPlayground: "Playground",

    searchLabel: "Zoeken",
    filterTypeLabel: "Type",
    typeAll: "Alles",
    typeWebsite: "Websites",
    typeMobile: "Mobiel",
    typeApi: "API’s / Backend",
    typeSchool: "School / Studie",
    typeGame: "Game",
    typeOther: "Overig",

    filterLanguageLabel: "Taal",
    languageFilterAll: "Alle talen",

    mediaTypeLabel: "Media type",
    mediaKindAll: "Alles",
    mediaKindImages: "Afbeeldingen",
    mediaKindVideos: "Video’s",
    mediaKindAudio: "Audio",

    emptyState: "Geen projecten gevonden met deze zoekopdracht of filters. Probeer iets anders.",
    mediaEmptyState: "Geen media gevonden met deze zoekopdracht of filters.",

    headerLangButton: "Taal",
    footerBuilt: "Gemaakt met ♥ door Ferran",

    btnGitHub: "Bekijk op GitHub",
    btnLiveSite: "Live site",
    btnDownload: "Download",

    mediaVolume: "Volume",
    mediaOpen: "Openen",
    mediaDownload: "Download",
    mediaView: "Bekijken",
    mediaLoop: "🔁 Loop",

    modalOpenNewTab: "Openen in nieuw tabblad",
    modalClose: "Sluiten"
  },

  en: {
    gateTitle: "Choose your language",
    gateHint: "You can change it later with the language button at the top.",
    gateNlSub: "Native",
    gateEnSub: "International",
    gateDeSub: "For my neighbors",
    gateEsSub: "For friends in Spain and the Canaries",

    subtitle:
      "On this website you can find all my programming and coding projects in one place – websites, apps, school projects, guides, APIs and more.",
    aboutTitle: "About me",
    aboutP1:
      "Hey 👋🏻 Ferran here. I’m a Dutch 🇳🇱 developer from Utrecht / ’s-Hertogenbosch. I like building websites, apps and small tools to help myself and others.",
    aboutP2: "",

    playgroundPaintTitle: "MS Paint Playground",
    playgroundPaintText: "MS Paint remake, have fun drawing!",
    paintClearButton: "Clear",
    paintClearShortcutHint: "(Ctrl+Shift+N)",
    confirmClear: "Clear the canvas? This will reset the Paint app.",

    playgroundRandomTitle: "Random Website Button",
    playgroundRandomText:
      "Feeling curious or bored? Hit the button and let it launch a random weird website in a new tab.",
    randomButtonLabel: "Take me to a random website",

    tabProjects: "Projects",
    tabMedia: "Media",
    tabPlayground: "Playground",

    searchLabel: "Search",
    filterTypeLabel: "Type",
    typeAll: "All",
    typeWebsite: "Websites",
    typeMobile: "Mobile",
    typeApi: "APIs / Backend",
    typeSchool: "School / Study",
    typeGame: "Game",
    typeOther: "Other",

    filterLanguageLabel: "Language",
    languageFilterAll: "All languages",

    mediaTypeLabel: "Media type",
    mediaKindAll: "All",
    mediaKindImages: "Images",
    mediaKindVideos: "Videos",
    mediaKindAudio: "Audio",

    emptyState: "No projects found with these filters. Try something else.",
    mediaEmptyState: "No media found with these filters.",

    headerLangButton: "Language",
    footerBuilt: "Built with ♥ by Ferran",

    btnGitHub: "View on GitHub",
    btnLiveSite: "Live site",
    btnDownload: "Download",

    mediaVolume: "Volume",
    mediaOpen: "Open",
    mediaDownload: "Download",
    mediaView: "View",
    mediaLoop: "🔁 Loop",

    modalOpenNewTab: "Open in new tab",
    modalClose: "Close"
  },

  de: {
    gateTitle: "Sprache auswählen",
    gateHint: "Du kannst die Sprache später oben über die Sprachschaltfläche ändern.",
    gateNlSub: "Muttersprache",
    gateEnSub: "International",
    gateDeSub: "Für meine Nachbarn",
    gateEsSub: "Für Freunde aus Spanien & den Kanaren",

    subtitle:
      "Auf dieser Website findest du all meine Programmier- und Coding-Projekte an einem Ort – Websites, Apps, Schulprojekte, Guides, APIs und mehr.",
    aboutTitle: "Über mich",
    aboutP1:
      "Hey 👋🏻 hier ist Ferran. Ich bin ein niederländischer 🇳🇱 Entwickler aus Utrecht / ’s-Hertogenbosch und baue gern Websites, Apps und kleine Tools, um mir und anderen zu helfen.",
    aboutP2: "",

    playgroundPaintTitle: "MS-Paint-Playground",
    playgroundPaintText: "MS-Paint-Remake, viel Spaß beim Zeichnen!",
    paintClearButton: "Leeren",
    paintClearShortcutHint: "(Strg+Umschalt+N)",
    confirmClear: "Canvas leeren? Das setzt die Paint-App zurück.",

    playgroundRandomTitle: "Zufällige-Website-Button",
    playgroundRandomText:
      "Neugierig oder gelangweilt? Klick auf den Button und es öffnet sich eine zufällige, verrückte Website in einem neuen Tab.",
    randomButtonLabel: "Bring mich zu einer zufälligen Website",

    tabProjects: "Projekte",
    tabMedia: "Medien",
    tabPlayground: "Playground",

    searchLabel: "Suchen",
    filterTypeLabel: "Typ",
    typeAll: "Alle",
    typeWebsite: "Websites",
    typeMobile: "Mobile",
    typeApi: "APIs / Backend",
    typeSchool: "Schule / Studium",
    typeGame: "Game",
    typeOther: "Sonstiges",

    filterLanguageLabel: "Sprache",
    languageFilterAll: "Alle Sprachen",

    mediaTypeLabel: "Medientyp",
    mediaKindAll: "Alle",
    mediaKindImages: "Bilder",
    mediaKindVideos: "Videos",
    mediaKindAudio: "Audio",

    emptyState: "Keine Projekte mit dieser Suche oder diesen Filtern gefunden. Probier etwas anderes.",
    mediaEmptyState: "Keine Medien mit dieser Suche oder diesen Filtern gefunden.",

    headerLangButton: "Sprache",
    footerBuilt: "Erstellt mit ♥ von Ferran",

    btnGitHub: "Auf GitHub ansehen",
    btnLiveSite: "Live-Seite",
    btnDownload: "Download",

    mediaVolume: "Lautstärke",
    mediaOpen: "Öffnen",
    mediaDownload: "Download",
    mediaView: "Ansehen",
    mediaLoop: "🔁 Loop",

    modalOpenNewTab: "In neuem Tab öffnen",
    modalClose: "Schließen"
  },

  es: {
    gateTitle: "Elige tu idioma",
    gateHint: "Puedes cambiarlo después con el botón de idioma arriba.",
    gateNlSub: "Nativo",
    gateEnSub: "Internacional",
    gateDeSub: "Para mis vecinos",
    gateEsSub: "Para amigos de España y Canarias",

    subtitle:
      "En esta web encontrarás todos mis proyectos de programación en un solo lugar – webs, apps, trabajos de clase, guías, APIs y más.",
    aboutTitle: "Sobre mí",
    aboutP1:
      "Hola 👋🏻 soy Ferran. Soy un desarrollador 🇳🇱 de Utrecht / ’s-Hertogenbosch. Me gusta crear webs, apps y pequeñas herramientas para ayudarme a mí y a otras personas.",
    aboutP2: "",

    playgroundPaintTitle: "Playground de MS Paint",
    playgroundPaintText: "Remake de MS Paint, ¡diviértete dibujando!",
    paintClearButton: "Borrar",
    paintClearShortcutHint: "(Ctrl+Shift+N)",
    confirmClear: "¿Borrar el lienzo? Esto reiniciará la app de Paint.",

    playgroundRandomTitle: "Botón de web aleatoria",
    playgroundRandomText:
      "¿Curioso o aburrido? Pulsa el botón y se abrirá una web rara al azar en una nueva pestaña.",
    randomButtonLabel: "Llévame a una web aleatoria",

    tabProjects: "Proyectos",
    tabMedia: "Media",
    tabPlayground: "Playground",

    searchLabel: "Buscar",
    filterTypeLabel: "Tipo",
    typeAll: "Todo",
    typeWebsite: "Webs",
    typeMobile: "Móvil",
    typeApi: "APIs / Backend",
    typeSchool: "Escuela / Estudio",
    typeGame: "Juego",
    typeOther: "Otros",

    filterLanguageLabel: "Idioma",
    languageFilterAll: "Todos los idiomas",

    mediaTypeLabel: "Tipo de media",
    mediaKindAll: "Todo",
    mediaKindImages: "Imágenes",
    mediaKindVideos: "Vídeos",
    mediaKindAudio: "Audio",

    emptyState: "No se encontraron proyectos con estos filtros. Prueba otra cosa.",
    mediaEmptyState: "No se encontró media con estos filtros.",

    headerLangButton: "Idioma",
    footerBuilt: "Hecho con ♥ por Ferran",

    btnGitHub: "Ver en GitHub",
    btnLiveSite: "Sitio live",
    btnDownload: "Descargar",

    mediaVolume: "Volumen",
    mediaOpen: "Abrir",
    mediaDownload: "Descargar",
    mediaView: "Ver",
    mediaLoop: "🔁 Loop",

    modalOpenNewTab: "Abrir en nueva pestaña",
    modalClose: "Cerrar"
  }
};

/* =========================================================
   Init
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("js-enabled");

  setupLanguage();
  setupTabsAndFilters();
  setupSearch();
  setupImageModal();
  setupFooterCopyright();
  setupPlaygroundRandomButton();
  setupSecretBgVideoToggle();
  setupPaintToolbar();

  loadProjects();
  loadMedia();
});

/* =========================================================
   Search placeholder per lang + tab
   ========================================================= */

function getSearchPlaceholder(lang, view) {
  const tab = view || "projects";
  const l = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;

  if (tab === "media") {
    if (l === "nl") return "Zoek in media op titel of bestandsnaam…";
    if (l === "de") return "Suche in Medien nach Titel oder Dateiname…";
    if (l === "es") return "Busca en media por título o nombre de archivo…";
    return "Search media by title or filename…";
  }

  if (tab === "playground") {
    if (l === "nl") return "Zoek in Playground-tools op naam of beschrijving…";
    if (l === "de") return "Suche in Playground-Tools nach Name oder Beschreibung…";
    if (l === "es") return "Busca herramientas del Playground por nombre o descripción…";
    return "Search playground tools by name or description…";
  }

  if (l === "nl") return "Zoek in projecten op naam, beschrijving, programmeertaal of tags…";
  if (l === "de") return "Suche in Projekten nach Name, Beschreibung, Sprache oder Tags…";
  if (l === "es") return "Busca proyectos por nombre, descripción, lenguaje o etiquetas…";
  return "Search projects by name, description, language or tags…";
}

function updateSearchPlaceholder() {
  const searchInput = document.getElementById("search");
  if (!searchInput) return;
  searchInput.placeholder = getSearchPlaceholder(state.lang, state.activeTab);
}

/* =========================================================
   Language / gate
   ========================================================= */

function setupLanguage() {
  const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
  const gateSeen = localStorage.getItem(LANG_GATE_SEEN_KEY) === "1";

  const initialLang = SUPPORTED_LANGS.includes(savedLang) ? savedLang : DEFAULT_LANG;
  state.lang = initialLang;

  const gate = document.getElementById("langGate");
  if (gate) {
    if (gateSeen) gate.hidden = true;

    gate.addEventListener("click", (event) => {
      const btn = event.target.closest(".btn-lang");
      if (!btn) return;
      const langCode = btn.dataset.lang;
      if (!SUPPORTED_LANGS.includes(langCode)) return;

      setLanguage(langCode);
      localStorage.setItem(LANG_GATE_SEEN_KEY, "1");
      gate.hidden = true;
    });
  }

  const headerLangButton = document.getElementById("headerLangButton");
  if (headerLangButton && gate) {
    headerLangButton.addEventListener("click", () => {
      gate.hidden = false;
      updateLanguageGateActive();
    });
  }

  setLanguage(initialLang);
  updateLanguageGateActive();
}

function setLanguage(lang) {
  state.lang = lang;
  try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (_) {}

  const dict = I18N[lang] || I18N[DEFAULT_LANG] || {};

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = dict[key];
    if (typeof value === "string") el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-footer-built]").forEach((el) => {
    const value = dict.footerBuilt;
    if (typeof value === "string") el.textContent = value;
  });

  updateSearchPlaceholder();
  updateLanguageGateActive();
  renderProjects();
  renderMedia();
}

function updateLanguageGateActive() {
  document.querySelectorAll(".btn-lang").forEach((btn) => {
    const code = btn.dataset.lang;
    btn.classList.toggle("active", code === state.lang);
  });
}

/* =========================================================
   Tabs & filters visibility
   ========================================================= */

function setupTabsAndFilters() {
  const projectsTab = document.getElementById("projectsTab");
  const mediaTab = document.getElementById("mediaTab");
  const playgroundTab = document.getElementById("playgroundTab");

  const projectsView = document.getElementById("projectsView");
  const mediaView = document.getElementById("mediaView");
  const playgroundView = document.getElementById("playgroundView");

  const projectFilters = document.getElementById("projectFilters");
  const mediaFilters = document.getElementById("mediaFilters");

  if (!projectsTab || !mediaTab || !playgroundTab || !projectsView || !mediaView || !playgroundView) return;

  const tabsContainer = document.querySelector(".tabs");

  function updateTabsPill(activeButton) {
    if (!tabsContainer || !activeButton) return;
    const tabsRect = tabsContainer.getBoundingClientRect();
    const btnRect = activeButton.getBoundingClientRect();
    const left = btnRect.left - tabsRect.left;
    const width = btnRect.width;
    tabsContainer.style.setProperty("--pill-left", `${left}px`);
    tabsContainer.style.setProperty("--pill-width", `${width}px`);
  }

  function showProjects() {
    state.activeTab = "projects";
    projectsTab.classList.add("active");
    mediaTab.classList.remove("active");
    playgroundTab.classList.remove("active");

    projectsView.style.display = "";
    mediaView.style.display = "none";
    playgroundView.style.display = "none";

    if (projectFilters) projectFilters.hidden = false;
    if (mediaFilters) mediaFilters.hidden = true;

    updateSearchPlaceholder();
    renderProjects();
    updateTabsPill(projectsTab);
  }

  function showMedia() {
    state.activeTab = "media";
    mediaTab.classList.add("active");
    projectsTab.classList.remove("active");
    playgroundTab.classList.remove("active");

    mediaView.style.display = "";
    projectsView.style.display = "none";
    playgroundView.style.display = "none";

    if (projectFilters) projectFilters.hidden = true;
    if (mediaFilters) mediaFilters.hidden = false;

    updateSearchPlaceholder();
    renderMedia();
    updateTabsPill(mediaTab);
  }

  function showPlayground() {
    state.activeTab = "playground";
    playgroundTab.classList.add("active");
    projectsTab.classList.remove("active");
    mediaTab.classList.remove("active");

    playgroundView.style.display = "";
    projectsView.style.display = "none";
    mediaView.style.display = "none";

    if (projectFilters) projectFilters.hidden = true;
    if (mediaFilters) mediaFilters.hidden = true;

    updateSearchPlaceholder();
    updateTabsPill(playgroundTab);
  }

  projectsTab.addEventListener("click", showProjects);
  mediaTab.addEventListener("click", showMedia);
  playgroundTab.addEventListener("click", showPlayground);

  showProjects();

  window.addEventListener("resize", () => {
    const active =
      state.activeTab === "media" ? mediaTab :
      state.activeTab === "playground" ? playgroundTab : projectsTab;
    updateTabsPill(active);
  });

  const typeFilter = document.getElementById("typeFilter");
  const languageFilter = document.getElementById("languageFilter");
  const mediaTypeFilter = document.getElementById("mediaTypeFilter");

  if (typeFilter) {
    typeFilter.addEventListener("change", () => {
      state.typeFilter = typeFilter.value;
      renderProjects();
    });
  }

  if (languageFilter) {
    languageFilter.addEventListener("change", () => {
      state.languageFilter = languageFilter.value;
      renderProjects();
    });
  }

  if (mediaTypeFilter) {
    mediaTypeFilter.addEventListener("change", () => {
      state.mediaTypeFilter = mediaTypeFilter.value;
      renderMedia();
    });
  }
}

/* =========================================================
   Search
   ========================================================= */

function setupSearch() {
  const searchEl = document.getElementById("search");
  if (!searchEl) return;

  searchEl.addEventListener("input", () => {
    state.search = searchEl.value.trim();
    if (state.activeTab === "projects") renderProjects();
    if (state.activeTab === "media") renderMedia();
  });

  updateSearchPlaceholder();
}

/* =========================================================
   Secret bg video toggle (profile picture)
   ========================================================= */

function setupSecretBgVideoToggle() {
  const avatarImg = document.querySelector(".profile-avatar-inner img");
  const overlay = document.getElementById("bgVideoOverlay");
  if (!avatarImg || !overlay) return;

  avatarImg.addEventListener("click", () => {
    if (!bgPlayerReady || !bgPlayer) return;

    const isActive = !document.body.classList.contains("bg-video-active");
    document.body.classList.toggle("bg-video-active", isActive);
    overlay.setAttribute("aria-hidden", isActive ? "false" : "true");

    try {
      if (isActive) {
        bgPlayer.unMute();
        bgPlayer.setVolume(20);
        bgPlayer.playVideo();
        setAvatarPlaying(true);
      } else {
        bgPlayer.pauseVideo();
        updateAvatarPlayingFromMedia();
      }
    } catch (_) {}
  });
}

/* =========================================================
   Projects loading (GitHub + overrides)
   ========================================================= */

async function loadProjects() {
  const overrides = await loadProjectOverrides();
  const apiRepos = await loadGitHubReposWithCache();

  const overridesByName = {};
  overrides.forEach((o) => {
    if (o && o.name) overridesByName[o.name.toLowerCase()] = o;
  });

  repos = apiRepos.filter((repo) => {
    if (repo.archived || repo.fork) return false;
    const name = (repo.name || "").toLowerCase();
    if (name === "projects") return false;
    if (name.includes("munchkin")) return false;
    if (name.includes("pso") && name.includes("wiiu")) return false;
    return true;
  });

  projects = repos.map((repo) => {
    const o = overridesByName[(repo.name || "").toLowerCase()] || {};

    const displayName = formatRepoName(o.displayName || repo.name || "");
    const description = o.description || repo.description || "No description yet.";

    const overrideLangs = Array.isArray(o.languages) ? o.languages : o.langs;
    let languages = getLanguagesList(repo.language, overrideLangs);

    if (looksLikeAspNet(repo, o, languages)) {
      const hasAspNet = languages.some((l) => String(l).toLowerCase() === "asp.net");
      if (!hasAspNet) languages.push("ASP.NET");
    }

    const type = guessProjectType(repo, o, languages);

    // Keep ONLY custom tags (+ optional Security hint)
    const tags = Array.isArray(o.tags) ? [...o.tags] : [];
    if (isSecurityProject(repo, o, languages) && !tags.includes("Security")) tags.push("Security");

    const liveUrl = computeLiveUrl(repo, o);
    const thumbnail = computeThumbnail(repo, o);

    return {
      id: repo.id,
      name: repo.name,
      displayName,
      description,
      languages,
      primaryLanguage: repo.language,
      type,
      tags,
      liveUrl,
      githubUrl: repo.html_url,
      thumbnail,
      downloadUrl: null,
      downloadLabel: null
    };
  });

  sortProjectsByLive();
  buildLanguageFilterOptions(projects);
  renderProjects();

  verifyLiveSites();
  loadProjectThumbnails();
  loadProjectDownloadAssets();
}

async function loadProjectOverrides() {
  try {
    const res = await fetch(PROJECTS_URL);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to load projects.json", err);
    return [];
  }
}

/* ---------- GitHub repo loading (simple cache) ---------- */

async function loadGitHubReposWithCache() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("GitHub HTTP " + res.status);
    const data = await res.json();
    saveReposToCache(data);
    return data;
  } catch (err) {
    console.error("GitHub fetch failed, trying cache instead:", err);
    const cached = readReposFromCache();
    if (cached) return cached;
    return [];
  }
}

function readReposFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.repos)) return parsed.repos;

    return null;
  } catch (err) {
    console.error("Error reading repos from cache:", err);
    return null;
  }
}

function saveReposToCache(reposToSave) {
  try {
    const payload = { timestamp: Date.now(), repos: reposToSave };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("Error saving repos to cache:", err);
  }
}

/* =========================================================
   Name / language helpers
   ========================================================= */

function formatRepoName(raw) {
  if (!raw) return "";
  let name = raw.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

  const words = name.split(" ");
  return words
    .map((w, index) => {
      const lw = w.toLowerCase();
      if (lw === "ios") return "iOS";
      if (lw === "api") return "API";
      if (lw === "asp.net") return "ASP.NET";
      if (SMALL_WORDS.includes(lw) && index !== 0) return lw;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function getLanguagesList(primary, overrideList) {
  if (Array.isArray(overrideList) && overrideList.length) {
    return overrideList
      .map((l) => String(l))
      .filter((l) => !BLOCKED_LANGUAGES.includes(l.toLowerCase()));
  }

  const list = [];
  if (!primary) return list;

  const p = String(primary).toLowerCase();
  if (BLOCKED_LANGUAGES.includes(p)) return [];

  if (p === "html") list.push("HTML", "CSS", "JS");
  else if (p === "javascript") list.push("JS", "HTML", "CSS");
  else if (p === "typescript") list.push("TypeScript", "JS", "HTML", "CSS");
  else if (p === "c#") list.push("C#", ".NET");
  else if (p === "c++") list.push("C++", "C");
  else if (p === "php") list.push("PHP", "HTML", "CSS", "JS");
  else if (p === "css") list.push("CSS", "HTML", "JS");
  else if (p === "less") list.push("Less", "HTML", "CSS", "JS", "SCSS");
  else if (p === "scss" || p === "sass") list.push("SCSS", "CSS", "HTML", "JS");
  else list.push(primary);

  return list.filter((l) => !BLOCKED_LANGUAGES.includes(String(l).toLowerCase()));
}

function buildLanguageFilterOptions(projectsList) {
  const select = document.getElementById("languageFilter");
  if (!select) return;

  while (select.options.length > 1) select.remove(1);

  const set = new Set();
  projectsList.forEach((p) => {
    (p.languages || []).forEach((lang) => {
      const lower = String(lang).toLowerCase();
      if (!BLOCKED_LANGUAGES.includes(lower)) set.add(lang);
    });
  });

  Array.from(set)
    .sort((a, b) => a.localeCompare(b, "en"))
    .forEach((lang) => {
      const opt = document.createElement("option");
      opt.value = lang;
      opt.textContent = lang;
      select.appendChild(opt);
    });
}

/* =========================================================
   Type helpers
   ========================================================= */

function looksLikeAspNet(repo, override, languages) {
  const langs = (languages || []).map((l) => String(l).toLowerCase());
  if (langs.includes("asp.net")) return true;

  const overrideLangs = override && (override.languages || override.langs);
  if (Array.isArray(overrideLangs)) {
    const lower = overrideLangs.map((l) => String(l).toLowerCase());
    if (lower.some((l) => l.includes("asp.net"))) return true;
  }

  const text = `${repo.name || ""} ${repo.description || ""} ${(override && (override.description || "")) || ""}`.toLowerCase();
  return ["asp.net", "aspnet", "asp-net"].some((p) => text.includes(p));
}

function computeTypeFlags(repo, override, languages) {
  const name = (repo.name || "").toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const joined = `${name} ${desc}`;
  const lang = (repo.language || "").toLowerCase();

  const has = (words) => words.some((w) => joined.includes(w));
  const aspNetLike = looksLikeAspNet(repo, override, languages);

  let isGame = has(["game", "games", "spel", "sudoku", "unity", "platformer", "puzzle", "rpg", "jigsaw"]);
  let isApi = has(["api", "backend", "server", "service", "rest", "endpoint"]) || aspNetLike;

  let isMobile =
    has(["android", "ios", "xamarin", "apk", "play store", "playstore", "xcode", "swiftui", "react native", "react-native", "flutter", "mobile"]) ||
    (["kotlin", "swift", "objective-c", "objective c", "dart"].includes(lang) && has(["android", "ios", "mobile"]));

  let isSchool = has([
    "school",
    "study",
    "studie",
    "uni",
    "university",
    "hogeschool",
    "opdracht",
    "assignment",
    "project for school",
    "school project",
    "stage",
    "internship",
    "praktijk"
  ]);

  let isWebsite =
    lang === "html" ||
    lang === "php" ||
    lang === "vue" ||
    lang === "asp.net" ||
    has(["website", "web site", "webpage", "web page", "web", "site", "landing", "portfolio", "page", "laravel", "wordpress", "webshop", "shop"]);

  if (name.includes("videoshare") || name.includes("video-share")) isApi = true;
  if (name.includes("kolonisten") || name.includes("katan") || name.includes("catan") || name.includes("dimitri")) isGame = true;

  return { isGame, isMobile, isApi, isSchool, isWebsite };
}

function guessProjectType(repo, override, languages) {
  if (override && override.type) return override.type;

  const flags = computeTypeFlags(repo, override, languages);
  if (flags.isGame) return "game";
  if (flags.isMobile) return "mobile";
  if (flags.isApi) return "api";
  if (flags.isSchool) return "school";
  if (flags.isWebsite) return "website";
  return "other";
}

/* =========================================================
   Project helpers: security tag, liveUrl, thumbnail
   ========================================================= */

function isSecurityProject(repo, override, languages) {
  if (override && Array.isArray(override.tags) && override.tags.includes("Security")) return true;

  const text = `${repo.name || ""} ${repo.description || ""}`.toLowerCase();
  const securityWords = [
    "security","secure","auth","authentication","authorization","oauth","jwt","token",
    "password","passwort","wachtwoord","hash","encrypt","encryption","crypt","crypto",
    "2fa","mfa","owasp","vuln","vulnerability","pentest","penetration test"
  ];

  const hasSecurityWord = securityWords.some((w) => text.includes(w));
  const hasDotNet =
    (languages || []).some((l) => String(l).toLowerCase().includes(".net")) ||
    (repo.language || "").toLowerCase() === "c#";

  return hasDotNet && hasSecurityWord;
}

function computeLiveUrl(repo, override) {
  const rawOverride = (override.liveUrl || "").trim();
  if (rawOverride) return rawOverride;

  const hasLive = override.hasLive !== undefined ? !!override.hasLive : !!repo.has_pages;
  if (hasLive) return `https://${GITHUB_USER}.github.io/${repo.name}/`;
  return null;
}

function computeThumbnail(repo, override) {
  if (override.thumbnail || override.thumb) return override.thumbnail || override.thumb;
  return null;
}

function sortProjectsByLive() {
  projects.sort((a, b) => {
    if (a.liveUrl && !b.liveUrl) return -1;
    if (!a.liveUrl && b.liveUrl) return 1;
    return a.displayName.localeCompare(b.displayName, "en");
  });
}

async function verifyLiveSites() {
  const checks = projects.map(async (project) => {
    if (!project.liveUrl) return;
    try {
      const res = await fetch(project.liveUrl, { method: "GET", redirect: "follow" });
      if (!res.ok) project.liveUrl = null;
    } catch (_) {
      project.liveUrl = null;
    }
  });

  await Promise.all(checks);
  sortProjectsByLive();
  renderProjects();
}

/* =========================================================
   Thumbnails (root images) + cache
   ========================================================= */

function loadThumbCache() {
  try {
    const raw = localStorage.getItem(THUMB_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

function saveThumbCache() {
  try { localStorage.setItem(THUMB_CACHE_KEY, JSON.stringify(thumbCache)); } catch (_) {}
}

async function checkImageExists(url) {
  try {
    let res = await fetch(url, { method: "HEAD" });
    if (res.ok) return true;
    res = await fetch(url, { method: "GET" });
    return res.ok;
  } catch (_) {
    return false;
  }
}

async function loadProjectThumbnails() {
  const promises = projects.map(async (project) => {
    const repoName = project.name;

    if (project.thumbnail && !thumbCache[repoName]) {
      const ok = await checkImageExists(project.thumbnail);
      if (ok) {
        thumbCache[repoName] = project.thumbnail;
        return;
      } else {
        project.thumbnail = null;
      }
    }

    const cached = thumbCache[repoName];
    if (cached) {
      project.thumbnail = cached;
      return;
    }

    const rootThumb = await findRepoRootThumbnail(repoName);
    let finalUrl = rootThumb;

    if (!finalUrl) finalUrl = `https://opengraph.githubassets.com/1/${GITHUB_USER}/${repoName}`;

    project.thumbnail = finalUrl;
    thumbCache[repoName] = finalUrl;
  });

  await Promise.all(promises);
  saveThumbCache();
  renderProjects();
}

async function findRepoRootThumbnail(repoName) {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repoName}/contents/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    const files = data.filter((item) => item.type === "file");
    const imageFiles = files.filter((item) => {
      const ext = (item.name.split(".").pop() || "").toLowerCase();
      return ["jpg", "jpeg", "png", "svg", "gif", "webp"].includes(ext);
    });

    if (!imageFiles.length) return null;

    const score = (name) => {
      const lower = name.toLowerCase();
      if (lower === "logo.gif") return 0;
      if (lower === "logo.png") return 1;
      if (lower === "logo.jpg" || lower === "logo.jpeg" || lower === "logo.webp") return 2;
      if (lower.startsWith("logo.")) return 3;
      if (lower.includes("banner")) return 3;
      if (lower.includes("cover")) return 4;
      if (lower.includes("screenshot")) return 5;
      if (lower.includes("preview")) return 5;
      if (lower.includes("classdiagram")) return 6;
      if (lower.includes("diagram")) return 7;
      return 8;
    };

    imageFiles.sort((a, b) => score(a.name) - score(b.name));
    const chosen = imageFiles[0];
    const encodedName = encodeURIComponent(chosen.name);
    return `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/HEAD/${encodedName}`;
  } catch (err) {
    console.error("Failed to load root thumbnail for", repoName, err);
    return null;
  }
}

/* =========================================================
   Download asset helpers (.jar/.apk in repo root)
   ========================================================= */

function loadAssetCache() {
  try {
    const raw = localStorage.getItem(ASSET_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

function saveAssetCache() {
  try { localStorage.setItem(ASSET_CACHE_KEY, JSON.stringify(assetCache)); } catch (_) {}
}

function isDownloadableExt(name) {
  const lower = String(name || "").toLowerCase();
  return lower.endsWith(".jar") || lower.endsWith(".apk");
}

function pickBestAsset(files) {
  const scored = files.map((f) => {
    const n = (f.name || "").toLowerCase();
    let s = 100;
    if (n.endsWith(".jar")) s -= 10;
    if (n.includes("release")) s -= 6;
    if (n.includes("build")) s -= 4;
    if (n.includes("dist")) s -= 3;
    if (n.includes("final")) s -= 2;
    return { f, s };
  });
  scored.sort((a, b) => a.s - b.s);
  return scored[0]?.f || null;
}

async function findRepoRootDownloadAsset(repoName) {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repoName}/contents/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    const files = data.filter((item) => item.type === "file" && isDownloadableExt(item.name));
    if (!files.length) return null;

    const chosen = pickBestAsset(files);
    if (!chosen) return null;

    const fileName = chosen.name;
    const ext = (fileName.split(".").pop() || "").toLowerCase();
    const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/HEAD/${encodeURIComponent(fileName)}`;
    return { url, ext };
  } catch (err) {
    console.error("Failed to detect download asset for", repoName, err);
    return null;
  }
}

async function loadProjectDownloadAssets() {
  const queue = [...projects];
  const workers = Array.from({ length: 4 }).map(async () => {
    while (queue.length) {
      const project = queue.shift();
      if (!project) continue;

      const repoName = project.name;
      const cached = assetCache[repoName];
      if (cached && cached.url) {
        project.downloadUrl = cached.url;
        project.downloadLabel = cached.ext ? cached.ext.toUpperCase() : "Download";
        continue;
      }

      const found = await findRepoRootDownloadAsset(repoName);
      if (found && found.url) {
        project.downloadUrl = found.url;
        project.downloadLabel = found.ext ? found.ext.toUpperCase() : "Download";
        assetCache[repoName] = found;
        saveAssetCache();
      }
    }
  });

  await Promise.all(workers);
  renderProjects();
}

/* =========================================================
   Project rendering (banner thumbs + click-to-enlarge)
   ========================================================= */

function getFilteredProjects() {
  const search = state.search.toLowerCase();
  const typeFilter = state.typeFilter;
  const langFilter = state.languageFilter;

  return projects.filter((p) => {
    if (typeFilter !== "all" && p.type !== typeFilter) return false;

    if (
      langFilter !== "all" &&
      !p.languages.some((l) => String(l).toLowerCase() === String(langFilter).toLowerCase())
    ) return false;

    if (!search) return true;

    const haystack = [
      p.displayName,
      p.description,
      (p.tags || []).join(" "),
      (p.languages || []).join(" ")
    ].join(" ").toLowerCase();

    return haystack.includes(search);
  });
}

function renderProjects() {
  const grid = document.getElementById("projectsGrid");
  const emptyState = document.getElementById("emptyState");
  if (!grid || !emptyState) return;

  const filtered = getFilteredProjects();
  grid.innerHTML = "";

  if (!filtered.length) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  const dict = I18N[state.lang] || I18N[DEFAULT_LANG] || {};

  filtered.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";

    // Banner thumbnail (click to enlarge)
    const banner = document.createElement("button");
    banner.type = "button";
    banner.className = "project-banner";
    banner.setAttribute("aria-label", `Preview: ${project.displayName}`);

    if (project.thumbnail) {
      const img = document.createElement("img");
      img.src = project.thumbnail;
      img.alt = project.displayName;
      banner.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "project-banner-fallback";
      placeholder.textContent = (project.displayName || "?").charAt(0).toUpperCase();
      banner.appendChild(placeholder);
    }

    banner.addEventListener("click", () => {
      if (!project.thumbnail) return;
      openImageModal(project.thumbnail, project.displayName);
    });

    const content = document.createElement("div");
    content.className = "project-content";

    const headerRow = document.createElement("div");
    headerRow.className = "project-header-row";

    const title = document.createElement("h3");
    title.className = "project-title";
    title.textContent = project.displayName;

    const langP = document.createElement("p");
    langP.className = "project-lang";
    langP.textContent = (project.languages || []).join(" · ");

    headerRow.appendChild(title);
    headerRow.appendChild(langP);

    const desc = document.createElement("p");
    desc.className = "project-desc";
    desc.textContent = project.description;

    // Tags
    const meta = document.createElement("div");
    meta.className = "project-meta";
    (project.tags || []).forEach((tag) => {
      const tagBadge = document.createElement("span");
      tagBadge.className = "badge";
      tagBadge.textContent = tag;
      meta.appendChild(tagBadge);
    });

    const actions = document.createElement("div");
    actions.className = "project-actions";

    const githubBtn = document.createElement("a");
    githubBtn.href = project.githubUrl;
    githubBtn.target = "_blank";
    githubBtn.rel = "noopener noreferrer";
    githubBtn.className = "btn-card";
    githubBtn.innerHTML = `<span>${dict.btnGitHub || "View on GitHub"}</span>`;
    actions.appendChild(githubBtn);

    if (project.liveUrl) {
      const liveBtn = document.createElement("a");
      liveBtn.href = project.liveUrl;
      liveBtn.target = "_blank";
      liveBtn.rel = "noopener noreferrer";
      liveBtn.className = "btn-card btn-card-live";
      liveBtn.innerHTML = `<span>${dict.btnLiveSite || "Live site"}</span>`;
      actions.appendChild(liveBtn);
    }

    if (project.downloadUrl) {
      const dlBtn = document.createElement("a");
      dlBtn.href = project.downloadUrl;
      dlBtn.target = "_blank";
      dlBtn.rel = "noopener noreferrer";
      dlBtn.className = "btn-card";
      const label = dict.btnDownload || "Download";
      const suffix = project.downloadLabel ? ` ${project.downloadLabel}` : "";
      dlBtn.innerHTML = `<span>${label}${suffix}</span>`;
      actions.appendChild(dlBtn);
    }

    content.appendChild(headerRow);
    content.appendChild(desc);
    if (project.tags && project.tags.length) content.appendChild(meta);
    content.appendChild(actions);

    card.appendChild(banner);
    card.appendChild(content);
    grid.appendChild(card);
  });
}

/* =========================================================
   Media loading & rendering
   ========================================================= */

async function loadMedia() {
  try {
    const res = await fetch(MEDIA_INDEX_URL);
    if (!res.ok) {
      mediaItems = [];
      renderMedia();
      return;
    }

    const data = await res.json();
    const items = Array.isArray(data) ? data : data.items || [];

    mediaItems = items.map((item, index) => {
      let path = item.path || item.url || item.src || "";

      if (!path) {
        const fileName = item.fileName || item.name || item.title || "";
        if (fileName) {
          const lowerType = (item.type || "").toLowerCase();
          if (lowerType === "image") path = `media/images/${fileName}`;
          else if (lowerType === "video") path = `media/videos/${fileName}`;
          else if (lowerType === "audio") path = `media/audio/${fileName}`;
          else path = `media/${fileName}`;
        }
      }

      const title =
        item.title ||
        item.name ||
        item.fileName ||
        (path ? path.split("/").pop() : "") ||
        `Media ${index + 1}`;

      const format = (item.format || (path.split(".").pop() || "").toLowerCase() || "").toLowerCase();

      let type = item.type;
      if (!type) type = guessMediaType(path);

      return { id: index, title, path, type, format };
    });

    buildMediaTypeFilterOptions(mediaItems);
    renderMedia();
  } catch (err) {
    console.error("Failed to load media index", err);
    mediaItems = [];
    renderMedia();
  }
}

function guessMediaType(path) {
  const ext = (path.split(".").pop() || "").toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "image";
  if (["mp4", "webm", "mov", "m4v"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "flac"].includes(ext)) return "audio";
  return "image";
}

function buildMediaTypeFilterOptions(items) {
  const typeSelect = document.getElementById("mediaTypeFilter");
  if (!typeSelect) return;

  while (typeSelect.options.length > 1) typeSelect.remove(1);

  const typeSet = new Set();
  items.forEach((i) => typeSet.add(i.type));

  Array.from(typeSet)
    .sort()
    .forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
      typeSelect.appendChild(opt);
    });
}

function getFilteredMedia() {
  const search = state.search.toLowerCase();
  const typeFilter = state.mediaTypeFilter;

  return mediaItems.filter((item) => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (!search) return true;

    const haystack = (item.title + " " + item.path).toLowerCase();
    return haystack.includes(search);
  });
}

/* Volume row for audio/video */
function createVolumeRow(mediaEl, dict) {
  const row = document.createElement("div");
  row.className = "media-volume-row";

  const label = document.createElement("span");
  label.className = "media-volume-label";
  label.textContent = dict.mediaVolume || "Volume";

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.value = "100";
  slider.className = "media-volume-slider";

  const valueLabel = document.createElement("span");
  valueLabel.className = "media-volume-value";
  valueLabel.textContent = "100%";

  mediaEl.volume = 1;

  slider.addEventListener("input", () => {
    const value = parseInt(slider.value, 10) || 0;
    mediaEl.volume = value / 100;
    valueLabel.textContent = `${value}%`;
  });

  row.appendChild(label);
  row.appendChild(slider);
  row.appendChild(valueLabel);

  return row;
}

function renderMedia() {
  const grid = document.getElementById("mediaGrid");
  const emptyState = document.getElementById("mediaEmptyState");
  if (!grid || !emptyState) return;

  const filtered = getFilteredMedia();

  grid.innerHTML = "";
  if (!filtered.length) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  const dict = I18N[state.lang] || I18N[DEFAULT_LANG] || {};

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "media-card";

    const title = document.createElement("h3");
    title.className = "media-title";
    title.textContent = item.title;

    const preview = document.createElement("div");
    preview.className = "media-preview";

    if (item.type === "image") {
      preview.classList.add("clickable");
      const img = document.createElement("img");
      img.src = item.path;
      img.alt = item.title;
      preview.appendChild(img);
      preview.addEventListener("click", () => openImageModal(item.path, item.title));
    } else if (item.type === "video") {
      const video = document.createElement("video");
      video.src = item.path;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";

      video.addEventListener("play", () => {
        document.querySelectorAll("video").forEach((v) => {
          if (v !== video) v.pause();
        });
      });

      attachMediaPlaybackHooks(video);

      const wrapper = document.createElement("div");
      wrapper.className = "media-player-wrapper";
      wrapper.appendChild(video);
      preview.appendChild(wrapper);

      const volumeRow = createVolumeRow(video, dict);
      preview.appendChild(volumeRow);

      const actions = document.createElement("div");
      actions.className = "media-actions";

      const openBtn = document.createElement("a");
      openBtn.href = item.path;
      openBtn.target = "_blank";
      openBtn.rel = "noopener noreferrer";
      openBtn.className = "media-action-btn";
      openBtn.textContent = dict.mediaOpen || "Open";

      const downloadBtn = document.createElement("a");
      downloadBtn.href = item.path;
      downloadBtn.download = "";
      downloadBtn.className = "media-action-btn";
      downloadBtn.textContent = dict.mediaDownload || "Download";

      const loopBtn = document.createElement("button");
      loopBtn.type = "button";
      loopBtn.className = "media-action-btn media-loop-btn";
      loopBtn.textContent = dict.mediaLoop || "🔁 Loop";
      loopBtn.title = "Toggle loop";
      loopBtn.addEventListener("click", () => {
        video.loop = !video.loop;
        loopBtn.classList.toggle("is-active", video.loop);
      });

      actions.appendChild(openBtn);
      actions.appendChild(downloadBtn);
      actions.appendChild(loopBtn);

      card.appendChild(title);
      card.appendChild(preview);
      card.appendChild(actions);
      grid.appendChild(card);
      return;
    } else if (item.type === "audio") {
      const audio = document.createElement("audio");
      audio.src = item.path;
      audio.controls = true;
      audio.preload = "metadata";

      attachMediaPlaybackHooks(audio);

      const wrapper = document.createElement("div");
      wrapper.className = "media-player-wrapper";
      wrapper.appendChild(audio);
      preview.appendChild(wrapper);

      const volumeRow = createVolumeRow(audio, dict);
      preview.appendChild(volumeRow);
    }

    const actions = document.createElement("div");
    actions.className = "media-actions";

    if (item.type === "image") {
      const viewBtn = document.createElement("button");
      viewBtn.type = "button";
      viewBtn.className = "media-action-btn";
      viewBtn.textContent = dict.mediaView || "View";
      viewBtn.addEventListener("click", () => openImageModal(item.path, item.title));
      actions.appendChild(viewBtn);
    } else {
      const openBtn = document.createElement("a");
      openBtn.href = item.path;
      openBtn.target = "_blank";
      openBtn.rel = "noopener noreferrer";
      openBtn.className = "media-action-btn";
      openBtn.textContent = dict.mediaOpen || "Open";
      actions.appendChild(openBtn);
    }

    const downloadBtn = document.createElement("a");
    downloadBtn.href = item.path;
    downloadBtn.download = "";
    downloadBtn.className = "media-action-btn";
    downloadBtn.textContent = dict.mediaDownload || "Download";
    actions.appendChild(downloadBtn);

    card.appendChild(title);
    card.appendChild(preview);
    card.appendChild(actions);
    grid.appendChild(card);
  });

  updateAvatarPlayingFromMedia();
}

/* =========================================================
   Image modal
   ========================================================= */

function setupImageModal() {
  const modal = document.getElementById("imageModal");
  if (!modal) return;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeImageModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeImageModal();
  });
}

function openImageModal(src, captionText) {
  const modal = document.getElementById("imageModal");
  if (!modal) return;

  const dict = I18N[state.lang] || I18N[DEFAULT_LANG] || {};
  modal.innerHTML = "";

  const inner = document.createElement("div");
  inner.className = "image-modal-inner";

  const figure = document.createElement("figure");
  figure.className = "image-modal-figure";

  const img = document.createElement("img");
  img.className = "image-modal-img";
  img.src = src;
  img.alt = captionText || "";
  img.addEventListener("click", closeImageModal);

  figure.appendChild(img);

  if (captionText) {
    const caption = document.createElement("figcaption");
    caption.className = "image-modal-caption";
    caption.textContent = captionText;
    figure.appendChild(caption);
  }

  inner.appendChild(figure);

  const actions = document.createElement("div");
  actions.className = "image-modal-actions";

  const openTabBtn = document.createElement("a");
  openTabBtn.href = src;
  openTabBtn.target = "_blank";
  openTabBtn.rel = "noopener noreferrer";
  openTabBtn.className = "image-modal-btn";
  openTabBtn.textContent = dict.modalOpenNewTab || "Open in new tab";
  actions.appendChild(openTabBtn);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "image-modal-btn image-modal-close";
  closeBtn.textContent = dict.modalClose || "Close";
  closeBtn.addEventListener("click", closeImageModal);
  actions.appendChild(closeBtn);

  inner.appendChild(actions);
  modal.appendChild(inner);
  modal.hidden = false;
}

function closeImageModal() {
  const modal = document.getElementById("imageModal");
  if (!modal) return;
  modal.hidden = true;
}

/* =========================================================
   Footer
   ========================================================= */

function setupFooterCopyright() {
  const el = document.getElementById("footerCopyright");
  if (!el) return;
  el.textContent = `${new Date().getFullYear()}`;
}

/* =========================================================
   Playground random button
   ========================================================= */

function setupPlaygroundRandomButton() {
  const btn = document.getElementById("randomSiteButton");
  if (!btn) return;

  btn.classList.add("btn-card", "btn-card-live");

  btn.addEventListener("click", () => {
    if (!USELESS_WEB_URLS.length) return;
    const idx = Math.floor(Math.random() * USELESS_WEB_URLS.length);
    const url = USELESS_WEB_URLS[idx];
    window.open(url, "_blank", "noopener,noreferrer");
  });
}

/* =========================================================
   Paint toolbar + shortcuts (ONLY CLEAR + confirm)
   ========================================================= */

function setupPaintToolbar() {
  const paintCard = document.querySelector(".playground-paint");
  if (!paintCard) return;

  paintIframe = paintCard.querySelector("iframe[src*='paint.js.org']");
  document.addEventListener("keydown", handlePaintShortcuts);

  const clearBtn = paintCard.querySelector("[data-paint-action='clear']");
  if (clearBtn) clearBtn.addEventListener("click", () => handlePaintAction("clear"));
}

function handlePaintAction(action) {
  if (!paintIframe) return;

  if (action === "clear") {
    const dict = I18N[state.lang] || I18N[DEFAULT_LANG] || {};
    const ok = window.confirm(dict.confirmClear || "Clear the canvas? This will reset the Paint app.");
    if (!ok) return;
    reloadPaintIframe();
  }
}

function reloadPaintIframe() {
  if (!paintIframe) return;
  const src = paintIframe.src;
  paintIframe.src = src;
}

function handlePaintShortcuts(event) {
  if (state.activeTab !== "playground") return;

  const target = event.target;
  const tag = (target?.tagName || "").toLowerCase();
  const isTyping = tag === "input" || tag === "textarea" || target?.isContentEditable;
  if (isTyping) return;

  const key = event.key.toLowerCase();
  const ctrl = event.ctrlKey || event.metaKey;
  const shift = event.shiftKey;

  if (!ctrl) return;

  // Ctrl+Shift+N -> Clear
  if (key === "n" && shift) {
    event.preventDefault();
    handlePaintAction("clear");
  }
}

/* =========================================================
   END
   ========================================================= */
