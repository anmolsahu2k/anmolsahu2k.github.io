'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
const sidebarPanelToggleButton = document.querySelector("[data-sidebar-panel-toggle]");
const sidebarPanelToggleIcon = document.querySelector("[data-sidebar-panel-icon]");
const sidebarPanelReopenButton = document.querySelector("[data-sidebar-panel-reopen]");
const sidebarPanelReopenIcon = document.querySelector("[data-sidebar-panel-reopen-icon]");
const themeToggleButton = document.querySelector("[data-theme-toggle]");
const themeToggleIcon = document.querySelector("[data-theme-icon]");
const THEME_STORAGE_KEY = "preferred-theme";
const SIDEBAR_PANEL_ANIMATION_MS = 320;
const analyticsConfig = window.WEBSITE_ANALYTICS || {};
const ga4MeasurementId = typeof analyticsConfig.ga4MeasurementId === "string"
  ? analyticsConfig.ga4MeasurementId.trim()
  : "";
let analyticsEnabled = false;
let lastTrackedRouteKey = "";
let sidebarPanelCollapsed = false;
let sidebarPanelAnimating = false;

const applyTheme = function (theme) {
  const resolvedTheme = theme === "light" ? "light" : "dark";
  const nextTheme = resolvedTheme === "light" ? "dark" : "light";
  const label = `Switch to ${nextTheme} mode`;

  document.documentElement.setAttribute("data-theme", resolvedTheme);

  if (themeToggleButton) {
    themeToggleButton.setAttribute("aria-label", label);
    themeToggleButton.setAttribute("title", label);
  }

  if (themeToggleIcon) {
    themeToggleIcon.setAttribute("name", resolvedTheme === "light" ? "moon-outline" : "sunny-outline");
  }
}

const readStoredTheme = function () {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }
  } catch (error) {
    // Ignore storage read errors.
  }

  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

const setSidebarPanelControls = function (isCollapsed) {
  const toggleLabel = isCollapsed ? "Show left panel" : "Hide left panel";
  const reopenLabel = isCollapsed ? "Show left panel" : "Hide left panel";

  if (sidebarPanelToggleButton) {
    sidebarPanelToggleButton.setAttribute("aria-label", toggleLabel);
    sidebarPanelToggleButton.setAttribute("title", toggleLabel);
  }

  if (sidebarPanelToggleIcon) {
    sidebarPanelToggleIcon.setAttribute("name", isCollapsed ? "chevron-forward-outline" : "chevron-back-outline");
  }

  if (sidebarPanelReopenButton) {
    sidebarPanelReopenButton.setAttribute("aria-label", reopenLabel);
    sidebarPanelReopenButton.setAttribute("title", reopenLabel);
  }

  if (sidebarPanelReopenIcon) {
    sidebarPanelReopenIcon.setAttribute("name", isCollapsed ? "chevron-forward-outline" : "chevron-back-outline");
  }
}

let activeTheme = readStoredTheme();
applyTheme(activeTheme);
setSidebarPanelControls(sidebarPanelCollapsed);

const finishSidebarPanelAnimation = function () {
  document.body.classList.remove("sidebar-panel-animating", "sidebar-panel-opening", "sidebar-panel-closing");
  sidebarPanelAnimating = false;
}

const setSidebarPanelCollapsed = function (shouldCollapse, animate = true) {
  if (!sidebar || sidebarPanelAnimating || shouldCollapse === sidebarPanelCollapsed) {
    setSidebarPanelControls(sidebarPanelCollapsed);
    return;
  }

  if (!animate) {
    document.body.classList.toggle("sidebar-panel-collapsed", shouldCollapse);
    sidebarPanelCollapsed = shouldCollapse;
    setSidebarPanelControls(sidebarPanelCollapsed);
    return;
  }

  sidebarPanelAnimating = true;
  document.body.classList.add("sidebar-panel-animating");
  document.body.classList.toggle("sidebar-panel-closing", shouldCollapse);
  document.body.classList.toggle("sidebar-panel-opening", !shouldCollapse);

  if (!shouldCollapse) {
    document.body.classList.remove("sidebar-panel-collapsed");
  }

  let animationSettled = false;
  const settleAnimation = function () {
    if (animationSettled) {
      return;
    }

    animationSettled = true;

    if (shouldCollapse) {
      document.body.classList.add("sidebar-panel-collapsed");
    }

    sidebarPanelCollapsed = shouldCollapse;
    finishSidebarPanelAnimation();
    setSidebarPanelControls(sidebarPanelCollapsed);
  }

  sidebar.addEventListener("animationend", function onSidebarAnimationEnd(event) {
    if (event.target !== sidebar) {
      return;
    }

    sidebar.removeEventListener("animationend", onSidebarAnimationEnd);
    settleAnimation();
  });

  setTimeout(settleAnimation, SIDEBAR_PANEL_ANIMATION_MS + 80);
}

// sidebar toggle functionality for mobile
if (sidebarBtn) {
  sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
}

if (sidebarPanelToggleButton) {
  sidebarPanelToggleButton.addEventListener("click", function () {
    setSidebarPanelCollapsed(!sidebarPanelCollapsed, true);
  });
}

if (sidebarPanelReopenButton) {
  sidebarPanelReopenButton.addEventListener("click", function () {
    setSidebarPanelCollapsed(false, true);
  });
}

if (themeToggleButton) {
  themeToggleButton.addEventListener("click", function () {
    activeTheme = activeTheme === "light" ? "dark" : "light";
    applyTheme(activeTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, activeTheme);
    } catch (error) {
      // Ignore storage write errors.
    }
  });
}

