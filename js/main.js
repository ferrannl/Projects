/* ---------- Config ---------- */

const GITHUB_USER = "ferrannl";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
const PROJECTS_URL = "./projects/projects.json";
const MEDIA_INDEX_URL = "./media/media.json";

const CACHE_KEY = "ferranProjectsCacheV2";
const THUMB_CACHE_KEY = "ferranProjectsThumbsV3";

const SUPPORTED_LANGS = ["nl", "en", "de", "pl", "tr", "es"];
const DEFAULT_LANG = "nl";
const LANG_STORAGE_KEY = "ferranProjectsLang";
const LANG_GATE_SEEN_KEY = "ferranProjectsLangSeenGate";

const POSTBOARD_STORAGE_KEY = "ferranProjectsPostboardV1";

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
  "http://www.staggeringbeauty.com/",
  "http://www.fallingfalling.com/",
  "http://ducksarethebest.com/",
  "http://www.trypap.com/",
  "http://www.republiquedesmangues.fr/",
  "http://www.movenowthinklater.com/",
  "http://www.rrrgggbbb.com/",
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
  "https://hooooooooo.com/",
  "https://www.breakglassforfun.com/",
  "https://drawabezier.com/"
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

/* Languages you don't want to see */
const BLOCKED_LANGUAGES = ["roff", "nix", "emacs lisp"];

/* ---------- Avatar "music playing" helpers ---------- */

function setAvatarPlaying(isPlaying) {
  const avatar = document.querySelector(".profile-avatar");
  if (!avatar) return;
  avatar.classList.toggle("profile-avatar--playing", isPlaying);
}

/**
 * Checks if any HTML5 audio/video is currently playing
 * and updates the avatar ring class.
 */
function updateAvatarPlayingFromMedia() {
  const mediaEls = document.querySelectorAll("audio, video");
  const anyPlaying = Array.from(mediaEls).some(
    (el) => !el.paused && !el.ended && el.currentTime > 0
  );
  setAvatarPlaying(anyPlaying);
}

/**
 * Attach play/pause hooks to a media element
 * so it can drive the avatar animation.
 */
function attachMediaPlaybackHooks(mediaElement) {
  if (!mediaElement) return;

  mediaElement.addEventListener("play", updateAvatarPlayingFromMedia);
  mediaElement.addEventListener("playing", updateAvatarPlayingFromMedia);
  mediaElement.addEventListener("pause", updateAvatarPlayingFromMedia);
  mediaElement.addEventListener("ended", updateAvatarPlayingFromMedia);
}

/* ---------- Secret background video (YouTube API globals) ---------- */

let bgPlayer = null;
let bgPlayerReady = false;

