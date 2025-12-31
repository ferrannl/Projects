/* js/main.js */
/* ---------- Config ---------- */

const GITHUB_USER = "ferrannl";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
const PROJECTS_URL = "./projects/projects.json";
const MEDIA_INDEX_URL = "./media/media.json";

const CACHE_KEY = "ferranProjectsCacheV2";
const THUMB_CACHE_KEY = "ferranProjectsThumbsV4"; // bump key (new thumb logic)

const SUPPORTED_LANGS = ["nl", "en", "de", "es"];
const DEFAULT_LANG = "nl";
const LANG_STORAGE_KEY = "ferranProjectsLang";
const LANG_GATE_SEEN_KEY = "ferranProjectsLangSeenGate";

/* ---------- Random useless websites list ---------- */

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
let paintIframe = null;

const state = {
  activeTab: "projects",
  search: "",
  typeFilter: "all",
  languageFilter: "all",
  mediaTypeFilter: "all",
  lang: DEFAULT_LANG
};

/* Small words not capitalized in titles (except first word) */
const SMALL_WORDS = ["voor", "na", "met", "door", "en", "of", "und", "mit", "von", "the", "and", "of"];

/* Languages you don't want to see */
const BLOCKED_LANGUAGES = ["roff", "nix", "emacs lisp"];

/* ---------- Secret background video (YouTube API globals) ---------- */

let bgPlayer = null;
let bgPlayerReady = false;

/* Called by the YouTube IFrame API when it’s ready */
function onYouTubeIframeAPIReady() {
  const containerId = "bgVideoContainer";
  const el = document.getElementById(containerId);
  if (!el || !window.YT || !YT.Player) return;

  // ✅ new background video
  const NEW_BG_VIDEO_ID = "oHg5SJYRHA0";

  bgPlayer = new YT.Player(containerId, {
    videoId: NEW_BG_VIDEO_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      rel: 0,
      modestbranding: 1,
      loop: 1,
      playlist: NEW_BG_VIDEO_ID,
      playsinline: 1
    },
    events: {
      onReady: (event) => {
        bgPlayerReady = true;
        try {
          event.target.setVolume(20);
        } catch (_) {}
      }
    }
  });
}

/* ---------- i18n dictionary ---------- */