const initializeAnalytics = function () {
  if (!ga4MeasurementId || ga4MeasurementId === "G-XXXXXXXXXX") {
    return;
  }

  const isValidGa4Id = /^G-[A-Z0-9]+$/i.test(ga4MeasurementId);
  if (!isValidGa4Id) {
    console.warn("Invalid GA4 measurement ID. Expected format: G-XXXXXXXXXX");
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", ga4MeasurementId, { send_page_view: false });

  const gaScript = document.createElement("script");
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4MeasurementId)}`;
  document.head.appendChild(gaScript);

  analyticsEnabled = true;
}

const trackVirtualPageView = function (page, articleSlug = "") {
  if (!analyticsEnabled || typeof window.gtag !== "function") {
    return;
  }

  let pagePath = page === "about" ? "/" : `/${page}`;
  if (page === "blog" && articleSlug) {
    pagePath = `/blog/${articleSlug}`;
  }

  const routeKey = `${pagePath}|${window.location.hash}|${window.location.search}`;
  if (routeKey === lastTrackedRouteKey) {
    return;
  }

  lastTrackedRouteKey = routeKey;

  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_title: document.title,
    page_location: window.location.href
  });
}



// skills variables
const skillsItem = document.querySelectorAll("[data-skills-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const skillsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < skillsItem.length; i++) {

  skillsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-skills-avatar]").src;
    modalImg.alt = this.querySelector("[data-skills-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-skills-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-skills-text]").innerHTML;

    skillsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", skillsModalFunc);
overlay.addEventListener("click", skillsModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");
const articlesListView = document.querySelector("[data-articles-list]");
const articleDetailView = document.querySelector("[data-article-detail]");
const articleOpenButtons = document.querySelectorAll("[data-article-open]");
const articleBackButton = document.querySelector("[data-article-back]");
const articleContents = document.querySelectorAll("[data-article-content]");
const DEFAULT_PAGE = "about";

const resetArticlesView = function () {
  if (!articlesListView || !articleDetailView) {
    return;
  }

  articlesListView.hidden = false;
  articleDetailView.hidden = true;

  for (let i = 0; i < articleContents.length; i++) {
    articleContents[i].hidden = false;
  }
}

const openArticleView = function (slug) {
  if (!articlesListView || !articleDetailView) {
    return false;
  }

  let hasMatch = false;

  articlesListView.hidden = true;
  articleDetailView.hidden = false;

  for (let i = 0; i < articleContents.length; i++) {
    const isMatch = articleContents[i].dataset.articleContent === slug;
    articleContents[i].hidden = !isMatch;

    if (isMatch) {
      hasMatch = true;
    }
  }

  if (!hasMatch) {
    resetArticlesView();
    return false;
  }

  return true;
}

const hasPage = function (pageName) {
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].dataset.page === pageName) {
      return true;
    }
  }

  return false;
}

const setActivePage = function (targetPage) {
  for (let i = 0; i < pages.length; i++) {
    pages[i].classList.toggle("active", pages[i].dataset.page === targetPage);
  }

  for (let i = 0; i < navigationLinks.length; i++) {
    const navPage = navigationLinks[i].innerHTML.trim().toLowerCase();
    navigationLinks[i].classList.toggle("active", navPage === targetPage);
  }
}

const getRouteFromLocation = function () {
  const hash = window.location.hash.replace(/^#/, "").trim();
  let pageFromHash = "";
  let articleFromHash = "";

  if (hash) {
    const hashSegments = hash.split("/").filter(Boolean);
    pageFromHash = hashSegments[0] ? hashSegments[0].toLowerCase() : "";
    if (hashSegments.length > 1) {
      const rawArticleSlug = hashSegments.slice(1).join("/");

      try {
        articleFromHash = decodeURIComponent(rawArticleSlug);
      } catch (error) {
        articleFromHash = rawArticleSlug;
      }
    }
  }

  if (pageFromHash) {
    return { page: pageFromHash, article: articleFromHash };
  }

  const params = new URLSearchParams(window.location.search);
  const queryPage = params.get("page");
  const queryArticle = params.get("article");

  return {
    page: queryPage ? queryPage.toLowerCase() : "",
    article: queryArticle ? queryArticle : ""
  };
}

const applyRouteFromLocation = function () {
  const route = getRouteFromLocation();
  const targetPage = hasPage(route.page) ? route.page : DEFAULT_PAGE;
  let activeArticleSlug = "";

  setActivePage(targetPage);

  if (targetPage === "blog") {
    if (route.article) {
      const articleOpened = openArticleView(route.article);
      if (articleOpened) {
        activeArticleSlug = route.article;
      }
    } else {
      resetArticlesView();
    }
  } else {
    resetArticlesView();
  }

  trackVirtualPageView(targetPage, activeArticleSlug);
  window.scrollTo(0, 0);
}

const navigateTo = function (page, articleSlug = "") {
  const nextHash = articleSlug ? `#${page}/${encodeURIComponent(articleSlug)}` : `#${page}`;

  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash;
    return;
  }

  applyRouteFromLocation();
}

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    const targetPage = this.innerHTML.trim().toLowerCase();
    navigateTo(targetPage);
  });
}

for (let i = 0; i < articleOpenButtons.length; i++) {
  articleOpenButtons[i].addEventListener("click", function () {
    navigateTo("blog", this.dataset.articleOpen);
  });
}

if (articleBackButton) {
  articleBackButton.addEventListener("click", function () {
    navigateTo("blog");
  });
}

initializeAnalytics();
window.addEventListener("hashchange", applyRouteFromLocation);
applyRouteFromLocation();
