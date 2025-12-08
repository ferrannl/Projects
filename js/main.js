/* ---------- Config ---------- */

const GITHUB_USER = "ferrannl";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
const PROJECTS_URL = "./projects/projects.json";
const MEDIA_INDEX_URL = "./media/media.json";

const CACHE_KEY = "ferranProjectsCacheV2";

const SUPPORTED_LANGS = ["nl", "en", "de", "pl", "tr", "es"];
const DEFAULT_LANG = "nl";
const LANG_STORAGE_KEY = "ferranProjectsLang";
const LANG_GATE_SEEN_KEY = "ferranProjectsLangSeenGate";

// Thumbnail cache key (bumped to V2 so old logo.jpg entries are dropped)
const THUMB_CACHE_KEY = "ferranProjectsThumbsV2";

/* ---------- Random useless websites list ---------- */

const USELESS_WEB_URLS = [
 "https://pointerpointer.com/",
 "https://checkboxrace.com/",
 "https://hackertyper.com/",
 "https://papertoilet.com/",
 "https://cat-bounce.com/",
 "https://puginarug.com/",
 "https://longdogechallenge.com/",
 "https://endless.horse/",
 "https://strobe.cool/",
 "https://mondrianandme.com/",
 "https://omfgdogs.com/",
 "https://thezen.zone/",
 "https://theuselessweb.site/",
 "https://ismypcstillon.com/",
 "https://isitchristmas.com/",
 "https://alwaysjudgeabookbyitscover.com/",
 "https://smashthewalls.com/",
 "https://dont-even.net/",
 "http://cant-not-tweet-this.com/",
 "https://nooooooooooooooo.com/",
 "https://zoomquilt.org/",
 "https://zoomquilt2.com/",
 "https://koalastothemax.com/",
 "https://weirdorconfusing.com/",
 "https://purrli.com/",
 "https://drawminos.com/",
 "https://neal.fun/size-of-space/",
 "https://neal.fun/deep-sea/",
 "https://neal.fun/candle-problem/",
 "https://www.rrrgggbbb.com/",
 "https://www.crossdivisions.com/",
 "https://www.kanyezone.com/",
 "https://findtheinvisiblecow.com/",
 "https://quickdraw.withgoogle.com/",
 "https://snake.cafe/",
 "https://flappybird.io/",
 "https://chihuahuaspin.com/",
 "https://dogs.are.the.most.moe/",
 "https://whatthefluffgame.com/",
 "https://www.hereistoday.com/",
 "https://doughnutkitten.com/",
 "https://thequietplaceproject.xyz/thequietplace/",
 "https://eelslap.com/",
 "https://fallingfalling.com/",
 "https://beesbeesbees.com/",
 "https://burymewithmymoney.com/",
 "https://www.partridgegetslucky.com/",
 "http://heeeeeeeey.com/",
 "http://thatsthefinger.com/",
 "http://eelslap.com/",
 "http://www.staggeringbeauty.com/",
 "http://burymewithmymoney.com/",
 "http://www.fallingfalling.com/",
 "http://ducksarethebest.com/",
 "http://www.trypap.com/",
 "http://www.republiquedesmangues.fr/",
 "http://www.movenowthinklater.com/",
 "http://www.partridgegetslucky.com/",
 "http://www.rrrgggbbb.com/",
 "http://beesbeesbees.com/",
 "http://www.sanger.dk/",
 "http://www.koalastothemax.com/",
 "http://www.everydayim.com/",
 "http://www.leduchamp.com/",
 "http://grandpanoclothes.com/",
 "http://www.haneke.net/",
 "https://cheese.com/random/",
 "https://cantunsee.space/",
 "https://neal.fun/walls/",
 "https://neal.fun/spend/",
 "https://onesandzeros.online/",
 "https://thatsthefinger.com/",
 "https://pointerpointer.com/",
 "https://trypap.com/",
 "https://heeeeeeeey.com/",
 "https://hooooooooo.com/",
 "https://www.breakglassforfun.com/",
 "https://drawabezier.com/"
];

/* ---------- State ---------- */