const I18N = {
  nl: {
    gateTitle: "Kies je taal",
    gateHint: "Je kunt dit later wijzigen via de taalknop bovenaan.",
    gateNlSub: "Moedertaal",
    gateEnSub: "Internationaal",
    gateDeSub: "Voor mijn buren",
    gateEsSub: "Voor vrienden uit Spanje en de Canarische Eilanden",

    // ✅ new subtitle
    subtitle: "Op deze website vind je een selectie van mijn projecten op één plek.",

    aboutTitle: "Over mij",
    aboutP1:
      "Hey 👋🏻 Ferran hier. Ik ben een Nederlandse 🇳🇱 developer uit Utrecht / ’s-Hertogenbosch. Ik bouw graag websites, apps en kleine tools om mezelf en anderen te helpen.",
    aboutP2: "",
    playgroundPaintTitle: "MS Paint Playground",
    playgroundPaintText: "MS Paint-remake, veel tekenplezier!",
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

    // ✅ renamed buttons
    btnGitHub: "Bekijk code",
    btnLiveSite: "Bekijk live website",

    btnDownload: "Download",

    paintClearButton: "Wissen",
    paintClearShortcutHint: "(Ctrl+Shift+N)",
    confirmClearPaint: "Canvas wissen? Dit reset de Paint-app.",

    modalOpenNewTab: "Openen in nieuw tabblad",
    modalClose: "Sluiten",

    mediaOpen: "Openen",
    mediaDownload: "Download",
    mediaView: "Bekijken",
    mediaVolume: "Volume",
    mediaLoop: "🔁 Loop",
    mediaLoopTitle: "Loop aan/uit"
  },
  en: {
    gateTitle: "Choose your language",
    gateHint: "You can change it later with the language button at the top.",
    gateNlSub: "Native",
    gateEnSub: "International",
    gateDeSub: "For my neighbors",
    gateEsSub: "For friends from Spain & the Canary Islands",

    // ✅ new subtitle
    subtitle: "On this website you can find a selection of my projects in one place.",

    aboutTitle: "About me",
    aboutP1:
      "Hey 👋🏻 Ferran here. I’m a Dutch 🇳🇱 developer from Utrecht / ’s-Hertogenbosch. I like building websites, apps and small tools to help myself and others.",
    aboutP2: "",
    playgroundPaintTitle: "MS Paint Playground",
    playgroundPaintText: "MS Paint remake, have fun drawing!",
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

    // ✅ renamed buttons
    btnGitHub: "View code",
    btnLiveSite: "View live website",

    btnDownload: "Download",

    paintClearButton: "Clear",
    paintClearShortcutHint: "(Ctrl+Shift+N)",
    confirmClearPaint: "Clear the canvas? This will reset the Paint app.",

    modalOpenNewTab: "Open in new tab",
    modalClose: "Close",

    mediaOpen: "Open",
    mediaDownload: "Download",
    mediaView: "View",
    mediaVolume: "Volume",
    mediaLoop: "🔁 Loop",
    mediaLoopTitle: "Toggle loop"
  },
  de: {
    gateTitle: "Wähle deine Sprache",
    gateHint: "Du kannst sie später oben über die Sprach-Schaltfläche ändern.",
    gateNlSub: "Muttersprache",
    gateEnSub: "International",
    gateDeSub: "Für meine Nachbarn",
    gateEsSub: "Für Freunde aus Spanien & den Kanaren",

    // ✅ new subtitle
    subtitle: "Auf dieser Website findest du eine Auswahl meiner Projekte an einem Ort.",

    aboutTitle: "Über mich",
    aboutP1:
      "Hey 👋🏻 hier ist Ferran. Ich bin ein niederländischer 🇳🇱 Entwickler aus Utrecht / ’s-Hertogenbosch und baue gern Websites, Apps und kleine Tools, um mir und anderen zu helfen.",
    aboutP2: "",
    playgroundPaintTitle: "MS-Paint-Playground",
    playgroundPaintText: "MS-Paint-Remake, viel Spaß beim Zeichnen!",
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

    // ✅ renamed buttons
    btnGitHub: "Code ansehen",
    btnLiveSite: "Live-Website ansehen",

    btnDownload: "Download",

    paintClearButton: "Leeren",
    paintClearShortcutHint: "(Strg+Umschalt+N)",
    confirmClearPaint: "Canvas leeren? Das setzt die Paint-App zurück.",

    modalOpenNewTab: "In neuem Tab öffnen",
    modalClose: "Schließen",

    mediaOpen: "Öffnen",
    mediaDownload: "Download",
    mediaView: "Ansehen",
    mediaVolume: "Lautstärke",
    mediaLoop: "🔁 Loop",
    mediaLoopTitle: "Loop umschalten"
  },
  es: {
    gateTitle: "Elige tu idioma",
    gateHint: "Puedes cambiarlo después con el botón de idioma arriba.",
    gateNlSub: "Idioma nativo",
    gateEnSub: "Internacional",
    gateDeSub: "Para mis vecinos",
    gateEsSub: "Para amigos de España y Canarias",

    // ✅ new subtitle
    subtitle: "En esta web encontrarás una selección de mis proyectos en un solo lugar.",

    aboutTitle: "Sobre mí",
    aboutP1:
      "Hola 👋🏻 soy Ferran. Soy un desarrollador 🇳🇱 de Utrecht / ’s-Hertogenbosch. Me gusta crear webs, apps y pequeñas herramientas para ayudarme a mí y a otras personas.",
    aboutP2: "",
    playgroundPaintTitle: "Playground de MS Paint",
    playgroundPaintText: "Remake de MS Paint, ¡diviértete dibujando!",
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

    // ✅ renamed buttons
    btnGitHub: "Ver código",
    btnLiveSite: "Ver web en vivo",

    btnDownload: "Descargar",

    paintClearButton: "Borrar",
    paintClearShortcutHint: "(Ctrl+Shift+N)",
    confirmClearPaint: "¿Borrar el lienzo? Esto reiniciará la app de Paint.",

    modalOpenNewTab: "Abrir en una nueva pestaña",
    modalClose: "Cerrar",

    mediaOpen: "Abrir",
    mediaDownload: "Descargar",
    mediaView: "Ver",
    mediaVolume: "Volumen",
    mediaLoop: "🔁 Loop",
    mediaLoopTitle: "Alternar loop"
  }
};

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("js-enabled");

  // hard-remove any leftover postboard HTML if it still exists (safety)
  document.getElementById("postboardForm")?.closest(".playground-card")?.remove();

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

