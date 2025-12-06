import { setupLanguageUI, getCurrentLang, TRANSLATIONS, DEFAULT_LANG } from "./common.js";
import { initProjects, setProjectSearch, refreshProjectsView } from "./projects.js";
import { initMediaWall, setMediaSearch, refreshMediaView } from "./media-wall.js";

let currentView = "projects";

function updateSearchPlaceholder() {
  const searchEl = document.getElementById("search");
  if (!searchEl) return;

  const lang = getCurrentLang();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];

  const key = currentView === "media"
    ? "searchMediaPlaceholder"
    : "searchProjectsPlaceholder";

  if (dict[key]) {
    searchEl.placeholder = dict[key];
  }
}

function setView(view) {
  currentView = view === "media" ? "media" : "projects";

  const projectsViewEl = document.getElementById("projectsView");
  const mediaViewEl = document.getElementById("mediaView");
  const projectFiltersEl = document.getElementById("projectFilters");
  const mediaFiltersEl = document.getElementById("mediaFilters");
  const viewTabs = document.querySelectorAll(".view-tab");

  viewTabs.forEach(tab => {
    const tabView = tab.getAttribute("data-view");
    if (tabView === currentView) {
      tab.classList.add("view-tab-active");
    } else {
      tab.classList.remove("view-tab-active");
    }
  });

  if (projectsViewEl) projectsViewEl.hidden = currentView !== "projects";
  if (mediaViewEl) mediaViewEl.hidden = currentView !== "media";
  if (projectFiltersEl) projectFiltersEl.hidden = currentView !== "projects";
  if (mediaFiltersEl) mediaFiltersEl.hidden = currentView !== "media";

  updateSearchPlaceholder();

  if (currentView === "projects") {
    refreshProjectsView();
  } else {
    refreshMediaView();
  }
}

function initViewSwitch() {
  const viewTabs = document.querySelectorAll(".view-tab");
  viewTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const view = tab.getAttribute("data-view") || "projects";
      setView(view);
    });
  });
}

function initSearchRouting() {
  const searchEl = document.getElementById("search");
  if (!searchEl) return;

  searchEl.addEventListener("input", () => {
    const q = searchEl.value || "";
    if (currentView === "projects") {
      setProjectSearch(q);
    } else {
      setMediaSearch(q);
    }
  });
}

function initLanguageEvents() {
  document.addEventListener("ferran:language-changed", () => {
    updateSearchPlaceholder();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing Ferran Projects + Media Wall (modules)…");
  setupLanguageUI();
  initProjects();
  initMediaWall();
  initViewSwitch();
  initSearchRouting();
  initLanguageEvents();
  setView("projects");
});