let repos = [];
let projects = [];
let mediaItems = [];
let thumbCache = loadThumbCache();

const state = {
  activeTab: "projects",
  search: "",
  typeFilter: "all",
  languageFilter: "all",
  mediaTypeFilter: "all",
  mediaFormatFilter: "all",
  lang: DEFAULT_LANG
};

/* Small words not capitalized in titles (except first word) */
const SMALL_WORDS = [
  "voor",
  "na",
  "met",
  "door",
  "en",
  "of",
  "und",
  "mit",
  "von",
  "the",
  "and",
  "of"
];

/* Languages you don't want to see at all */
const BLOCKED_LANGUAGES = ["roff", "nix", "emacs lisp"];

/* ---------- i18n dictionary ---------- */

const I18N = {
  nl: {
    subtitle:
      "Al mijn programmeer- en codeprojecten op één plek – websites, apps, schoolopdrachten, guides, API’s en meer.",
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
    mediaFormatLabel: "Bestandstype",
    mediaFormatAll: "Alle formaten",
    emptyState:
      "Geen projecten gevonden met deze zoekopdracht of filters. Probeer iets anders.",
    mediaEmptyState: "Geen media gevonden met deze zoekopdracht of filters.",
    headerLangButton: "Taal",
    footerBuilt: "Gemaakt met ♥ door Ferran",
    btnLiveSite: "Live site"
  },
  en: {
    subtitle:
      "All my programming and coding projects in one place – websites, apps, school projects, guides, APIs and more.",
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
    mediaFormatLabel: "File type",
    mediaFormatAll: "All types",
    emptyState: "No projects found with these filters. Try something else.",
    mediaEmptyState: "No media found with these filters.",
    headerLangButton: "Language",
    footerBuilt: "Built with ♥ by Ferran",
    btnLiveSite: "Live site"
  },
  de: {
    subtitle:
      "Alle meine Programmier- und Coding-Projekte an einem Ort – Websites, Apps, Schulprojekte, Guides, APIs und mehr.",
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
    mediaKindVideos: "Video’s",
    mediaKindAudio: "Audio",
    mediaFormatLabel: "Dateityp",
    mediaFormatAll: "Alle Formate",
    emptyState:
      "Keine Projekte mit dieser Suche oder diesen Filtern gefunden. Probier etwas anderes.",
    mediaEmptyState:
      "Keine Medien mit dieser Suche oder diesen Filtern gefunden.",
    headerLangButton: "Sprache",
    footerBuilt: "Erstellt mit ♥ von Ferran",
    btnLiveSite: "Live-Seite"
  },
  pl: {
    subtitle:
      "Wszystkie moje projekty programistyczne w jednym miejscu – strony WWW, aplikacje, projekty szkolne, poradniki, API i więcej.",
    aboutTitle: "O mnie",
    aboutP1:
      "Cześć 👋🏻 tu Ferran. Jestem holenderskim 🇳🇱 developerem z Utrechtu / ’s-Hertogenbosch. Lubię tworzyć strony WWW, aplikacje i małe narzędzia pomagające mnie i innym.",
    aboutP2: "",
    playgroundPaintTitle: "Plac zabaw MS Paint",
    playgroundPaintText: "Remake MS Paint, miłej zabawy przy rysowaniu!",
    playgroundRandomTitle: "Przycisk losowej strony",
    playgroundRandomText:
      "Nudzisz się lub jesteś ciekawy? Kliknij przycisk, a otworzy się losowa, dziwna strona w nowej karcie.",
    randomButtonLabel: "Zabierz mnie na losową stronę",
    tabProjects: "Projekty",
    tabMedia: "Media",
    tabPlayground: "Playground",
    searchLabel: "Szukaj",
    filterTypeLabel: "Typ",
    typeAll: "Wszystko",
    typeWebsite: "Strony WWW",
    typeMobile: "Mobilne",
    typeApi: "API / Backend",
    typeSchool: "Szkoła / Studia",
    typeGame: "Gra",
    typeOther: "Inne",
    filterLanguageLabel: "Język",
    languageFilterAll: "Wszystkie języki",
    mediaTypeLabel: "Typ medium",
    mediaKindAll: "Wszystko",
    mediaKindImages: "Obrazy",
    mediaKindVideos: "Wideo",
    mediaKindAudio: "Audio",
    mediaFormatLabel: "Typ pliku",
    mediaFormatAll: "Wszystkie formaty",
    emptyState:
      "Nie znaleziono projektów dla tych filtrów. Spróbuj czegoś innego.",
    mediaEmptyState: "Nie znaleziono mediów dla tych filtrów.",
    headerLangButton: "Język",
    footerBuilt: "Stworzone z ♥ przez Ferrana",
    btnLiveSite: "Strona live"
  },
  tr: {
    subtitle:
      "Tüm programlama projelerim tek bir yerde – web siteleri, uygulamalar, okul projeleri, rehberler, API’ler ve daha fazlası.",
    aboutTitle: "Hakkımda",
    aboutP1:
      "Selam 👋🏻 ben Ferran. Utrecht / ’s-Hertogenbosch’ta yaşayan Hollandalı 🇳🇱 bir developer’ım. Kendime ve başkalarına yardımcı olmak için web siteleri, uygulamalar ve küçük araçlar geliştirmeyi seviyorum.",
    aboutP2: "",
    playgroundPaintTitle: "MS Paint Oyun Alanı",
    playgroundPaintText: "MS Paint yeniden yapımı, keyifle çiz!",
    playgroundRandomTitle: "Rastgele Site Butonu",
    playgroundRandomText:
      "Meraklı veya sıkılmış mısın? Butona tıkla, yeni sekmede rastgele garip bir site açılsın.",
    randomButtonLabel: "Beni rastgele bir siteye götür",
    tabProjects: "Projeler",
    tabMedia: "Medya",
    tabPlayground: "Playground",
    searchLabel: "Ara",
    filterTypeLabel: "Tür",
    typeAll: "Hepsi",
    typeWebsite: "Web siteleri",
    typeMobile: "Mobil",
    typeApi: "API’ler / Backend",
    typeSchool: "Okul / Çalışma",
    typeGame: "Oyun",
    typeOther: "Diğer",
    filterLanguageLabel: "Dil",
    languageFilterAll: "Tüm diller",
    mediaTypeLabel: "Medya türü",
    mediaKindAll: "Hepsi",
    mediaKindImages: "Görseller",
    mediaKindVideos: "Videolar",
    mediaKindAudio: "Ses",
    mediaFormatLabel: "Dosya türü",
    mediaFormatAll: "Tüm türler",
    emptyState:
      "Bu arama veya filtrelerle proje bulunamadı. Başka bir şey dene.",
    mediaEmptyState: "Bu arama veya filtrelerle medya bulunamadı.",
    headerLangButton: "Dil",
    footerBuilt: "♥ ile geliştirildi – Ferran",
    btnLiveSite: "Canlı site"
  },
  es: {
    subtitle:
      "Todos mis proyectos de programación en un solo lugar – webs, apps, trabajos de clase, guías, APIs y más.",
    aboutTitle: "Sobre mí",
    aboutP1:
      "Hola 👋🏻 soy Ferran. Soy un desarrollador 🇳🇱 de Utrecht / ’s-Hertogenbosch. Me gusta crear webs, apps y pequeñas herramientas para ayudarme a mí y a otras personas.",
    aboutP2: "",
    playgroundPaintTitle: "Playground de MS Paint",
    playgroundPaintText:
      "Remake de MS Paint, ¡diviértete dibujando!",
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
    mediaFormatLabel: "Tipo de archivo",
    mediaFormatAll: "Todos los tipos",
    emptyState:
      "No se encontraron proyectos con estos filtros. Prueba otra cosa.",
    mediaEmptyState: "No se encontró media con estos filtros.",
    headerLangButton: "Idioma",
    footerBuilt: "Hecho con ♥ por Ferran",
    btnLiveSite: "Sitio live"
  }
};