/* ---------- Helpers: search placeholder per lang + tab ---------- */

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

/* ---------- Language / gate ---------- */

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
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (_) {}

  const dict = I18N[lang] || I18N[DEFAULT_LANG] || {};
  document.documentElement.lang = lang;

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

/* ---------- Tabs & filters visibility ---------- */

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

/* ---------- Search ---------- */

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

/* ---------- Secret bg video toggle (profile picture) ---------- */

function setAvatarPlaying(isPlaying) {
  const avatar = document.querySelector(".profile-avatar");
  if (!avatar) return;
  avatar.classList.toggle("profile-avatar--playing", isPlaying);
}

function setupSecretBgVideoToggle() {
  const avatarImg = document.querySelector(".profile-avatar-inner img");
  const overlay = document.getElementById("bgVideoOverlay");
  if (!avatarImg || !overlay) return;

  avatarImg.style.cursor = "pointer";

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
        setAvatarPlaying(false);
      }
    } catch (_) {}
  });
}

/* ---------- Projects loading (GitHub + overrides) ---------- */

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

    // ✅ shorten very long descriptions + ellipsis
    const rawDesc = o.description || repo.description || "No description yet.";
    const description = shortenDescription(rawDesc);

    const overrideLangs = Array.isArray(o.languages) ? o.languages : o.langs;
    const languages = getLanguagesList(repo.language, overrideLangs);

    const type = guessProjectType(repo, o, languages);
    const tags = Array.isArray(o.tags) ? [...o.tags] : [];
    const liveUrl = computeLiveUrl(repo, o, languages, type);
    const thumbnail = computeThumbnail(repo, o);

    return {
      id: repo.id,
      name: repo.name,
      displayName,
      description,
      languages,
      type,
      tags,
      liveUrl,
      githubUrl: repo.html_url,
      thumbnail
    };
  });

  sortProjectsByLive();
  buildLanguageFilterOptions(projects);
  renderProjects();
  loadProjectThumbnails();
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

/* ---------- GitHub repo loading (cache) ---------- */

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

/* ---------- Name / language helpers ---------- */

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

/* ---------- Type helpers (simple) ---------- */

function guessProjectType(repo, override, languages) {
  if (override && override.type) return override.type;

  const name = (repo.name || "").toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const joined = `${name} ${desc}`;
  const lang = (repo.language || "").toLowerCase();

  const has = (words) => words.some((w) => joined.includes(w));

  const isGame = has(["game", "games", "spel", "sudoku", "unity", "platformer", "puzzle", "rpg"]);
  const isApi = has(["api", "backend", "server", "service", "rest", "endpoint"]);
  const isMobile = has(["android", "ios", "xamarin", "apk", "swiftui", "flutter", "react native", "react-native"]);
  const isSchool = has(["school", "study", "studie", "uni", "hogeschool", "opdracht", "assignment", "stage", "internship"]);
  const isWebsite = lang === "html" || lang === "php" || has(["website", "webpage", "portfolio", "landing", "site", "page"]);

  if (isGame) return "game";
  if (isMobile) return "mobile";
  if (isApi) return "api";
  if (isSchool) return "school";
  if (isWebsite) return "website";
  return "other";
}

/* ---------- Project helpers: description shortening, liveUrl, thumbnail ---------- */

function shortenDescription(text) {
  const s = String(text || "").trim();
  if (!s) return "";

  // Keep it neat, end with ellipsis if it's long.
  // (CSS already clamps lines; this prevents super-long paragraphs.)
  const MAX = 220;
  if (s.length <= MAX) return s;

  // cut on a word boundary
  const cut = s.slice(0, MAX);
  const lastSpace = cut.lastIndexOf(" ");
  const safe = lastSpace > 140 ? cut.slice(0, lastSpace) : cut;
  return safe.replace(/[.,;:\s]+$/, "") + "…";
}

