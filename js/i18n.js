/* js/i18n.js
   =========================================================
   Ferran’s Projects – i18n + Language Gate (FULL FILE)
   ✅ Contains:
     - I18N dictionary (nl/en/de/es)
     - translate engine (data-i18n, data-i18n-placeholder, data-i18n-title)
     - language persistence (localStorage)
     - language gate open/close
     - header 🌐 button toggles gate
     - safe helpers: window.i18n.t(), window.i18n.setLang(), window.i18n.getLang()
   ❗ IMPORTANT:
     - DO NOT put any "loadProjects / setupTabs / init" code here.
     - main.js handles app init. This file ONLY handles translations + gate.
   =========================================================
*/

/* ---------- Dictionary ---------- */

const I18N = {
  nl: {
    gateTitle: "Kies je taal",
    gateHint: "Je kunt dit later wijzigen via de taalknop bovenaan.",
    gateNlSub: "Moedertaal",
    gateEnSub: "Internationaal",
    gateDeSub: "Voor mijn buren",
    gateEsSub: "Voor vrienden uit Spanje en de Canarische Eilanden",

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

    btnGitHub: "View code",
    btnLiveSite: "Open live website",
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

    btnGitHub: "Code ansehen",
    btnLiveSite: "Live-Website öffnen",
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

    btnGitHub: "Ver código",
    btnLiveSite: "Abrir sitio en vivo",
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

/* ---------- Engine + Gate ---------- */

(() => {
  const LS_KEY = "ferranLangV1";
  const FALLBACK_LANG = "nl";

  let currentLang = FALLBACK_LANG;

  const clampLang = (lang) => {
    const l = String(lang || "").toLowerCase().trim();
    return I18N[l] ? l : FALLBACK_LANG;
  };

  const t = (key, fallback = "") => {
    const dict = I18N[currentLang] || I18N[FALLBACK_LANG] || {};
    const alt = I18N[FALLBACK_LANG] || {};
    const v = dict[key] ?? alt[key];
    return (v === undefined || v === null) ? fallback : String(v);
  };

  function applyTranslations() {
    // textContent
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(key, el.textContent || "");
    });

    // placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (!key) return;
      el.setAttribute("placeholder", t(key, el.getAttribute("placeholder") || ""));
    });

    // titles/tooltips
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (!key) return;
      el.setAttribute("title", t(key, el.getAttribute("title") || ""));
    });

    // footer special hook (your HTML uses data-i18n-footer-built, not data-i18n)
    const footerBuilt = document.querySelector("[data-i18n-footer-built]");
    if (footerBuilt) footerBuilt.textContent = t("footerBuilt", footerBuilt.textContent || "");

    // html lang attr
    document.documentElement.lang = currentLang;

    // let main.js (or others) react
    document.dispatchEvent(new CustomEvent("i18n:changed", { detail: { lang: currentLang } }));
  }

  function setLang(lang) {
    currentLang = clampLang(lang);
    try { localStorage.setItem(LS_KEY, currentLang); } catch (_) {}
    applyTranslations();
    updateGateActiveButton();
  }

  function getLang() {
    return currentLang;
  }

  function loadSavedLang() {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) return clampLang(saved);
    } catch (_) {}
    return FALLBACK_LANG;
  }

  // --- Gate UI ---
  function gateEls() {
    return {
      gate: document.getElementById("langGate"),
      headerBtn: document.getElementById("headerLangButton"),
      langButtons: Array.from(document.querySelectorAll(".btn-lang[data-lang]"))
    };
  }

  function updateGateActiveButton() {
    const { langButtons } = gateEls();
    langButtons.forEach((btn) => {
      const l = clampLang(btn.getAttribute("data-lang"));
      btn.classList.toggle("active", l === currentLang);
    });
  }

  function openGate() {
    const { gate } = gateEls();
    if (!gate) return;
    gate.hidden = false;
    gate.setAttribute("aria-hidden", "false");
  }

  function closeGate() {
    const { gate } = gateEls();
    if (!gate) return;
    gate.hidden = true;
    gate.setAttribute("aria-hidden", "true");
  }

  function setupGateHandlers() {
    const { gate, headerBtn, langButtons } = gateEls();

    // If gate exists, default is "open" (your HTML shows it).
    // We'll close it automatically only if a language was already saved.
    const hadSaved = (() => {
      try { return !!localStorage.getItem(LS_KEY); } catch (_) { return false; }
    })();

    if (gate && hadSaved) closeGate();
    if (gate && !hadSaved) openGate();

    // choose language buttons
    langButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const l = btn.getAttribute("data-lang");
        setLang(l);
        closeGate();
      });
    });

    // click outside card closes
    if (gate) {
      gate.addEventListener("click", (e) => {
        if (e.target === gate) closeGate();
      });
    }

    // header 🌐 opens gate
    if (headerBtn) {
      headerBtn.addEventListener("click", () => {
        // toggle
        const isHidden = !!gate?.hidden;
        if (isHidden) openGate();
        else closeGate();
      });
    }

    // ESC closes gate
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeGate();
    });
  }

  // expose minimal API for main.js
  window.i18n = {
    t,
    setLang,
    getLang
  };

  // init
  document.addEventListener("DOMContentLoaded", () => {
    currentLang = loadSavedLang();
    applyTranslations();
    setupGateHandlers();
    updateGateActiveButton();
  });
})();
