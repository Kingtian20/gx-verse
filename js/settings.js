function initSettings() {
  const settingsBtn = document.querySelector(".settings-btn");
  const settingsPage = document.getElementById("settings-page");
  const settingsCategories = document.querySelectorAll(".settings-category");
  const settingsSections = document.querySelectorAll(".settings-section");
  const settingsSearch = document.getElementById("settings-search");
  const settingsMain = document.querySelector(".settings-main");

  let lastActiveCategory = "performance";
  let performanceMode = "full";

  function showCategory(categoryName) {
    lastActiveCategory = categoryName;
    settingsSearch.value = "";

    const existingNoResults = settingsMain.querySelector(".settings-no-results");
    if (existingNoResults) existingNoResults.remove();

    settingsCategories.forEach(c => {
      c.classList.toggle("active", c.dataset.category === categoryName);
    });

    settingsSections.forEach(section => {
      section.style.display = "";
      if (section.id === `section-${categoryName}`) {
        section.classList.add("active");
        const groups = section.querySelectorAll(".settings-group");
        groups.forEach((group, index) => {
          group.style.display = "block";
          group.style.animation = "none";
          void group.offsetHeight;
          group.style.animation = `slideIn 0.4s ease forwards ${index * 0.05}s`;
        });
      } else {
        section.classList.remove("active");
        const groups = section.querySelectorAll(".settings-group");
        groups.forEach(group => {
          group.style.display = "none";
        });
      }
    });
  }

  function closeSettings() {
    settingsPage.classList.remove("active");
    showCategory(lastActiveCategory);
  }
  window.closeSettings = closeSettings;

  settingsBtn.addEventListener("click", () => {
    settingsPage.classList.add("active");
    showCategory(lastActiveCategory);
  });

  settingsCategories.forEach(category => {
    category.addEventListener("click", () => {
      showCategory(category.dataset.category);
    });
  });

  function normalizeForSearch(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  let searchDebounce;
  settingsSearch.addEventListener("input", (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      const rawVal = e.target.value.trim();
      const term = normalizeForSearch(rawVal);

      const existingNoResults = settingsMain.querySelector(".settings-no-results");
      if (existingNoResults) existingNoResults.remove();

      if (term === "") {
        showCategory(lastActiveCategory);
        return;
      }

      settingsCategories.forEach(c => c.classList.remove("active"));
      let totalMatches = 0;

      settingsSections.forEach(section => {
        const groups = section.querySelectorAll(".settings-group");
        let sectionMatches = 0;

        groups.forEach(group => {
          const titleEl = group.querySelector(".settings-section-title");
          const tooltipIcon = group.querySelector(".settings-tooltip-icon");
          const title = titleEl ? normalizeForSearch(titleEl.textContent) : "";
          const description = tooltipIcon && tooltipIcon.dataset.tooltip ? normalizeForSearch(tooltipIcon.dataset.tooltip) : "";

          if (title.includes(term) || description.includes(term)) {
            group.style.display = "block";
            sectionMatches++;
            totalMatches++;
          } else {
            group.style.display = "none";
          }
        });

        if (sectionMatches > 0) {
          section.classList.add("active");
          section.style.display = "block";
        } else {
          section.classList.remove("active");
          section.style.display = "none";
        }
      });

      if (totalMatches === 0) {
        const noResults = document.createElement("div");
        noResults.className = "settings-no-results";
        noResults.innerHTML = `
          <i class="fa-solid fa-magnifying-glass"></i>
          <div>No settings found for "${rawVal}"</div>
        `;
        settingsMain.appendChild(noResults);
      }
    }, 150);
  });

  settingsSearch.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (settingsSearch.value !== "") {
        settingsSearch.value = "";
        showCategory(lastActiveCategory);
      } else {
        closeSettings();
      }
    }
  });

  settingsSearch.addEventListener("keypress", (e) => {
    if (!/[a-zA-Z0-9 ]/.test(e.key)) {
      e.preventDefault();
    }
  });

  // Mode selector buttons (no functionality yet)
  const modeBtns = document.querySelectorAll(".mode-btn");
  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      modeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Performance mode selector
  const performanceOptions = document.querySelectorAll(".performance-option");
  performanceOptions.forEach(option => {
    option.addEventListener("click", () => {
      performanceOptions.forEach(o => o.classList.remove("active"));
      option.classList.add("active");
      performanceMode = option.dataset.mode;
      applyPerformanceMode(performanceMode);
    });
  });

  function applyPerformanceMode(mode) {
    const homeCanvas = document.getElementById("home-canvas");
    const actionBarCanvas = document.getElementById("action-bar-canvas");
    const lineDrivers = document.querySelectorAll(".line-driver");
    const barPod = document.getElementById("barPod");
    const searchBoxes = document.querySelectorAll(".search-box");

    if (mode === "full") {
      // Full mode - everything enabled
      if (homeCanvas) homeCanvas.style.display = "block";
      if (actionBarCanvas) actionBarCanvas.style.display = "block";
      lineDrivers.forEach(driver => {
        driver.style.display = "block";
        driver.style.background = "";
      });
      if (barPod) barPod.style.background = "";
      searchBoxes.forEach(box => box.style.border = "");
    } else if (mode === "balanced") {
      // Balanced mode - reduce background animations (keep borders)
      if (homeCanvas) homeCanvas.style.display = "block";
      if (actionBarCanvas) actionBarCanvas.style.display = "none";
      lineDrivers.forEach(driver => {
        driver.style.display = "block";
        driver.style.background = "";
      });
      if (barPod) barPod.style.background = "";
      searchBoxes.forEach(box => box.style.border = "");
    } else if (mode === "lite") {
      // Lite mode - no animations or background (plain grey borders)
      if (homeCanvas) homeCanvas.style.display = "none";
      if (actionBarCanvas) actionBarCanvas.style.display = "none";
      lineDrivers.forEach(driver => {
        driver.style.display = "none";
      });
      if (barPod) barPod.style.background = "rgba(0, 0, 0, 0.8)";
      searchBoxes.forEach(box => box.style.border = "1px solid rgba(255, 255, 255, 0.2)");
    }
  }

  // Theme options (no functionality yet)
  const themeOptions = document.querySelectorAll(".theme-option");
  themeOptions.forEach(option => {
    option.addEventListener("click", () => {
      themeOptions.forEach(t => t.classList.remove("active"));
      option.classList.add("active");
    });
  });

  // Back link functionality
  const backLink = document.querySelector(".settings-back-link a");
  if (backLink) {
    backLink.addEventListener("click", (e) => {
      e.preventDefault();
      closeSettings();
    });
  }

  // Tooltip functionality
  const tooltipIcons = document.querySelectorAll(".settings-tooltip-icon");
  tooltipIcons.forEach(icon => {
    icon.addEventListener("mouseenter", (e) => {
      const tooltipText = icon.dataset.tooltip;
      if (!tooltipText) return;

      const existingTooltip = document.querySelector(".custom-tooltip");
      if (existingTooltip) existingTooltip.remove();

      const tooltip = document.createElement("div");
      tooltip.className = "custom-tooltip";
      tooltip.textContent = tooltipText;

      const rect = icon.getBoundingClientRect();
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.top = `${rect.bottom + 8}px`;

      document.body.appendChild(tooltip);

      setTimeout(() => {
        tooltip.style.opacity = "1";
        tooltip.style.visibility = "visible";
      }, 10);
    });

    icon.addEventListener("mouseleave", () => {
      const tooltip = document.querySelector(".custom-tooltip");
      if (tooltip) {
        tooltip.style.opacity = "0";
        tooltip.style.visibility = "hidden";
        setTimeout(() => tooltip.remove(), 200);
      }
    });
  });
}

initSettings();