/* Type labels for the type-badge, by language */
const TYPE_LABELS = {
  website: {
    nl: "Website",
    en: "Website",
    de: "Website",
    pl: "Strona WWW",
    tr: "Web sitesi",
    es: "Sitio web"
  },
  mobile: {
    nl: "Mobiel",
    en: "Mobile",
    de: "Mobile",
    pl: "Mobilne",
    tr: "Mobil",
    es: "Móvil"
  },
  api: {
    nl: "API / Backend",
    en: "API / Backend",
    de: "API / Backend",
    pl: "API / Backend",
    tr: "API / Backend",
    es: "API / Backend"
  },
  school: {
    nl: "School / Studie",
    en: "School / Study",
    de: "Schule / Studium",
    pl: "Szkoła / Studia",
    tr: "Okul / Çalışma",
    es: "Escuela / Estudio"
  },
  game: {
    nl: "Game",
    en: "Game",
    de: "Game",
    pl: "Gra",
    tr: "Oyun",
    es: "Juego"
  },
  other: {
    nl: "Overig",
    en: "Other",
    de: "Sonstiges",
    pl: "Inne",
    tr: "Diğer",
    es: "Otros"
  }
};

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("js-enabled");

  setupLanguage();
  setupTabsAndFilters();
  setupSearch();
  setupImageModal();
  setupFooterCopyright();
  setupPlaygroundRandomButton();

  loadProjects();
  loadMedia();
});

