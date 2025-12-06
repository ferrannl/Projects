/* ---------- Language / i18n + live age ---------- */

const SUPPORTED_LANGS = ["nl", "en", "de", "pl", "tr", "es"];
const DEFAULT_LANG = "nl";
const LANG_STORAGE_KEY = "ferranProjectsLang";
const LANG_GATE_SEEN_KEY = "ferranProjectsLangSeenGate";

const LANGUAGE_NAMES = {
  nl: "Nederlands",
  en: "English",
  de: "Deutsch",
  pl: "Polski",
  tr: "Türkçe",
  es: "Español"
};

// Birthday: 15-08-1999 23:10 local (browser runs in user's tz – Amsterdam for you)
const BIRTH_DATE = new Date(1999, 7, 15, 23, 10); // months are 0-based: 7 = August

let currentLang = DEFAULT_LANG;

const TRANSLATIONS = {
  en: {
    subtitle:
      "All my programming & coding projects in one place – websites, apps, school work, guides, APIs and more.",
    aboutTitle: "About Me",
    aboutP1:
      "Hey 👋🏻 Ferran ({age}) here. I am a Dutch developer from Utrecht / 's-Hertogenbosch. I like building websites, apps and small tools to help myself and others.",
    aboutP2: "",
    filterTypeLabel: "Type",
    typeAll: "All",
    typeWebsite: "Websites",
    typeMobile: "Mobile",
    typeApi: "APIs / Backend",
    typeSchool: "School / Study",
    typeOther: "Other",
    filterLanguageLabel: "Language",
    emptyState: "No projects match your search/filter. Try another search term.",
    footerBuiltWith: "Built with ♥ by Ferran",
    footerViewOnPages: "View this site on GitHub Pages"
  },
  nl: {
    subtitle:
      "Al mijn programmeer- en codeprojecten op één plek – websites, apps, schoolopdrachten, guides, API’s en meer.",
    aboutTitle: "Over mij",
    aboutP1:
      "Hey 👋🏻 Ferran ({age}) hier. Ik ben een Nederlandse developer uit Utrecht / ’s-Hertogenbosch. Ik bouw graag websites, apps en kleine tools om mezelf en anderen te helpen.",
    aboutP2: "",
    filterTypeLabel: "Type",
    typeAll: "Alles",
    typeWebsite: "Websites",
    typeMobile: "Mobiel",
    typeApi: "API’s / Backend",
    typeSchool: "School / Studie",
    typeOther: "Overig",
    filterLanguageLabel: "Taal",
    emptyState: "Geen projecten gevonden met deze zoekopdracht of filters. Probeer iets anders.",
    footerBuiltWith: "Gemaakt met ♥ door Ferran",
    footerViewOnPages: "Bekijk deze site op GitHub Pages"
  },
  de: {
    subtitle:
      "Alle meine Programmier- und Coding-Projekte an einem Ort – Websites, Apps, Studienprojekte, Guides, APIs und mehr.",
    aboutTitle: "Über mich",
    aboutP1:
      "Hey 👋🏻 hier ist Ferran ({age}). Ich bin ein niederländischer Entwickler aus Utrecht / ’s-Hertogenbosch und baue gerne Websites, Apps und kleine Tools, die mir und anderen helfen.",
    aboutP2: "",
    filterTypeLabel: "Typ",
    typeAll: "Alle",
    typeWebsite: "Websites",
    typeMobile: "Mobile",
    typeApi: "APIs / Backend",
    typeSchool: "Schule / Studium",
    typeOther: "Sonstiges",
    filterLanguageLabel: "Sprache",
    emptyState: "Keine Projekte für diese Suche oder Filter. Bitte etwas anderes versuchen.",
    footerBuiltWith: "Mit ♥ erstellt von Ferran",
    footerViewOnPages: "Diese Seite auf GitHub Pages ansehen"
  },
  pl: {
    subtitle:
      "Wszystkie moje projekty programistyczne w jednym miejscu – strony WWW, aplikacje, zadania ze szkoły, poradniki, API i więcej.",
    aboutTitle: "O mnie",
    aboutP1:
      "Cześć 👋🏻 tu Ferran ({age}). Jestem holenderskim deweloperem z Utrechtu / ’s-Hertogenbosch. Lubię tworzyć strony, aplikacje i małe narzędzia, które pomagają mnie i innym.",
    aboutP2: "",
    filterTypeLabel: "Typ",
    typeAll: "Wszystko",
    typeWebsite: "Strony WWW",
    typeMobile: "Mobilne",
    typeApi: "API / Backend",
    typeSchool: "Szkoła / Studia",
    typeOther: "Inne",
    filterLanguageLabel: "Język",
    emptyState: "Brak projektów dla tych filtrów. Spróbuj innego wyszukiwania.",
    footerBuiltWith: "Stworzone z ♥ przez Ferrana",
    footerViewOnPages: "Zobacz tę stronę na GitHub Pages"
  },
  tr: {
    subtitle:
      "Tüm programlama projelerim tek bir yerde – web siteleri, uygulamalar, okul projeleri, rehberler, API’ler ve daha fazlası.",
    aboutTitle: "Hakkımda",
    aboutP1:
      "Selam 👋🏻 ben Ferran ({age}). Utrecht / ’s-Hertogenbosch’ta yaşayan Hollandalı bir geliştiriciyim. Kendime ve başkalarına yardımcı olan web siteleri, uygulamalar ve küçük araçlar geliştirmeyi seviyorum.",
    aboutP2: "",
    filterTypeLabel: "Tür",
    typeAll: "Tümü",
    typeWebsite: "Web siteleri",
    typeMobile: "Mobil",
    typeApi: "API / Backend",
    typeSchool: "Okul / Eğitim",
    typeOther: "Diğer",
    filterLanguageLabel: "Dil",
    emptyState: "Bu arama / filtre ile eşleşen proje yok. Başka bir şey dene.",
    footerBuiltWith: "♥ ile geliştirildi – Ferran",
    footerViewOnPages: "Bu siteyi GitHub Pages üzerinde görüntüle"
  },
  es: {
    subtitle:
      "Todos mis proyectos de programación en un solo lugar: webs, apps, trabajos de estudio, guías, APIs y más.",
    aboutTitle: "Sobre mí",
    aboutP1:
      "Hola 👋🏻 soy Ferran ({age}). Desarrollador holandés de Utrecht / ’s-Hertogenbosch. Me gusta crear webs, apps y pequeñas herramientas que ayudan a mí y a otras personas.",
    aboutP2: "",
    filterTypeLabel: "Tipo",
    typeAll: "Todo",
    typeWebsite: "Webs",
    typeMobile: "Móvil",
    typeApi: "APIs / Backend",
    typeSchool: "Escuela / Estudio",
    typeOther: "Otros",
    filterLanguageLabel: "Idioma",
    emptyState: "No hay proyectos para esta búsqueda o filtros. Prueba con otros términos.",
    footerBuiltWith: "Hecho con ♥ por Ferran",
    footerViewOnPages: "Ver este sitio en GitHub Pages"
  }
};

