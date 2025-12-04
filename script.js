console.log("[Projects] script.js loaded");

// All your GitHub repos (from https://github.com/ferrannl?tab=repositories)
const projects = [
  {
    name: "Projects",
    repo: "Projects",
    description: "All my repositories centralized.",
    language: "HTML",
    type: "website",
    tags: ["portfolio", "overview"],
    pages: true
  },
  {
    name: "Cafeteria-Churreria-San-Pedro",
    repo: "Cafeteria-Churreria-San-Pedro",
    description: "Informational website for Cafetería Churrería San Pedro in Tenerife.",
    language: "HTML",
    type: "website",
    tags: ["client", "restaurant"],
    pages: true
  },
  {
    name: "elegant-barbershop",
    repo: "elegant-barbershop",
    description: "Website suggestion for Elegant Barbershop in ’s-Hertogenbosch.",
    language: "Less",
    type: "website",
    tags: ["client", "barbershop"],
    pages: true
  },
  {
    name: "CodePen",
    repo: "CodePen",
    description: "Collection of CodePen experiments and snippets.",
    language: "JavaScript",
    type: "website",
    tags: ["experiments", "frontend"],
    pages: true
  },
  {
    name: "pso-wiiu-guide",
    repo: "pso-wiiu-guide",
    description: "HTML guide / documentation related to Phantasy Star Online on Wii U.",
    language: "HTML",
    type: "website",
    tags: ["guide", "gaming"],
    pages: true
  },
  {
    name: "ps2-covers",
    repo: "ps2-covers",
    description: "Fork of a large PS2 covers collection.",
    language: "HTML",
    type: "other",
    tags: ["fork", "assets", "ps2"],
    pages: false
  },
  {
    name: "Monsterzoo",
    repo: "Monsterzoo",
    description: "JavaScript assignment: Monsterzoo project.",
    language: "JavaScript",
    type: "website",
    tags: ["assignment", "game"],
    pages: true
  },
  {
    name: "meinlager",
    repo: "meinlager",
    description: "Website suggestion for Mein Lager.",
    language: "HTML",
    type: "website",
    tags: ["client", "landing-page"],
    pages: true
  },
  {
    name: "Sudoku-Design-Patterns",
    repo: "Sudoku-Design-Patterns",
    description: "C# project applying design patterns to a Sudoku puzzle application.",
    language: "C#",
    type: "school",
    tags: ["design-patterns", "csharp"],
    pages: false
  },
  {
    name: "Linear-Algebra",
    repo: "Linear-Algebra",
    description: "C project related to linear algebra for game development.",
    language: "C",
    type: "school",
    tags: ["math", "games"],
    pages: false
  },
  {
    name: "Speuren-met-Krul-2020",
    repo: "Speuren-met-Krul-2020",
    description: "C++ project (2020 edition) for the Speuren met Krul assignment.",
    language: "C++",
    type: "school",
    tags: ["c++", "assignment"],
    pages: false
  },
  {
    name: "Speuren-met-Krul-2021",
    repo: "Speuren-met-Krul-2021",
    description: "C++ project (2021 edition) for the Speuren met Krul assignment.",
    language: "C++",
    type: "school",
    tags: ["c++", "assignment"],
    pages: false
  },
  {
    name: "Study-Mate",
    repo: "Study-Mate",
    description: "PHP final assignment: Study-Mate application.",
    language: "PHP",
    type: "website",
    tags: ["school", "php"],
    pages: true
  },
  {
    name: "Address-Distance-Calculator",
    repo: "Address-Distance-Calculator",
    description: ".NET/C# API case: calculate distance between addresses.",
    language: "C#",
    type: "api",
    tags: ["api", "dotnet"],
    pages: false
  },
  {
    name: "Broadway-Boogie-Weggie",
    repo: "Broadway-Boogie-Weggie",
    description: "C# project inspired by Broadway Boogie Woogie.",
    language: "C#",
    type: "school",
    tags: ["csharp"],
    pages: false
  },
  {
    name: "Image-Compare-API",
    repo: "Image-Compare-API",
    description: "NodeJS REST API to compare similarity between images using Imagga.",
    language: "JavaScript",
    type: "api",
    tags: ["nodejs", "imagga", "rest"],
    pages: false
  },
  {
    name: "DevOps",
    repo: "DevOps",
    description: "DevOps project using TypeScript and related tooling.",
    language: "TypeScript",
    type: "school",
    tags: ["devops", "typescript"],
    pages: false
  },
  {
    name: "Niks-voor-Niks",
    repo: "Niks-voor-Niks",
    description: "PHP marketplace project: NiksVoorNiks.",
    language: "PHP",
    type: "website",
    tags: ["marketplace", "php"],
    pages: true
  },
  {
    name: "Imgur-App-iOS",
    repo: "Imgur-App-iOS",
    description: "iOS Imgur client app written in Swift.",
    language: "Swift",
    type: "mobile",
    tags: ["ios", "imgur"],
    pages: false
  },
  {
    name: "Imgur-App-Android",
    repo: "Imgur-App-Android",
    description: "Android Imgur client – final assignment for Mobile Development.",
    language: "Java",
    type: "mobile",
    tags: ["android", "imgur"],
    pages: false
  },
  {
    name: "WEBS5_WS_WK2_Bookstore",
    repo: "WEBS5_WS_WK2_Bookstore",
    description: "Forked bookstore project for a web development workshop.",
    language: "JavaScript",
    type: "website",
    tags: ["fork", "workshop"],
    pages: true
  },
  {
    name: "AvanSync",
    repo: "AvanSync",
    description: "C++ CPPLS2 final assignment: AvanSync.",
    language: "C++",
    type: "school",
    tags: ["cpp"],
    pages: false
  },
  {
    name: "Dimitri",
    repo: "Dimitri",
    description: "C++ project for Software Architecture.",
    language: "C++",
    type: "school",
    tags: ["architecture", "cpp"],
    pages: false
  },
  {
    name: "Ecobit-Internship",
    repo: "Ecobit-Internship",
    description: "C# code related to a third-year internship at Ecobit.",
    language: "C#",
    type: "school",
    tags: ["internship", "csharp"],
    pages: false
  },
  {
    name: "Munchkin",
    repo: "Munchkin",
    description: "Website assignment for the card game Munchkin.",
    language: "CSS",
    type: "website",
    tags: ["assignment", "game"],
    pages: true
  },
  {
    name: "Kolonisten-van-Catan",
    repo: "Kolonisten-van-Catan",
    description: "Java project for the board game Settlers of Catan.",
    language: "Java",
    type: "school",
    tags: ["java", "game"],
    pages: false
  }
];