/* ---------- Helpers: search placeholder per lang + tab ---------- */

function getSearchPlaceholder(lang, view) {
  const tab = view || "projects";

  // normalise lang
  const l = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;

  if (tab === "media") {
    if (l === "nl") {
      return "Zoek in media op titel of bestandsnaam…";
    } else if (l === "de") {
      return "Suche in Medien nach Titel oder Dateiname…";
    } else if (l === "pl") {
      return "Szukaj w mediach po tytule lub nazwie pliku…";
    } else if (l === "tr") {
      return "Medya içinde başlık veya dosya adına göre ara…";
    } else if (l === "es") {
      return "Busca en media por título o nombre de archivo…";
    } else {
      return "Search media by title or filename…";
    }
  }

  if (tab === "playground") {
    if (l === "nl") {
      return "Zoek in Playground-tools op naam of beschrijving…";
    } else if (l === "de") {
      return "Suche in Playground-Tools nach Name oder Beschreibung…";
    } else if (l === "pl") {
      return "Szukaj narzędzi Playground po nazwie lub opisie…";
    } else if (l === "tr") {
      return "Playground araçlarında ada veya açıklamaya göre ara…";
    } else if (l === "es") {
      return "Busca herramientas del Playground por nombre o descripción…";
    } else {
      return "Search playground tools by name or description…";
    }
  }

  // default: projects
  if (l === "nl") {
    return "Zoek in projecten op naam, beschrijving, programmeertaal of tags…";
  } else if (l === "de") {
    return "Suche in Projekten nach Name, Beschreibung, Sprache oder Tags…";
  } else if (l === "pl") {
    return "Szukaj projektów po nazwie, opisie, języku lub tagach…";
  } else if (l === "tr") {
    return "Projelerde ada, açıklamaya, dile veya etiketlere göre ara…";
  } else if (l === "es") {
    return "Busca proyectos por nombre, descripción, lenguaje o etiquetas…";
  } else {
    return "Search projects by name, description, language or tags…";
  }
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

  const initialLang = SUPPORTED_LANGS.includes(savedLang)
    ? savedLang
    : DEFAULT_LANG;
  state.lang = initialLang;

  const gate = document.getElementById("langGate");
  if (gate) {
    if (gateSeen) {
      gate.hidden = true;
    }

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
  if (headerLangButton) {
    headerLangButton.addEventListener("click", () => {
      if (!gate) return;
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

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = dict[key];
    if (typeof value === "string") {
      el.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-footer-built]").forEach((el) => {
    const key = "footerBuilt";
    const value = dict[key];
    if (typeof value === "string") {
      el.textContent = value;
    }
  });

  const searchLabelEl = document.querySelector("[data-i18n='searchLabel']");
  if (searchLabelEl && dict.searchLabel) {
    searchLabelEl.textContent = dict.searchLabel;
  }

  // 🔤 language-aware + tab-aware placeholder
  updateSearchPlaceholder();

  updateLanguageGateActive();
  renderProjects();
}

function updateLanguageGateActive() {
  const buttons = document.querySelectorAll(".btn-lang");
  buttons.forEach((btn) => {
    const code = btn.dataset.lang;
    if (code === state.lang) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
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

  if (
    !projectsTab ||
    !mediaTab ||
    !playgroundTab ||
    !projectsView ||
    !mediaView ||
    !playgroundView
  )
    return;

  const tabsContainer = document.querySelector(".tabs");

  function updateTabsVisual(mode) {
    const tabs = tabsContainer;
    if (!tabs) return;
    tabs.classList.remove("tabs-media", "tabs-playground");
    if (mode === "media") {
      tabs.classList.add("tabs-media");
    } else if (mode === "playground") {
      tabs.classList.add("tabs-playground");
    }
  }

  // NEW: bind gradient pill to the active tab's exact position/width
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

    updateTabsVisual("projects");
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

    updateTabsVisual("media");
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

    updateTabsVisual("playground");
    updateSearchPlaceholder();
    updateTabsPill(playgroundTab);
  }

  projectsTab.addEventListener("click", showProjects);
  mediaTab.addEventListener("click", showMedia);
  playgroundTab.addEventListener("click", showPlayground);

  // default view
  showProjects();

  // keep pill aligned on resize
  window.addEventListener("resize", () => {
    const active =
      state.activeTab === "media"
        ? mediaTab
        : state.activeTab === "playground"
        ? playgroundTab
        : projectsTab;
    updateTabsPill(active);
  });

  const typeFilter = document.getElementById("typeFilter");
  const languageFilter = document.getElementById("languageFilter");
  const mediaTypeFilter = document.getElementById("mediaTypeFilter");
  const mediaFormatFilter = document.getElementById("mediaFormatFilter");

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

  if (mediaFormatFilter) {
    mediaFormatFilter.addEventListener("change", () => {
      state.mediaFormatFilter = mediaFormatFilter.value;
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
    if (state.activeTab === "projects") {
      renderProjects();
    } else if (state.activeTab === "media") {
      renderMedia();
    }
  });

  // ensure placeholder is correct at init
  updateSearchPlaceholder();
}

/* ---------- Projects loading (GitHub + overrides) ---------- */

async function loadProjects() {
  const overrides = await loadProjectOverrides();
  const apiRepos = await loadGitHubReposWithCache();

  const overridesByName = {};
  overrides.forEach((o) => {
    if (o && o.name) {
      overridesByName[o.name.toLowerCase()] = o;
    }
  });

  // Hidden repos: Projects (self), Munchkin, PSO WiiU guide
  repos = apiRepos.filter((repo) => {
    if (repo.archived || repo.fork) return false;
    const name = (repo.name || "").toLowerCase();
    if (name === "projects") return false;
    if (name.includes("munchkin")) return false;
    if (name.includes("pso") && name.includes("wiiu")) return false;
    return true;
  });

  projects = repos.map((repo) => {
    const o = overridesByName[repo.name.toLowerCase()] || {};

    const displayName = formatRepoName(o.displayName || repo.name || "");
    const description =
      o.description || repo.description || "No description yet.";

    const overrideLangs = Array.isArray(o.languages)
      ? o.languages
      : o.langs;

    const languages = getLanguagesList(repo, overrideLangs);

    const type = guessProjectType(repo, o);

    const tags = Array.isArray(o.tags) ? [...o.tags] : [];

    if (isSecurityProject(repo, o, languages) && !tags.includes("Security")) {
      tags.push("Security");
    }

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
      thumbnail
    };
  });

  sortProjectsByLive();
  buildLanguageFilterOptions(projects);
  renderProjects();

  verifyLiveSites();
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

/* ---------- GitHub repo loading (simplified cache) ---------- */

async function loadGitHubReposWithCache() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error("GitHub HTTP " + res.status);
    }

    const data = await res.json();
    saveReposToCache(data);
    return data;
  } catch (err) {
    console.error("GitHub fetch failed, trying cache instead:", err);

    const cached = readReposFromCache();
    if (cached) {
      console.warn("Using cached GitHub repos");
      return cached;
    }

    console.warn("No cached repos available, returning empty list");
    return [];
  }
}

function readReposFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && Array.isArray(parsed.repos)) {
      return parsed.repos;
    }

    return null;
  } catch (err) {
    console.error("Error reading repos from cache:", err);
    return null;
  }
}