/**
 * Called by the YouTube IFrame API when it’s ready.
 * We prepare a silent background player.
 */
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
        try {
          event.target.setVolume(20); // ~20% volume
        } catch (_) {}
      }
    }
  });
}

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
    playgroundPaintHint:
      "Het tekenen gebeurt binnen paint.js.org. “Open” of “Save” opent de volledige app in een nieuw tabblad voor meer opties.",
    playgroundPostTitle: "Postboard",
    playgroundPostText:
      "Laat een kort bericht achter (anoniem of met naam). Berichten worden lokaal in je browser opgeslagen.",
    postboardNameLabel: "Naam (optioneel)",
    postboardAnonymousLabel: "Anoniem posten",
    postboardMessageLabel: "Bericht",
    postboardSubmitLabel: "Plaatsen",
    postboardListTitle: "Wall",
    postboardEmpty: "Nog geen berichten. Wees de eerste!",
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
    playgroundPaintHint:
      "Drawing happens inside paint.js.org. “Open” or “Save” will open the full app in a new tab for more options.",
    playgroundPostTitle: "Postboard",
    playgroundPostText:
      "Leave a small message (with or without your name). Entries are stored locally in your browser.",
    postboardNameLabel: "Name (optional)",
    postboardAnonymousLabel: "Post anonymously",
    postboardMessageLabel: "Message",
    postboardSubmitLabel: "Post",
    postboardListTitle: "Wall",
    postboardEmpty: "No posts yet. Be the first!",
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
    emptyState:
      "No projects found with these filters. Try something else.",
    mediaEmptyState:
      "No media found with these filters.",
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
    playgroundPaintHint:
      "Das Zeichnen findet in paint.js.org statt. „Open“ oder „Save“ öffnen die komplette App in einem neuen Tab.",
    playgroundPostTitle: "Postboard",
    playgroundPostText:
      "Hinterlass eine kurze Nachricht (mit oder ohne Namen). Einträge werden lokal im Browser gespeichert.",
    postboardNameLabel: "Name (optional)",
    postboardAnonymousLabel: "Anonym posten",
    postboardMessageLabel: "Nachricht",
    postboardSubmitLabel: "Posten",
    postboardListTitle: "Wall",
    postboardEmpty: "Noch keine Posts. Sei der Erste!",
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
    playgroundPaintText:
      "Remake MS Paint, miłej zabawy przy rysowaniu!",
    playgroundPaintHint:
      "Rysujesz wewnątrz paint.js.org. „Open” lub „Save” otworzą pełną aplikację w nowej karcie.",
    playgroundPostTitle: "Postboard",
    playgroundPostText:
      "Zostaw krótką wiadomość (z imieniem lub anonimowo). Wpisy są przechowywane lokalnie w przeglądarce.",
    postboardNameLabel: "Imię (opcjonalnie)",
    postboardAnonymousLabel: "Opublikuj anonimowo",
    postboardMessageLabel: "Wiadomość",
    postboardSubmitLabel: "Opublikuj",
    postboardListTitle: "Wall",
    postboardEmpty: "Brak wpisów. Bądź pierwszy!",
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
    mediaEmptyState:
      "Nie znaleziono mediów dla tych filtrów.",
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
    playgroundPaintHint:
      "Çizim paint.js.org içinde gerçekleşir. “Open” veya “Save” tam uygulamayı yeni sekmede açar.",
    playgroundPostTitle: "Postboard",
    playgroundPostText:
      "Kısa bir mesaj bırak (isimle veya isimsiz). Gönderiler tarayıcında yerel olarak saklanır.",
    postboardNameLabel: "İsim (isteğe bağlı)",
    postboardAnonymousLabel: "Anonim gönder",
    postboardMessageLabel: "Mesaj",
    postboardSubmitLabel: "Gönder",
    postboardListTitle: "Duvar",
    postboardEmpty: "Henüz gönderi yok. İlk sen ol!",
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
    mediaEmptyState:
      "Bu arama veya filtrelerle medya bulunamadı.",
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
    playgroundPaintHint:
      "Se dibuja dentro de paint.js.org. “Open” o “Save” abrirán la app completa en una nueva pestaña.",
    playgroundPostTitle: "Postboard",
    playgroundPostText:
      "Deja un pequeño mensaje (con o sin nombre). Las entradas se guardan localmente en tu navegador.",
    postboardNameLabel: "Nombre (opcional)",
    postboardAnonymousLabel: "Publicar anónimamente",
    postboardMessageLabel: "Mensaje",
    postboardSubmitLabel: "Publicar",
    postboardListTitle: "Muro",
    postboardEmpty: "Aún no hay mensajes. ¡Sé el primero!",
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
    mediaEmptyState:
      "No se encontró media con estos filtros.",
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
  setupSecretBgVideoToggle();
  setupPaintToolbar();
  setupPostboard();

  loadProjects();
  loadMedia();
});

/* ---------- Helpers: search placeholder per lang + tab ---------- */

function getSearchPlaceholder(lang, view) {
  const tab = view || "projects";
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
    if (!tabsContainer) return;
    tabsContainer.classList.remove("tabs-media", "tabs-playground");
    if (mode === "media") {
      tabsContainer.classList.add("tabs-media");
    } else if (mode === "playground") {
      tabsContainer.classList.add("tabs-playground");
    }
  }

  // bind gradient pill to the active tab's exact position/width
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

  updateSearchPlaceholder();
}

/* ---------- Secret bg video toggle (profile picture) ---------- */