function getAgeParts(now = new Date()) {
  let y = now.getFullYear() - BIRTH_DATE.getFullYear();
  let m = now.getMonth() - BIRTH_DATE.getMonth();
  let d = now.getDate() - BIRTH_DATE.getDate();
  let h = now.getHours() - BIRTH_DATE.getHours();
  let min = now.getMinutes() - BIRTH_DATE.getMinutes();

  if (min < 0) {
    min += 60;
    h -= 1;
  }
  if (h < 0) {
    h += 24;
    d -= 1;
  }
  if (d < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0); // day 0 = last day prev month
    d += prevMonth.getDate();
    m -= 1;
  }
  if (m < 0) {
    m += 12;
    y -= 1;
  }

  return { y, m, d, h, min };
}

function formatAge(parts) {
  const { y, m, d, h, min } = parts;
  return `${y}y ${m}m ${d}d ${h}h ${min}m`;
}

function updateAgeInAbout() {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS[DEFAULT_LANG];
  const tmpl = dict.aboutP1;
  if (!tmpl) return;

  const ageStr = formatAge(getAgeParts());
  const text = tmpl.replace("{age}", ageStr);

  document.querySelectorAll('[data-i18n="aboutP1"]').forEach((el) => {
    el.textContent = text;
  });
}

function applyTranslations(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key || key === "aboutP1") return; // aboutP1 handled separately for live age
    const value = dict[key];
    if (typeof value === "string") {
      el.textContent = value;
    }
  });

  currentLang = lang;
  updateAgeInAbout();
}

function updateLangLabel(lang) {
  const labelEl = document.getElementById("uiLangLabel");
  if (!labelEl) return;
  const name = LANGUAGE_NAMES[lang] || LANGUAGE_NAMES[DEFAULT_LANG];
  labelEl.textContent = name;
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  updateLangLabel(lang);
  applyTranslations(lang);
}

function setupLanguageUI() {
  const langGateEl = document.getElementById("langGate");
  const gateButtons = document.querySelectorAll(".btn-lang[data-lang]");
  const uiLangButton = document.getElementById("uiLangButton");

  let saved = localStorage.getItem(LANG_STORAGE_KEY);
  if (!saved || !SUPPORTED_LANGS.includes(saved)) {
    saved = DEFAULT_LANG;
  }
  setLanguage(saved);

  const hasSeenGate = localStorage.getItem(LANG_GATE_SEEN_KEY) === "1";
  if (!hasSeenGate && langGateEl) {
    langGateEl.hidden = false;
  } else if (langGateEl) {
    langGateEl.hidden = true;
  }

  gateButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
      if (langGateEl) langGateEl.hidden = true;
      localStorage.setItem(LANG_GATE_SEEN_KEY, "1");
    });
  });

  if (uiLangButton && langGateEl) {
    uiLangButton.addEventListener("click", () => {
      langGateEl.hidden = false;
    });
  }

  if (langGateEl) {
    langGateEl.addEventListener("click", (e) => {
      if (e.target === langGateEl) {
        langGateEl.hidden = true;
      }
    });
  }

  // keep age ticking (update every minute)
  setInterval(updateAgeInAbout, 60_000);
}

setupLanguageUI();

/* ---------- rest of your script.js (projects, filters, thumbnails, etc.) ---------- */