// Add URLs
const projectsWithUrls = projects.map(p => ({
  ...p,
  githubUrl: `https://github.com/ferrannl/${p.repo}`,
  pagesUrl: p.pages ? `https://ferrannl.github.io/${p.repo}/index.html` : null
}));

const state = {
  search: "",
  typeFilter: "all",
  languageFilter: "all"
};

function getTypeLabel(type) {
  switch (type) {
    case "website": return "Website";
    case "mobile":  return "Mobile App";
    case "api":     return "API / Backend";
    case "school":  return "School / Study";
    default:        return "Other";
  }
}

function matchesFilters(project) {
  // type
  if (state.typeFilter !== "all") {
    if (state.typeFilter !== project.type &&
        !(state.typeFilter === "other" &&
          !["website", "mobile", "api", "school"].includes(project.type))) {
      return false;
    }
  }

  // language
  if (state.languageFilter !== "all" &&
      project.language !== state.languageFilter) {
    return false;
  }

  // search
  if (state.search) {
    const haystack = [
      project.name,
      project.description,
      project.language,
      project.type,
      ...(project.tags || [])
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(state.search)) return false;
  }

  return true;
}

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";

  const titleRow = document.createElement("div");
  titleRow.className = "project-title-row";

  const nameEl = document.createElement("h2");
  nameEl.className = "project-name";
  nameEl.textContent = project.name;

  const typePill = document.createElement("span");
  typePill.className = "project-type-pill";
  typePill.textContent = getTypeLabel(project.type);

  titleRow.appendChild(nameEl);
  titleRow.appendChild(typePill);

  const descEl = document.createElement("p");
  descEl.className = "project-description";
  descEl.textContent = project.description;

  const metaRow = document.createElement("div");
  metaRow.className = "project-meta";

  if (project.language) {
    const langPill = document.createElement("span");
    langPill.className = "meta-pill language";
    langPill.textContent = project.language;
    metaRow.appendChild(langPill);
  }

  (project.tags || []).forEach(tag => {
    const tagPill = document.createElement("span");
    tagPill.className = "meta-pill tag-pill";
    tagPill.textContent = `#${tag}`;
    metaRow.appendChild(tagPill);
  });

  const linksRow = document.createElement("div");
  linksRow.className = "project-links";

  const ghLink = document.createElement("a");
  ghLink.className = "project-link-btn primary-link";
  ghLink.href = project.githubUrl;
  ghLink.target = "_blank";
  ghLink.rel = "noopener noreferrer";
  ghLink.innerHTML = "<span>View on GitHub</span>";
  linksRow.appendChild(ghLink);

  if (project.pages && project.pagesUrl) {
    const pagesLink = document.createElement("a");
    pagesLink.className = "project-link-btn";
    pagesLink.href = project.pagesUrl;
    pagesLink.target = "_blank";
    pagesLink.rel = "noopener noreferrer";
    pagesLink.innerHTML = "<span>Open live site</span>";
    linksRow.appendChild(pagesLink);
  }

  const footerMeta = document.createElement("div");
  footerMeta.className = "project-footer-meta";
  footerMeta.textContent =
    project.type === "school" ? "Study / assignment project" :
    project.type === "website" ? "Front-end / website project" :
    project.type === "mobile" ? "Mobile client app" :
    project.type === "api"    ? "Backend / API project" :
                                "Misc project";

  card.appendChild(titleRow);
  card.appendChild(descEl);
  card.appendChild(metaRow);
  card.appendChild(linksRow);
  card.appendChild(footerMeta);

  return card;
}

