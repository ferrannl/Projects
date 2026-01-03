/* js/i18n.js
   Drop-in i18n for your site.
   - Put this file at: /js/i18n.js
   - Load it BEFORE main.js in index.html:
       <script src="js/i18n.js"></script>
       <script src="js/main.js"></script>

   How to use in HTML:
   - Any element with data-i18n="some.key" will get its textContent replaced.
     Example: <h2 data-i18n="aboutTitle">About me</h2>

   - Placeholders:
     <input id="search" data-i18n-placeholder="search.projects" placeholder="Search...">

   - Titles / aria-label:
     <button data-i18n-title="mediaLoopTitle" title="Toggle loop">...</button>
     <button data-i18n-aria="modalClose" aria-label="Close">...</button>

   In JS (main.js), you can do:
     const dict = window.i18n.getDict();
     window.i18n.t("btnLiveSite"); // returns string
     window.i18n.setLang("de"); // updates + re-applies
*/

(() => {
  "use strict";

  /* ---------- Config ---------- */
  const SUPPORTED_LANGS = ["nl", "en", "de", "es"];
  const DEFAULT_LANG = "nl";
  const LANG_STORAGE_KEY = "ferranProjectsLang";
  const LANG_GATE_SEEN_KEY = "ferranProjectsLangSeenGate";

  /* ---------- Dictionary ---------- */
  // Edit/extend freely. Keep keys stable.
  const I18N = {
    nl: {
      // Gate
      gateTitle: "Kies je taal",
      gateHint: "Je kunt dit later wijzigen via de taalknop bovenaan.",
      gateNlSub: "Moedertaal",
      gateEnSub: "Internationaal",
      gateDeSub: "Voor mijn buren",
      gateEsSub: "Voor vrienden uit Spanje en de Canarische Eilanden",

      // Header/subtitle/about
      subtitle: "Op deze website vind je een selectie van mijn projecten op één plek.",
      aboutTitle: "Over mij",
      aboutP1:
        "Hey 👋🏻 Ferran hier. Ik ben een Nederlandse 🇳🇱 developer uit Utrecht / ’s-Hertogenbosch. Ik bouw graag websites, apps en kleine tools om mezelf en anderen te helpen.",
      aboutP2: "",

      // Tabs
      tabProjects: "Projecten",
      tabMedia: "Media",
      tabPlayground: "Playground",

      // Search label
      searchLabel: "Zoeken",

      // Filters
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

      // Empty states
      emptyState: "Geen projecten gevonden met deze zoekopdracht of filters. Probeer iets anders.",
      mediaEmptyState: "Geen media gevonden met deze zoekopdracht of filters.",

      // Header lang button
      headerLangButton: "Taal",

      // Footer
      footerBuilt: "Gemaakt met ♥ door Ferran",

      // Buttons
      btnGitHub: "Bekijk code",
      btnLiveSite: "Bekijk live website",
      btnDownload: "Download",

      // Playground
      playgroundPaintTitle: "MS Paint Playground",
      playgroundPaintText: "MS Paint-remake, veel tekenplezier!",
      playgroundRandomTitle: "Random website-knop",
      playgroundRandomText:
        "Nieuwsgierig of verveeld? Klik op de knop en er opent een willekeurige, rare website in een nieuw tabblad.",
      randomButtonLabel: "Neem me mee naar een willekeurige website",

      // Paint
      paintClearButton: "Wissen",
      paintClearShortcutHint: "(Ctrl+Shift+N)",
      confirmClearPaint: "Canvas wissen? Dit reset de Paint-app.",

      // Modal
      modalOpenNewTab: "Openen in nieuw tabblad",
      modalClose: "Sluiten",

      // Media actions
      mediaOpen: "Openen",
      mediaDownload: "Download",
      mediaView: "Bekijken",
      mediaVolume: "Volume",
      mediaLoop: "🔁 Loop",
      mediaLoopTitle: "Loop aan/uit",

      // Search placeholders per tab
      search: {
        projects: "Zoek in projecten op naam, beschrijving, programmeertaal of tags…",
        media: "Zoek in media op titel of bestandsnaam…",
        playground: "Zoek in Playground-tools op naam of beschrijving…"
      }
    },

    en: {
      gateTitle: "Choose your language",
      gateHint: "You can change it later with the language button at the top.",
      gateNlSub: "Native",
      gateEnSub: "International",
      gateDeSub: "For my neighbors",
      gateEsSub: "For friends from Spain & the Canary Islands",

      subtitle: "On this website you can find a selection of my projects in one place.",
      aboutTitle: "About me",
      aboutP1:
        "Hey 👋🏻 Ferran here. I’m a Dutch 🇳🇱 developer from Utrecht / ’s-Hertogenbosch. I like building websites, apps and small tools to help myself and others.",
      aboutP2: "",

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

      btnGitHub: "View code",
      btnLiveSite: "Open live website",
      btnDownload: "Download",

      playgroundPaintTitle: "MS Paint Playground",
      playgroundPaintText: "MS Paint remake, have fun drawing!",
      playgroundRandomTitle: "Random Website Button",
      playgroundRandomText:
        "Feeling curious or bored? Hit the button and let it launch a random weird website in a new tab.",
      randomButtonLabel: "Take me to a random website",

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
      mediaLoopTitle: "Toggle loop",

      search: {
        projects: "Search projects by name, description, language or tags…",
        media: "Search media by title or filename…",
        playground: "Search playground tools by name or description…"
      }
    },

    de: {
      gateTitle: "Wähle deine Sprache",
      gateHint: "Du kannst sie später oben über die Sprach-Schaltfläche ändern.",
      gateNlSub: "Muttersprache",
      gateEnSub: "International",
      gateDeSub: "Für meine Nachbarn",
      gateEsSub: "Für Freunde aus Spanien & den Kanaren",

      subtitle: "Auf dieser Website findest du eine Auswahl meiner Projekte an einem Ort.",
      aboutTitle: "Über mich",
      aboutP1:
        "Hey 👋🏻 hier ist Ferran. Ich bin ein niederländischer 🇳🇱 Entwickler aus Utrecht / ’s-Hertogenbosch und baue gern Websites, Apps und kleine Tools, um mir und anderen zu helfen.",
      aboutP2: "",

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

      btnGitHub: "Code ansehen",
      btnLiveSite: "Live-Website öffnen",
      btnDownload: "Download",

      playgroundPaintTitle: "MS-Paint-Playground",
      playgroundPaintText: "MS-Paint-Remake, viel Spaß beim Zeichnen!",
      playgroundRandomTitle: "Zufällige-Website-Button",
      playgroundRandomText:
        "Neugierig oder gelangweilt? Klick auf den Button und es öffnet sich eine zufällige, verrückte Website in einem neuen Tab.",
      randomButtonLabel: "Bring mich zu einer zufälligen Website",

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
      mediaLoopTitle: "Loop umschalten",

      search: {
        projects: "Suche in Projekten nach Name, Beschreibung, Sprache oder Tags…",
        media: "Suche in Medien nach Titel oder Dateiname…",
        playground: "Suche in Playground-Tools nach Name oder Beschreibung…"
      }
    },

    es: {
      gateTitle: "Elige tu idioma",
      gateHint: "Puedes cambiarlo después con el botón de idioma arriba.",
      gateNlSub: "Idioma nativo",
      gateEnSub: "Internacional",
      gateDeSub: "Para mis vecinos",
      gateEsSub: "Para amigos de España y Canarias",

      subtitle: "En esta web encontrarás una selección de mis proyectos en un solo lugar.",
      aboutTitle: "Sobre mí",
      aboutP1:
        "Hola 👋🏻 soy Ferran. Soy un desarrollador 🇳🇱 de Utrecht / ’s-Hertogenbosch. Me gusta crear webs, apps y pequeñas herramientas para ayudarme a mí y a otras personas.",
      aboutP2: "",

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

      btnGitHub: "Ver código",
      btnLiveSite: "Abrir sitio en vivo",
      btnDownload: "Descargar",

      playgroundPaintTitle: "Playground de MS Paint",
      playgroundPaintText: "Remake de MS Paint, ¡diviértete dibujando!",
      playgroundRandomTitle: "Botón de web aleatoria",
      playgroundRandomText:
        "¿Curioso o aburrido? Pulsa el botón y se abrirá una web rara al azar en una nueva pestaña.",
      randomButtonLabel: "Llévame a una web aleatoria",

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
      mediaLoopTitle: "Alternar loop",

      search: {
        projects: "Busca proyectos por nombre, descripción, lenguaje o etiquetas…",
        media: "Busca en media por título o nombre de archivo…",
        playground: "Busca herramientas del Playground por nombre o descripción…"
      }
    }
  };

  /* ---------- Helpers ---------- */
  const isObj = (v) => v && typeof v === "object";

  function deepGet(obj, path) {
    if (!isObj(obj) || !path) return undefined;
    const parts = String(path).split(".");
    let cur = obj;
    for (const p of parts) {
      if (!isObj(cur) || !(p in cur)) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  function pickLang() {
    // 1) URL ?lang=
    const url = new URL(window.location.href);
    const qLang = (url.searchParams.get("lang") || "").toLowerCase();
    if (SUPPORTED_LANGS.includes(qLang)) return qLang;

    // 2) localStorage
    const saved = (localStorage.getItem(LANG_STORAGE_KEY) || "").toLowerCase();
    if (SUPPORTED_LANGS.includes(saved)) return saved;

    // 3) browser preference
    const nav = (navigator.language || "").slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGS.includes(nav)) return nav;

    return DEFAULT_LANG;
  }

  function setHtmlLang(lang) {
    document.documentElement.lang = lang;
  }

  /* ---------- Core i18n API ---------- */
  let currentLang = pickLang();

  function getDict(lang = currentLang) {
    return I18N[lang] || I18N[DEFAULT_LANG] || {};
  }

  function t(key, fallback = "") {
    const dict = getDict();
    const v = deepGet(dict, key);
    if (typeof v === "string") return v;

    // allow direct top-level keys (t("btnGitHub"))
    const v2 = dict[key];
    if (typeof v2 === "string") return v2;

    return fallback || "";
  }

  function apply(root = document) {
    const dict = getDict();

    // data-i18n -> textContent
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = deepGet(dict, key) ?? dict[key];
      if (typeof value === "string") el.textContent = value;
    });

    // placeholder
    root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const value = deepGet(dict, key) ?? dict[key];
      if (typeof value === "string") el.setAttribute("placeholder", value);
    });

    // title
    root.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      const value = deepGet(dict, key) ?? dict[key];
      if (typeof value === "string") el.setAttribute("title", value);
    });

    // aria-label
    root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      const value = deepGet(dict, key) ?? dict[key];
      if (typeof value === "string") el.setAttribute("aria-label", value);
    });

    setHtmlLang(currentLang);
  }

  function setLang(lang) {
    const l = String(lang || "").toLowerCase();
    if (!SUPPORTED_LANGS.includes(l)) return;

    currentLang = l;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, l);
    } catch (_) {}

    setHtmlLang(l);
    apply(document);

    // Let main.js know it can re-render without i18n hard dependency
    window.dispatchEvent(new CustomEvent("i18n:changed", { detail: { lang: l } }));
  }

  function getLang() {
    return currentLang;
  }

  function markGateSeen() {
    try {
      localStorage.setItem(LANG_GATE_SEEN_KEY, "1");
    } catch (_) {}
  }

  function gateSeen() {
    try {
      return localStorage.getItem(LANG_GATE_SEEN_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  /* ---------- Expose ---------- */
  window.I18N = I18N; // if you want to edit from console
  window.i18n = {
    SUPPORTED_LANGS,
    DEFAULT_LANG,
    LANG_STORAGE_KEY,
    LANG_GATE_SEEN_KEY,

    getLang,
    setLang,
    getDict,
    t,
    apply,

    gateSeen,
    markGateSeen
  };

  // Initial apply ASAP (safe even before DOMContentLoaded; will apply again later)
  // If DOM isn't ready, querySelectorAll just returns empty arrays.
  apply(document);
})();
