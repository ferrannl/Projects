
/* js/i18n.js */
(() => {
  "use strict";

  /* ---------- Config ---------- */
  const SUPPORTED_LANGS = ["nl", "en", "de", "es"];
  const DEFAULT_LANG = "nl";
  const LANG_STORAGE_KEY = "ferranProjectsLang";
  const LANG_GATE_SEEN_KEY = "ferranProjectsLangSeenGate";

  /* ---------- Dictionary (keep your full dict here) ---------- */
  const I18N = window.I18N || {}; // if you paste dict into this file, replace this line
  // If you already pasted I18N in this file, delete the line above and keep:
  // const I18N = { ... };

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
    const url = new URL(window.location.href);
    const qLang = (url.searchParams.get("lang") || "").toLowerCase();
    if (SUPPORTED_LANGS.includes(qLang)) return qLang;

    const saved = (localStorage.getItem(LANG_STORAGE_KEY) || "").toLowerCase();
    if (SUPPORTED_LANGS.includes(saved)) return saved;

    const nav = (navigator.language || "").slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGS.includes(nav)) return nav;

    return DEFAULT_LANG;
  }

  let currentLang = pickLang();

  function getDict(lang = currentLang) {
    return I18N[lang] || I18N[DEFAULT_LANG] || {};
  }

  function apply(root = document) {
    const dict = getDict();

    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = deepGet(dict, key) ?? dict[key];
      if (typeof value === "string") el.textContent = value;
    });

    root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const value = deepGet(dict, key) ?? dict[key];
      if (typeof value === "string") el.setAttribute("placeholder", value);
    });

    root.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      const value = deepGet(dict, key) ?? dict[key];
      if (typeof value === "string") el.setAttribute("title", value);
    });

    root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      const value = deepGet(dict, key) ?? dict[key];
      if (typeof value === "string") el.setAttribute("aria-label", value);
    });

    // special footer hook: <span data-i18n-footer-built></span>
    root.querySelectorAll("[data-i18n-footer-built]").forEach((el) => {
      const built = dict.footerBuilt || "";
      if (built) el.textContent = built;
    });

    document.documentElement.lang = currentLang;
  }

  function setLang(lang) {
    const l = String(lang || "").toLowerCase();
    if (!SUPPORTED_LANGS.includes(l)) return;

    currentLang = l;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, l);
    } catch (_) {}

    document.documentElement.lang = l;
    apply(document);

    // let main.js (or anything else) react if it wants
    window.dispatchEvent(new CustomEvent("i18n:changed", { detail: { lang: l } }));
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

  function setupLanguageGate() {
    const gate = document.getElementById("langGate");
    if (!gate) return;

    // If already seen -> hide it
    if (gateSeen()) gate.hidden = true;

    // Clicking a language button
    gate.addEventListener("click", (event) => {
      const btn = event.target.closest(".btn-lang");
      if (!btn) return;

      const lang = (btn.dataset.lang || "").toLowerCase();
      if (!SUPPORTED_LANGS.includes(lang)) return;

      setLang(lang);
      markGateSeen();
      gate.hidden = true;
    });

    // Header language button opens gate again
    const openBtn = document.getElementById("headerLangButton");
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        gate.hidden = false;

        // set active class on current language
        gate.querySelectorAll(".btn-lang").forEach((b) => {
          b.classList.toggle(
            "active",
            (b.dataset.lang || "").toLowerCase() === currentLang
          );
        });
      });
    }

    // Esc closes gate (doesn't mark seen)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !gate.hidden) gate.hidden = true;
    });

    // initial highlight
    gate.querySelectorAll(".btn-lang").forEach((b) => {
      b.classList.toggle(
        "active",
        (b.dataset.lang || "").toLowerCase() === currentLang
      );
    });
  }

  /* ---------- Expose ---------- */
  window.i18n = {
    SUPPORTED_LANGS,
    DEFAULT_LANG,
    getLang: () => currentLang,
    setLang,
    apply,
    gateSeen,
    markGateSeen
  };

  // Apply ASAP, then wire gate on DOM ready
  apply(document);

  document.addEventListener("DOMContentLoaded", () => {
    setupLanguageGate();
    apply(document);
  });
})();