function saveReposToCache(repos) {
  try {
    const payload = {
      timestamp: Date.now(),
      repos
    };
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

      if (SMALL_WORDS.includes(lw) && index !== 0) {
        return lw;
      }

      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

/**
 * Build a language list for display & filters.
 * - Applies overrides if present
 * - Adds smart mappings (HTML → HTML/CSS/JS, C# → C#/.NET, etc.)
 * - Removes blocked langs (Roff, Nix, Emacs Lisp)
 * - Adds ASP.NET when repo smells like ASP.NET and uses .NET
 */
function getLanguagesList(repo, overrideList) {
  const primary = repo && repo.language ? repo.language : null;
  const list = [];

  // If overrides exist for this repo, start from those
  if (Array.isArray(overrideList) && overrideList.length) {
    overrideList.forEach((l) => {
      if (l) list.push(l);
    });
  } else if (primary) {
    const p = String(primary).toLowerCase();

    if (p === "html") {
      list.push("HTML", "CSS", "JS");
    } else if (p === "javascript") {
      list.push("JS", "HTML", "CSS");
    } else if (p === "typescript") {
      list.push("TypeScript", "JS", "HTML", "CSS");
    } else if (p === "c#") {
      // Your preferred behaviour: C# implies .NET
      list.push("C#", ".NET");
    } else if (p === "c++") {
      list.push("C++", "C");
    } else if (p === "php") {
      list.push("PHP", "HTML", "CSS", "JS");
    } else if (p === "css") {
      list.push("CSS", "HTML", "JS");
    } else if (p === "less") {
      list.push("Less", "HTML", "CSS", "JS", "SCSS");
    } else if (p === "scss" || p === "sass") {
      list.push("SCSS", "CSS", "HTML", "JS");
    } else {
      list.push(primary);
    }
  }

  // Filter out weird langs you don't care about
  let filtered = list.filter((l) => {
    if (!l) return false;
    const lower = String(l).toLowerCase();
    return !BLOCKED_LANGUAGES.includes(lower);
  });

  // ASP.NET detection heuristics
  const text = (
    (repo && repo.name ? repo.name : "") +
    " " +
    (repo && repo.description ? repo.description : "")
  ).toLowerCase();

  const hasDotNet = filtered.some((l) =>
    String(l).toLowerCase().includes(".net")
  );
  const aspNetNeedles = [
    "aspnet",
    "asp-net",
    "asp.net",
    "program.cs",
    "startup.cs",
    "appsettings.json",
    ".csproj",
    "/controllers/",
    "controllers/"
  ];

  const looksAspNet = aspNetNeedles.some((n) => text.includes(n));

  if (hasDotNet && looksAspNet) {
    const already = filtered.some(
      (l) => String(l).toLowerCase() === "asp.net"
    );
    if (!already) {
      filtered.push("ASP.NET");
    }
  }

  return filtered;
}

function buildLanguageFilterOptions(projects) {
  const select = document.getElementById("languageFilter");
  if (!select) return;

  while (select.options.length > 1) {
    select.remove(1);
  }

  const set = new Set();
  projects.forEach((p) => {
    (p.languages || []).forEach((lang) => set.add(lang));
  });

  const sorted = Array.from(set).sort((a, b) =>
    a.localeCompare(b, "en")
  );

  sorted.forEach((lang) => {
    const opt = document.createElement("option");
    opt.value = lang;
    opt.textContent = lang;
    select.appendChild(opt);
  });
}

/* ---------- Project helpers: type, security tag, liveUrl, thumbnail ---------- */

function isSecurityProject(repo, override, languages) {
  if (
    override &&
    Array.isArray(override.tags) &&
    override.tags.includes("Security")
  ) {
    return true;
  }

  const text = `${repo.name || ""} ${repo.description || ""}`.toLowerCase();
  const securityWords = [
    "security",
    "secure",
    "auth",
    "authentication",
    "authorization",
    "oauth",
    "jwt",
    "token",
    "password",
    "passwort",
    "wachtwoord",
    "hash",
    "encrypt",
    "encryption",
    "crypt",
    "crypto",
    "2fa",
    "mfa",
    "devops",
    "owasp",
    "vuln",
    "vulnerability",
    "pentest",
    "penetration test",
    "internship",
    "intern",
    "stage",
    "praktijk"
  ];

  const hasSecurityWord = securityWords.some((w) => text.includes(w));

  const hasDotNet =
    (languages || []).some((l) => l.toLowerCase().includes(".net")) ||
    (repo.language || "").toLowerCase() === "c#";

  return hasDotNet && hasSecurityWord;
}

function guessProjectType(repo, override) {
  if (override && override.type) {
    return override.type;
  }

  const name = (repo.name || "").toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const joined = `${name} ${desc}`;
  const lang = (repo.language || "").toLowerCase();

  const has = (words) => words.some((w) => joined.includes(w));

  // explicit overrides by name
  if (name.includes("videoshare") || name.includes("video-share")) {
    return "api"; // VideoShare is backend / API
  }

  // Game hints
  if (
    name.includes("kolonisten") ||
    name.includes("katan") ||
    name.includes("catan")
  ) {
    return "game";
  }
  if (name.includes("dimitri")) {
    return "game";
  }

  const isGame = has([
    "game",
    "games",
    "spel",
    "sudoku",
    "unity",
    "platformer",
    "puzzle",
    "rpg",
    "jigsaw"
  ]);

  const isApi = has([
    "api",
    "backend",
    "server",
    "service",
    "rest",
    "endpoint"
  ]);

  const isMobile =
    has([
      "android",
      "ios",
      "xamarin",
      "apk",
      "play store",
      "playstore",
      "xcode",
      "swiftui",
      "react native",
      "react-native",
      "flutter",
      "mobile"
    ]) ||
    (["kotlin", "swift", "objective-c", "objective c", "dart"].includes(
      lang
    ) &&
      has(["android", "ios", "mobile"]));

  const isSchool =
    has([
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

  const isWebsite =
    lang === "html" ||
    lang === "php" ||
    lang === "vue" ||
    lang === "asp.net" ||
    has([
      "website",
      "web site",
      "webpage",
      "web page",
      "web",
      "site",
      "landing",
      "portfolio",
      "page",
      "laravel",
      "wordpress",
      "webshop",
      "shop"
    ]);

  // Priority: Game > Mobile > API > School > Website > Other
  if (isGame) return "game";
  if (isMobile) return "mobile";
  if (isApi) return "api";
  if (isSchool) return "school";
  if (isWebsite) return "website";

  return "other";
}

function computeLiveUrl(repo, override) {
  const raw = (override.liveUrl || repo.homepage || "").trim();
  if (raw) return raw;

  const hasLive =
    override.hasLive !== undefined ? !!override.hasLive : !!repo.has_pages;

  if (hasLive) {
    return `https://${GITHUB_USER}.github.io/${repo.name}/`;
  }

  return null;
}

function computeThumbnail(repo, override) {
  if (override.thumbnail || override.thumb) {
    return override.thumbnail || override.thumb;
  }
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
      const res = await fetch(project.liveUrl, {
        method: "GET",
        redirect: "follow"
      });
      if (!res.ok) {
        project.liveUrl = null;
      }
    } catch (_) {
      project.liveUrl = null;
    }
  });

  await Promise.all(checks);
  sortProjectsByLive();
  renderProjects();
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
    if (!finalUrl) {
      finalUrl = `https://opengraph.githubassets.com/1/${GITHUB_USER}/${repoName}`;
    }

    project.thumbnail = finalUrl;
    thumbCache[repoName] = finalUrl;
  });

  await Promise.all(promises);
  saveThumbCache();
  renderProjects();
}

async function findRepoRootThumbnail(repoName) {
  try {
    const