function setupSecretBgVideoToggle() {
  const avatarImg = document.querySelector(".profile-avatar-inner img");
  const overlay = document.getElementById("bgVideoOverlay");
  if (!avatarImg || !overlay) return;

  avatarImg.style.cursor = "pointer";

  avatarImg.addEventListener("click", () => {
    if (!bgPlayerReady || !bgPlayer) {
      // If API not ready yet, do nothing
      return;
    }

    const isActive = !document.body.classList.contains("bg-video-active");
    document.body.classList.toggle("bg-video-active", isActive);
    overlay.setAttribute("aria-hidden", isActive ? "false" : "true");

    try {
      if (isActive) {
        bgPlayer.unMute();
        bgPlayer.setVolume(20);
        bgPlayer.playVideo();
        // Spin avatar ring when bg video is playing
        setAvatarPlaying(true);
      } else {
        bgPlayer.pauseVideo();
        // When pausing bg video, fall back to HTML5 media state
        updateAvatarPlayingFromMedia();
      }
    } catch (_) {
      // Ignore player errors
    }
  });
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

    const overrideLangs = Array.isArray(o.languages) ? o.languages : o.langs;
    let languages = getLanguagesList(repo.language, overrideLangs);

    // Auto-detect ASP.NET and add it as a language if applicable
    if (looksLikeAspNet(repo, o, languages)) {
      const hasAspNet = languages.some(
        (l) => String(l).toLowerCase() === "asp.net"
      );
      if (!hasAspNet) {
        languages.push("ASP.NET");
      }
    }

    const type = guessProjectType(repo, o, languages);

    const tags = Array.isArray(o.tags) ? [...o.tags] : [];
    const categoryTags = computeCategoryTags(repo, o, languages, type);
    categoryTags.forEach((t) => {
      if (!tags.includes(t)) tags.push(t);
    });

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

      if (SMALL_WORDS.includes(lw) && index !== 0) {
        return lw;
      }

      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function getLanguagesList(primary, overrideList) {
  // If overrides exist, use them but strip blocked langs
  if (Array.isArray(overrideList) && overrideList.length) {
    return overrideList
      .map((l) => String(l))
      .filter(
        (l) => !BLOCKED_LANGUAGES.includes(l.toLowerCase())
      );
  }

  const list = [];
  if (!primary) return list;

  const p = String(primary).toLowerCase();

  // If primary is blocked, just return empty list
  if (BLOCKED_LANGUAGES.includes(p)) {
    return [];
  }

  if (p === "html") {
    list.push("HTML", "CSS", "JS");
  } else if (p === "javascript") {
    list.push("JS", "HTML", "CSS");
  } else if (p === "typescript") {
    list.push("TypeScript", "JS", "HTML", "CSS");
  } else if (p === "c#") {
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

  // Final safety filter
  return list.filter(
    (l) => !BLOCKED_LANGUAGES.includes(String(l).toLowerCase())
  );
}

function buildLanguageFilterOptions(projectsList) {
  const select = document.getElementById("languageFilter");
  if (!select) return;

  while (select.options.length > 1) {
    select.remove(1);
  }

  const set = new Set();
  projectsList.forEach((p) => {
    (p.languages || []).forEach((lang) => {
      const lower = String(lang).toLowerCase();
      if (!BLOCKED_LANGUAGES.includes(lower)) {
        set.add(lang);
      }
    });
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

/* ---------- Type helpers ---------- */

function looksLikeAspNet(repo, override, languages) {
  const langs = (languages || []).map((l) => String(l).toLowerCase());
  if (langs.includes("asp.net")) return true;

  const overrideLangs = override && (override.languages || override.langs);
  if (Array.isArray(overrideLangs)) {
    const lower = overrideLangs.map((l) => String(l).toLowerCase());
    if (lower.some((l) => l.includes("asp.net"))) return true;
  }

  const text = `${repo.name || ""} ${repo.description || ""} ${
    (override && (override.description || "")) || ""
  }`.toLowerCase();

  const patterns = ["asp.net", "aspnet", "asp-net"];
  if (patterns.some((p) => text.includes(p))) return true;

  return false;
}

function computeTypeFlags(repo, override, languages) {
  const name = (repo.name || "").toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const joined = `${name} ${desc}`;
  const lang = (repo.language || "").toLowerCase();

  const has = (words) => words.some((w) => joined.includes(w));

  const aspNetLike = looksLikeAspNet(repo, override, languages);

  let isGame = has([
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

  let isApi = has([
    "api",
    "backend",
    "server",
    "service",
    "rest",
    "endpoint"
  ]) || aspNetLike;

  let isMobile =
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
    (["kotlin", "swift", "objective-c", "objective c", "dart"].includes(lang) &&
      has(["android", "ios", "mobile"]));

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

  // special cases by name
  if (name.includes("videoshare") || name.includes("video-share")) {
    isApi = true;
  }

  if (
    name.includes("kolonisten") ||
    name.includes("katan") ||
    name.includes("catan") ||
    name.includes("dimitri")
  ) {
    isGame = true;
  }

  return { isGame, isMobile, isApi, isSchool, isWebsite };
}

function guessProjectType(repo, override, languages) {
  if (override && override.type) {
    return override.type;
  }

  const flags = computeTypeFlags(repo, override, languages);

  // Priority: Game > Mobile > API > School > Website > Other
  if (flags.isGame) return "game";
  if (flags.isMobile) return "mobile";
  if (flags.isApi) return "api";
  if (flags.isSchool) return "school";
  if (flags.isWebsite) return "website";

  return "other";
}

function computeCategoryTags(repo, override, languages, primaryType) {
  const flags = computeTypeFlags(repo, override, languages);
  const tags = [];

  if (flags.isGame && primaryType !== "game") tags.push("Game");
  if (flags.isMobile && primaryType !== "mobile") tags.push("Mobile");
  if (flags.isApi && primaryType !== "api") tags.push("API / Backend");
  if (flags.isSchool && primaryType !== "school")
    tags.push("School / Study");
  if (flags.isWebsite && primaryType !== "website")
    tags.push("Website");

  const text = `${repo.name || ""} ${repo.description || ""} ${
    (override && override.description) || ""
  }`.toLowerCase();

  const algoWords = [
    "algorithm",
    "algoritme",
    "sorting",
    "sortering",
    "pathfinding",
    "dijkstra",
    "bfs",
    "dfs",
    "graph",
    "queue",
    "stack"
  ];
  if (algoWords.some((w) => text.includes(w))) {
    if (!tags.includes("Algorithms")) tags.push("Algorithms");
  }

  return tags;
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

  // Narrower list: remove internship/devops/etc so Ecobit Internship doesn't get hit
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
    "owasp",
    "vuln",
    "vulnerability",
    "pentest",
    "penetration test"
  ];

  const hasSecurityWord = securityWords.some((w) => text.includes(w));

  const hasDotNet =
    (languages || []).some((l) => l.toLowerCase().includes(".net")) ||
    (repo.language || "").toLowerCase() === "c#";

  return hasDotNet && hasSecurityWord;
}

function computeLiveUrl(repo, override) {
  const rawOverride = (override.liveUrl || "").trim();
  if (rawOverride) return rawOverride;

  // Only treat GitHub Pages (or explicit override.hasLive) as valid live sites.
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
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${repoName}/contents/`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    const files = data.filter((item) => item.type === "file");

    const imageFiles = files.filter((item) => {
      const ext = (item.name.split(".").pop() || "").toLowerCase();
      return ["jpg", "jpeg", "png", "svg", "gif", "webp"].includes(ext);
    });

    if (!imageFiles.length) {
      return null;
    }

    const score = (name) => {
      const lower = name.toLowerCase();
      if (lower === "logo.gif") return 0;
      if (lower === "logo.png") return 1;
      if (
        lower === "logo.jpg" ||
        lower === "logo.jpeg" ||
        lower === "logo.webp"
      )
        return 2;
      if (lower.startsWith("logo.")) return 3;
      if (lower.includes("classdiagram")) return 4;
      if (lower.includes("diagram")) return 5;
      return 6;
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

/* ---------- Project rendering ---------- */

function getFilteredProjects() {
  const search = state.search.toLowerCase();
  const typeFilter = state.typeFilter;
  const langFilter = state.languageFilter;

  return projects.filter((p) => {
    if (typeFilter !== "all" && p.type !== typeFilter) return false;

    if (
      langFilter !== "all" &&
      !p.languages.some(
        (l) => l.toLowerCase() === langFilter.toLowerCase()
      )
    ) {
      return false;
    }

    if (!search) return true;

    const haystack = [
      p.displayName,
      p.description,
      p.type,
      (p.tags || []).join(" "),
      (p.languages || []).join(" ")
    ]
      .join(" ")
      .toLowerCase();

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
      thumb.appendChild(img);
    } else {
      const span = document.createElement("span");
      span.textContent = (project.displayName || "?")
        .charAt(0)
        .toUpperCase();
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

    const typeBadge = document.createElement("span");
    typeBadge.className = "badge badge-type";

    const typeMap = TYPE_LABELS[project.type] || TYPE_LABELS.other;
    const typeLabel =
      typeMap[state.lang] ||
      typeMap[DEFAULT_LANG] ||
      project.type;
    typeBadge.textContent = typeLabel;

    meta.appendChild(typeBadge);

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
    githubBtn.innerHTML = "<span>GitHub</span>";
    actions.appendChild(githubBtn);

    if (project.liveUrl) {
      const liveBtn = document.createElement("a");
      liveBtn.href = project.liveUrl;
      liveBtn.target = "_blank";
      liveBtn.rel = "noopener noreferrer";
      liveBtn.className = "btn-card btn-card-live";
      const label =
        dict.btnLiveSite ||
        I18N[DEFAULT_LANG].btnLiveSite ||
        "Live site";
      liveBtn.innerHTML = `<span>${label}</span>`;
      actions.appendChild(liveBtn);
    }

    card.appendChild(titleRow);
    card.appendChild(desc);
    card.appendChild(meta);
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
        const fileName =
          item.fileName || item.name || item.title || "";
        if (fileName) {
          const lowerType = (item.type || "").toLowerCase();
          if (lowerType === "image") {
            path = `media/images/${fileName}`;
          } else if (lowerType === "video") {
            path = `media/videos/${fileName}`;
          } else if (lowerType === "audio") {
            path = `media/audio/${fileName}`;
          } else {
            path = `media/${fileName}`;
          }
        }
      }

      const title =
        item.title ||
        item.name ||
        item.fileName ||
        (path ? path.split("/").pop() : "") ||
        `Media ${index + 1}`;

      const format =
        item.format ||
        (path.split(".").pop() || "").toLowerCase() ||
        "";

      let type = item.type;
      if (!type) {
        type = guessMediaType(path);
      }

      return {
        id: index,
        title,
        path,
        type,
        format
      };
    });

    buildMediaFilterOptions(mediaItems);
    renderMedia();
  } catch (err) {
    console.error("Failed to load media index", err);
    mediaItems = [];
    renderMedia();
  }
}

function guessMediaType(path) {
  const ext = (path.split(".").pop() || "").toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) {
    return "image";
  }
  if (["mp4", "webm", "mov", "m4v"].includes(ext)) {
    return "video";
  }
  if (["mp3", "wav", "ogg", "flac"].includes(ext)) {
    return "audio";
  }
  return "image";
}

function buildMediaFilterOptions(items) {
  const typeSelect = document.getElementById("mediaTypeFilter");
  const formatSelect = document.getElementById("mediaFormatFilter");
  if (!typeSelect || !formatSelect) return;

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

  while (formatSelect.options.length > 1) formatSelect.remove(1);
  const formatSet = new Set();
  items.forEach((i) => {
    if (i.format) formatSet.add(i.format.toLowerCase());
  });
  Array.from(formatSet)
    .sort()
    .forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f;
      opt.textContent = f.toUpperCase();
      formatSelect.appendChild(opt);
    });
}

function getFilteredMedia() {
  const search = state.search.toLowerCase();
  const typeFilter = state.mediaTypeFilter;
  const formatFilter = state.mediaFormatFilter;

  return mediaItems.filter((item) => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (
      formatFilter !== "all" &&
      item.format.toLowerCase() !== formatFilter.toLowerCase()
    ) {
      return false;
    }

    if (!search) return true;

    const haystack = (
      item.title +
      " " +
      item.path +
      " " +
      item.type +
      " " +
      item.format
    ).toLowerCase();

    return haystack.includes(search);
  });
}

/**
 * Create a volume control row for a given media element (audio or video).
 * Volume: 0–100%, mapped to media.volume 0–1.
 */
function createVolumeRow(mediaEl) {
  const row = document.createElement("div");
  row.className = "media-volume-row";

  const label = document.createElement("span");
  label.className = "media-volume-label";
  label.textContent = "Volume";

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

/* ---- media rendering (with "only one video playing" logic + avatar hooks) ---- */

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

      preview.addEventListener("click", () => {
        openImageModal(item.path, item.title);
      });
    } else if (item.type === "video") {
      preview.classList.add("media-preview-video");

      const video = document.createElement("video");
      video.src = item.path;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";

      // pause other videos when this one starts playing
      video.addEventListener("play", () => {
        document.querySelectorAll("video").forEach((v) => {
          if (v !== video) v.pause();
        });
      });

      // tie this video to the avatar ring
      attachMediaPlaybackHooks(video);

      const wrapper = document.createElement("div");
      wrapper.className = "media-player-wrapper";
      wrapper.appendChild(video);
      preview.appendChild(wrapper);

      const volumeRow = createVolumeRow(video);
      preview.appendChild(volumeRow);

      // Loop toggle button per video
      const loopBtn = document.createElement("button");
      loopBtn.type = "button";
      loopBtn.className = "media-action-btn media-loop-btn";
      loopBtn.textContent = "🔁 Loop";
      loopBtn.title = "Toggle loop";

      loopBtn.addEventListener("click", () => {
        video.loop = !video.loop;
        loopBtn.classList.toggle("is-active", video.loop);
      });

      const meta = document.createElement("div");
      meta.className = "media-meta";

      const typeBadge = document.createElement("span");
      typeBadge.className = "badge-media-type";
      typeBadge.textContent = item.type;

      const formatBadge = document.createElement("span");
      formatBadge.className = "badge-media-format";
      formatBadge.textContent = item.format.toUpperCase();

      meta.appendChild(typeBadge);
      meta.appendChild(formatBadge);

      const actions = document.createElement("div");
      actions.className = "media-actions";

      const openBtn = document.createElement("a");
      openBtn.href = item.path;
      openBtn.target = "_blank";
      openBtn.rel = "noopener noreferrer";
      openBtn.className = "media-action-btn";
      openBtn.textContent = "Open";

      const downloadBtn = document.createElement("a");
      downloadBtn.href = item.path;
      downloadBtn.download = "";
      downloadBtn.className = "media-action-btn";
      downloadBtn.textContent = "Download";

      actions.appendChild(openBtn);
      actions.appendChild(downloadBtn);
      actions.appendChild(loopBtn);

      card.appendChild(title);
      card.appendChild(preview);
      card.appendChild(meta);
      card.appendChild(actions);
      grid.appendChild(card);
      return;
    } else if (item.type === "audio") {
      const audio = document.createElement("audio");
      audio.src = item.path;
      audio.controls = true;
      audio.preload = "metadata";

      // tie this audio to the avatar ring
      attachMediaPlaybackHooks(audio);

      const wrapper = document.createElement("div");
      wrapper.className = "media-player-wrapper";
      wrapper.appendChild(audio);
      preview.appendChild(wrapper);

      const volumeRow = createVolumeRow(audio);
      preview.appendChild(volumeRow);
    }

    if (item.type !== "video") {
      const meta = document.createElement("div");
      meta.className = "media-meta";

      const typeBadge = document.createElement("span");
      typeBadge.className = "badge-media-type";
      typeBadge.textContent = item.type;

      const formatBadge = document.createElement("span");
      formatBadge.className = "badge-media-format";
      formatBadge.textContent = item.format.toUpperCase();

      meta.appendChild(typeBadge);
      meta.appendChild(formatBadge);

      const actions = document.createElement("div");
      actions.className = "media-actions";

      if (item.type === "image") {
        const viewBtn = document.createElement("button");
        viewBtn.type = "button";
        viewBtn.className = "media-action-btn";
        viewBtn.textContent = "View";
        viewBtn.addEventListener("click", () => {
          openImageModal(item.path, item.title);
        });
        actions.appendChild(viewBtn);
      } else {
        const openBtn = document.createElement("a");
        openBtn.href = item.path;
        openBtn.target = "_blank";
        openBtn.rel = "noopener noreferrer";
        openBtn.className = "media-action-btn";
        openBtn.textContent = "Open";
        actions.appendChild(openBtn);
      }

      const downloadBtn = document.createElement("a");
      downloadBtn.href = item.path;
      downloadBtn.download = "";
      downloadBtn.className = "media-action-btn";
      downloadBtn.textContent = "Download";
      actions.appendChild(downloadBtn);

      card.appendChild(title);
      card.appendChild(preview);
      card.appendChild(meta);
      card.appendChild(actions);
      grid.appendChild(card);
    }
  });

  // After rendering, ensure avatar ring reflects any currently playing media
  updateAvatarPlayingFromMedia();
}

/* ---------- Image modal ---------- */

function setupImageModal() {
  const modal = document.getElementById("imageModal");
  if (!modal) return;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeImageModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeImageModal();
    }
  });
}

function openImageModal(src, captionText) {
  const modal = document.getElementById("imageModal");
  if (!modal) return;

  modal.innerHTML = "";

  const inner = document.createElement("div");
  inner.className = "image-modal-inner";

  const figure = document.createElement("figure");
  figure.className = "image-modal-figure";

  const img = document.createElement("img");
  img.className = "image-modal-img";
  img.src = src;
  img.alt = captionText || "";
  img.addEventListener("click", () => {
    closeImageModal();
  });

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
  openTabBtn.textContent = "Open in new tab";
  actions.appendChild(openTabBtn);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "image-modal-btn image-modal-close";
  closeBtn.textContent = "Close";
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

/* ---------- Footer ---------- */

function setupFooterCopyright() {
  const el = document.getElementById("footerCopyright");
  if (!el) return;
  const year = new Date().getFullYear();
  el.textContent = `${year}`;
}

/* ---------- Playground random button ---------- */

function setupPlaygroundRandomButton() {
  const btn = document.getElementById("randomSiteButton");
  if (!btn) return;

  // Make it visually identical to "Live site" buttons
  btn.classList.add("btn-card", "btn-card-live");

  btn.addEventListener("click", () => {
    if (!USELESS_WEB_URLS.length) return;
    const idx = Math.floor(Math.random() * USELESS_WEB_URLS.length);
    const url = USELESS_WEB_URLS[idx];
    window.open(url, "_blank", "noopener,noreferrer");
  });
}

/* ---------- Paint toolbar + shortcuts ---------- */

function setupPaintToolbar() {
  const paintCard = document.querySelector(".playground-paint");
  if (!paintCard) return;

  paintIframe = paintCard.querySelector("iframe[src*='paint.js.org']");
  const buttons = paintCard.querySelectorAll("[data-paint-action]");

  buttons.forEach((btn) => {
    const action = btn.getAttribute("data-paint-action");
    btn.addEventListener("click", () => {
      handlePaintAction(action);
    });
  });

  document.addEventListener("keydown", handlePaintShortcuts);
}

function handlePaintAction(action) {
  if (!paintIframe) return;

  switch (action) {
    case "new": {
      const ok = window.confirm(
        "Start a new canvas? This will clear the current drawing."
      );
      if (!ok) return;
      reloadPaintIframe();
      break;
    }
    case "clear": {
      reloadPaintIframe();
      break;
    }
    case "open": {
      window.open(paintIframe.src, "_blank", "noopener,noreferrer");
      break;
    }
    case "save": {
      // Best-effort: open full paint.js.org so the user can use its own save tools
      window.open(paintIframe.src, "_blank", "noopener,noreferrer");
      break;
    }
    case "undo": {
      // No real access to paint.js.org internals, so soft-reload as best-effort "undo"
      reloadPaintIframe();
      break;
    }
    default:
      break;
  }
}

function reloadPaintIframe() {
  if (!paintIframe) return;
  // simple reload of the iframe to clear canvas
  const src = paintIframe.src;
  paintIframe.src = src;
}

function handlePaintShortcuts(event) {
  if (state.activeTab !== "playground") return;

  const target = event.target;
  if (!target) return;

  const tag = (target.tagName || "").toLowerCase();
  const isTyping =
    tag === "input" ||
    tag === "textarea" ||
    target.isContentEditable;
  if (isTyping) return;

  const key = event.key.toLowerCase();
  const ctrl = event.ctrlKey || event.metaKey;
  const shift = event.shiftKey;

  if (!ctrl) return;

  if (key === "n" && !shift) {
    event.preventDefault();
    handlePaintAction("new");
  } else if (key === "n" && shift) {
    event.preventDefault();
    handlePaintAction("clear");
  } else if (key === "o") {
    event.preventDefault();
    handlePaintAction("open");
  } else if (key === "s") {
    event.preventDefault();
    handlePaintAction("save");
  } else if (key === "z") {
    event.preventDefault();
    handlePaintAction("undo");
  }
}

/* ---------- Postboard (Playground) ---------- */

function setupPostboard() {
  const form = document.getElementById("postboardForm");
  const listEl = document.getElementById("postboardList");
  const emptyEl = document.getElementById("postboardEmpty");
  if (!form || !listEl || !emptyEl) return;

  let messages = loadPostboardMessages();
  renderPostboard(messages, listEl, emptyEl);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameInput = document.getElementById("postboardName");
    const anonInput = document.getElementById("postboardAnon");
    const messageInput = document.getElementById("postboardMessage");

    if (!messageInput) return;

    const rawMessage = messageInput.value.trim();
    if (!rawMessage) return;

    const isAnon = anonInput && anonInput.checked;
    const rawName = nameInput ? nameInput.value.trim() : "";
    const name = isAnon || !rawName ? "Anonymous" : rawName;

    const entry = {
      id: Date.now(),
      name,
      message: rawMessage,
      anonymous: isAnon,
      createdAt: new Date().toISOString()
    };

    messages.unshift(entry);
    savePostboardMessages(messages);
    renderPostboard(messages, listEl, emptyEl);

    messageInput.value = "";
    if (nameInput && isAnon) {
      nameInput.value = "";
    }
  });
}

function loadPostboardMessages() {
  try {
    const raw = localStorage.getItem(POSTBOARD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (_) {
    return [];
  }
}

function savePostboardMessages(messages) {
  try {
    localStorage.setItem(POSTBOARD_STORAGE_KEY, JSON.stringify(messages));
  } catch (_) {}
}

function renderPostboard(messages, listEl, emptyEl) {
  listEl.innerHTML = "";
  if (!messages.length) {
    emptyEl.style.display = "block";
    return;
  }
  emptyEl.style.display = "none";

  messages.forEach((msg) => {
    const li = document.createElement("li");
    li.className = "postboard-item";

    const header = document.createElement("div");
    header.className = "postboard-item-header";

    const author = document.createElement("span");
    author.className = "postboard-item-author";
    author.textContent = msg.name || "Anonymous";

    const meta = document.createElement("span");
    meta.className = "postboard-item-meta";

    let dateLabel = "";
    if (msg.createdAt) {
      const d = new Date(msg.createdAt);
      if (!isNaN(d.getTime())) {
        dateLabel = d.toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "short"
        });
      }
    }
    meta.textContent = dateLabel;

    header.appendChild(author);
    header.appendChild(meta);

    const body = document.createElement("div");
    body.className = "postboard-item-body";
    body.textContent = msg.message;

    li.appendChild(header);
    li.appendChild(body);

    listEl.appendChild(li);
  });
}

/* ---------- END ---------- */