function isPureStaticWebsite(languages, repo, override, type) {
  // Only show live site button for pure HTML/CSS/LESS/JS (and variants),
  // NOT for PHP/Laravel etc.
  const langs = (languages || []).map((l) => String(l).toLowerCase());

  // explicit block
  if (langs.includes("php") || langs.includes("laravel")) return false;

  // Sometimes repo language may be PHP but languages list was overridden
  const primary = String(repo?.language || "").toLowerCase();
  if (primary === "php") return false;

  // If it looks like Laravel in name/desc/tags -> block
  const joined =
    `${repo?.name || ""} ${repo?.description || ""} ${(override?.tags || []).join(" ")}`
      .toLowerCase();
  if (joined.includes("laravel")) return false;

  // Must be website-ish for showing live pages
  if (type && type !== "website") {
    // allow override later via hasLive/liveUrl, but default logic: keep it website-only
    return false;
  }

  // allowed set (your request: HTML, CSS, LESS, JS)
  const allowed = new Set(["html", "css", "less", "js", "javascript", "typescript"]);
  if (!langs.length) return false;

  // if it contains any "not-allowed" tech -> block
  const blocked = new Set([
    "php",
    "laravel",
    "c#",
    ".net",
    "java",
    "python",
    "go",
    "rust",
    "kotlin",
    "swift",
    "dockerfile"
  ]);

  if (langs.some((l) => blocked.has(l))) return false;

  // At least one allowed, and all must be in allowed/blocklist checked above
  return langs.some((l) => allowed.has(l));
}

function computeLiveUrl(repo, override, languages, type) {
  const rawOverride = (override.liveUrl || "").trim();
  if (rawOverride) return rawOverride;

  // If you explicitly set hasLive in projects.json, keep it (your manual overrides win)
  const hasLiveOverride = override.hasLive !== undefined ? !!override.hasLive : null;
  if (hasLiveOverride === true) return `https://${GITHUB_USER}.github.io/${repo.name}/`;
  if (hasLiveOverride === false) return null;

  // default: only show live button for pure static sites AND if GitHub Pages is enabled
  const hasPages = !!repo.has_pages;
  if (!hasPages) return null;

  if (!isPureStaticWebsite(languages, repo, override, type)) return null;

  return `https://${GITHUB_USER}.github.io/${repo.name}/`;
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

/* ---------- Thumbnail helpers (root images) ---------- */

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
  try {
    localStorage.setItem(THUMB_CACHE_KEY, JSON.stringify(thumbCache));
  } catch (_) {}
}

/**
 * "exists" check: try HEAD, fallback GET.
 * For GIF specifically: do GET (some CDNs/proxies behave weird on HEAD).
 */
async function checkImageExists(url, preferGet = false) {
  try {
    if (!preferGet) {
      let res = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (res.ok) return true;
    }
    const res2 = await fetch(url, { method: "GET", cache: "no-store" });
    return res2.ok;
  } catch (_) {
    return false;
  }
}