function renderProjects() {
  const grid = document.getElementById("projectsGrid");
  const emptyState = document.getElementById("emptyState");

  if (!grid) {
    console.error("projectsGrid element not found");
    return;
  }

  grid.innerHTML = "";

  const filtered = projectsWithUrls.filter(matchesFilters);

  if (!filtered.length) {
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;

  filtered.forEach(project => {
    grid.appendChild(createProjectCard(project));
  });
}

function setupFilters() {
  const searchInput = document.getElementById("search");
  const languageSelect = document.getElementById("languageFilter");
  const typeChips = document.querySelectorAll(".chip[data-filter-type='type']");

  // language options
  if (languageSelect) {
    const langs = Array.from(
      new Set(projectsWithUrls.map(p => p.language).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    langs.forEach(lang => {
      const opt = document.createElement("option");
      opt.value = lang;
      opt.textContent = lang;
      languageSelect.appendChild(opt);
    });

    languageSelect.addEventListener("change", () => {
      state.languageFilter = languageSelect.value;
      renderProjects();
    });
  }

  // type chips
  typeChips.forEach(chip => {
    chip.addEventListener("click", () => {
      typeChips.forEach(c => c.classList.remove("chip-active"));
      chip.classList.add("chip-active");
      state.typeFilter = chip.getAttribute("data-filter-value") || "all";
      renderProjects();
    });
  });

  // search
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.search = searchInput.value.toLowerCase().trim();
      renderProjects();
    });
  }
}

// Run immediately (script is at the bottom of the HTML)
(function init() {
  console.log("[Projects] Initializing");
  setupFilters();
  renderProjects();
})();