/** cache-busting without breaking raw URLs */
function withBust(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${Date.now()}`;
}

async function loadProjectThumbnails() {
  const promises = projects.map(async (project) => {
    const repoName = project.name;

    // 1) explicit override thumb
    if (project.thumbnail && !thumbCache[repoName]) {
      const ok = await checkImageExists(project.thumbnail, project.thumbnail.toLowerCase().endsWith(".gif"));
      if (ok) {
        thumbCache[repoName] = project.thumbnail;
        return;
      } else {
        project.thumbnail = null;
      }
    }

    // 2) cached
    const cached = thumbCache[repoName];
    if (cached) {
      project.thumbnail = cached;
      return;
    }

    // 3) try repo root (logo.gif highest priority)
    const rootThumb = await findRepoRootThumbnail(repoName);
    let finalUrl = rootThumb;

    // 4) fallback: GitHub opengraph
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

      // ✅ ABSOLUTE prio: logo.gif
      if (lower === "logo.gif") return 0;

      // next: common logo formats
      if (lower === "logo.png") return 1;
      if (lower === "logo.jpg" || lower === "logo.jpeg") return 2;
      if (lower === "logo.webp") return 3;
      if (lower === "logo.svg") return 4;

      // other "logo.*"
      if (lower.startsWith("logo.")) return 5;

      // other common thumbs
      if (lower === "thumbnail.png" || lower === "thumb.png") return 6;
      if (lower === "preview.png") return 7;

      // avoid diagrams
      if (lower.includes("classdiagram")) return 20;
      if (lower.includes("diagram")) return 21;

      return 50;
    };

    imageFiles.sort((a, b) => score(a.name) - score(b.name));
    const chosen = imageFiles[0];

    const encodedName = encodeURIComponent(chosen.name);
    const raw = `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/HEAD/${encodedName}`;

    // For GIF: validate with GET, and if flaky -> bust query once
    const isGif = (chosen.name || "").toLowerCase().endsWith(".gif");
    if (isGif) {
      const ok = await checkImageExists(raw, true);
      if (ok) return raw;

      const busted = withBust(raw);
      const ok2 = await checkImageExists(busted, true);
      if (ok2) return busted;

      // if gif fails, try next best: logo.png/jpg/etc if available
      const fallbackOrder = ["logo.png", "logo.jpg", "logo.jpeg", "logo.webp", "logo.svg"];
      const map = new Map(imageFiles.map((f) => [f.name.toLowerCase(), f]));
      for (const fname of fallbackOrder) {
        const f = map.get(fname);
        if (!f) continue;
        const u = `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/HEAD/${encodeURIComponent(f.name)}`;
        const okf = await checkImageExists(u, false);
        if (okf) return u;
      }
      return null;
    }

    // non-gif: normal check
    const ok = await checkImageExists(raw, false);
    if (!ok) return null;
    return raw;
  } catch (err) {
    console.error("Failed to load root thumbnail for", repoName, err);
    return null;
  }
}

/* ---------- Project rendering + click-to-enlarge thumbnail ---------- */

function getFilteredProjects() {
  const search = state.search.toLowerCase();
  const typeFilter = state.typeFilter;
  const langFilter = state.languageFilter;

  return projects.filter((p) => {
    if (typeFilter !== "all" && p.type !== typeFilter) return false;

    if (
      langFilter !== "all" &&
      !(p.languages || []).some((l) => String(l).toLowerCase() === String(langFilter).toLowerCase())
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

    const titleRow = document.createElement("div");
    titleRow.className = "project-title-row";

    const thumb = document.createElement("div");
    thumb.className = "project-thumb";

    if (project.thumbnail) {
      thumb.classList.add("has-image");
      const img = document.createElement("img");
      img.src = project.thumbnail;
      img.alt = project.displayName;

      // 🔥 runtime fallback: if image fails, try bust once (helps logo.gif)
      img.addEventListener("error", () => {
        // prevent loop
        if (img.dataset.busted === "1") return;
        img.dataset.busted = "1";
        img.src = withBust(project.thumbnail);
      });

      thumb.appendChild(img);
    } else {
      const span = document.createElement("span");
      span.textContent = (project.displayName || "?").charAt(0).toUpperCase();
      thumb.appendChild(span);
    }

    const titleText = document.createElement("div");
    titleText.className = "project-title-text";

    const title = document.createElement("h3");
    title.className = "project-title";
    title.textContent = project.displayName;

    const langP = document.createElement("p");
    langP.className = "project-lang";
    langP.textContent = (project.languages || []).join(" · ");

    titleText.appendChild(title);
    titleText.appendChild(langP);

    titleRow.appendChild(thumb);
    titleRow.appendChild(titleText);

    const desc = document.createElement("p");
    desc.className = "project-desc";
    desc.textContent = project.description;

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
    githubBtn.innerHTML = `<span>${dict.btnGitHub || "View code"}</span>`;
    actions.appendChild(githubBtn);

    if (project.liveUrl) {
      const liveBtn = document.createElement("a");
      liveBtn.href = project.liveUrl;
      liveBtn.target = "_blank";
      liveBtn.rel = "noopener noreferrer";
      liveBtn.className = "btn-card btn-card-live";
      liveBtn.innerHTML = `<span>${dict.btnLiveSite || "View live website"}</span>`;
      actions.appendChild(liveBtn);
    }

    // click card (except buttons) -> modal with big thumbnail
    card.addEventListener("click", (e) => {
      if (e.target.closest("a, button, .project-actions")) return;
      if (!project.thumbnail) return;
      openImageModal(project.thumbnail, project.displayName);
    });

    // click thumbnail -> modal
    thumb.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!project.thumbnail) return;
      openImageModal(project.thumbnail, project.displayName);
    });

    card.appendChild(titleRow);
    card.appendChild(desc);
    if (project.tags && project.tags.length) card.appendChild(meta);
    card.appendChild(actions);
    grid.appendChild(card);
  });
}

/* ---------- Media loading & rendering ---------- */

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

      let type = item.type;
      if (!type) type = guessMediaType(path);

      return { id: index, title, path, type };
    });

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

function createVolumeRow(mediaEl) {
  const dict = I18N[state.lang] || I18N[DEFAULT_LANG] || {};
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

  const dict = I18N[state.lang] || I18N[DEFAULT_LANG] || {};
  const filtered = getFilteredMedia();

  grid.innerHTML = "";
  if (!filtered.length) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

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
      preview.classList.add("media-preview-video");

      const video = document.createElement("video");
      video.src = item.path;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";

      // pause other videos when one starts
      video.addEventListener("play", () => {
        document.querySelectorAll("video").forEach((v) => {
          if (v !== video) v.pause();
        });
      });

      const wrapper = document.createElement("div");
      wrapper.className = "media-player-wrapper";
      wrapper.appendChild(video);
      preview.appendChild(wrapper);

      preview.appendChild(createVolumeRow(video));

      const loopBtn = document.createElement("button");
      loopBtn.type = "button";
      loopBtn.className = "media-action-btn media-loop-btn";
      loopBtn.textContent = dict.mediaLoop || "🔁 Loop";
      loopBtn.title = dict.mediaLoopTitle || "Toggle loop";
      loopBtn.addEventListener("click", () => {
        video.loop = !video.loop;
        loopBtn.classList.toggle("is-active", video.loop);
      });

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

      const wrapper = document.createElement("div");
      wrapper.className = "media-player-wrapper";
      wrapper.appendChild(audio);
      preview.appendChild(wrapper);

      preview.appendChild(createVolumeRow(audio));
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
}

/* ---------- Image modal (used by media + project thumbs) ---------- */

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

  // ✅ hint removed (no "click outside / Esc" text)

  modal.appendChild(inner);
  modal.hidden = false;
}

function closeImageModal() {
  const modal = document.getElementById("imageModal");
  if (!modal) return;
  modal.hidden = true;
}

/* ---------- Footer ---------- */

function setupFooterCopyright() {
  const el = document.getElementById("footerCopyright");
  if (!el) return;
  el.textContent = `${new Date().getFullYear()}`;
}

/* ---------- Playground random button ---------- */

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

/* ---------- Paint toolbar + shortcuts (ONLY CLEAR + i18n confirm) ---------- */

function setupPaintToolbar() {
  const paintCard = document.querySelector(".playground-paint");
  if (!paintCard) return;

  paintIframe = paintCard.querySelector("iframe[src*='paint.js.org']");

  const buttons = paintCard.querySelectorAll("[data-paint-action]");
  buttons.forEach((btn) => {
    const action = btn.getAttribute("data-paint-action");
    if (action !== "clear") {
      btn.remove();
    } else {
      btn.addEventListener("click", () => handlePaintAction("clear"));
    }
  });

  document.addEventListener("keydown", handlePaintShortcuts);
}

function handlePaintAction(action) {
  if (!paintIframe) return;
  const dict = I18N[state.lang] || I18N[DEFAULT_LANG] || {};

  if (action === "clear") {
    const ok = window.confirm(dict.confirmClearPaint || "Clear the canvas? This will reset the Paint app.");
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

/* ---------- END ---------- */
