function initNavigation() {
  const homePage = document.getElementById("home-page");
  const gxmesPage = document.getElementById("gxmes-page");
  const homeBtn = document.getElementById("homeBtn");
  const gxmesBtn = document.getElementById("gxmesBtn");
  const buttons = [homeBtn, gxmesBtn];
  const mainTitle = document.querySelector(".main-title");
  const subTitle = document.querySelector(".sub-title");
  const homeSearch = document.getElementById("home-search");
  const gameSearch = document.getElementById("game-search");

  console.log("Buttons found:", homeBtn, gxmesBtn);

  let currentPage = "home";

  const pageMap = {
    home: {page: homePage, btn: homeBtn},
    gxmes: {page: gxmesPage, btn: gxmesBtn},
  };

  function updateButtons() {
    Object.keys(pageMap).forEach((pageName) => {
      const btn = pageMap[pageName].btn;
      if (pageName === currentPage) {
        btn.classList.add("active");
        btn.disabled = true;
        btn.style.cursor = "pointer";
        btn.style.pointerEvents = "none";
        btn.style.color = "var(--primary-color)";
        btn.style.transform = "translateY(-5px) scale(1.2)";
        btn.style.filter = "drop-shadow(0 0 10px var(--primary-color))";
      } else {
        btn.classList.remove("active");
        btn.disabled = false;
        btn.style.cursor = "";
        btn.style.pointerEvents = "";
        btn.style.color = "";
        btn.style.transform = "";
        btn.style.filter = "";
      }
    });
  }

  function switchPage(targetPage) {
    if (targetPage === currentPage) return;

    const prevPage = pageMap[currentPage].page;
    const nextPage = pageMap[targetPage].page;
    const canvas = document.getElementById("home-canvas");

    prevPage.style.display = "none";
    nextPage.style.display = "flex";
    nextPage.classList.remove("page-fade");
    void nextPage.offsetWidth;
    nextPage.classList.add("page-fade");

    if (targetPage === "home") {
      canvas.classList.remove("hidden");
    } else {
      canvas.classList.add("hidden");
    }

    currentPage = targetPage;
    updateButtons();

    if (targetPage === "home") {
      if (mainTitle) {
        mainTitle.style.animation = "none";
        void mainTitle.offsetWidth;
        mainTitle.style.animation = "glitch 2s infinite";
      }
      if (subTitle) {
        subTitle.style.animation = "none";
        void subTitle.offsetWidth;
        subTitle.style.animation = "glitch 2s infinite";
      }
    } else if (targetPage === "gxmes") {
      gameSearch.focus();
    }
  }

  function showDelayedTooltip(btn) {
    btn.classList.add("show-tooltip");
    setTimeout(() => {
      btn.classList.remove("show-tooltip");
    }, 300);
  }

  homeBtn.addEventListener("click", () => {
    console.log("Home button clicked");
    showDelayedTooltip(homeBtn);
    switchPage("home");
  });
  gxmesBtn.addEventListener("click", () => {
    console.log("Gxmes button clicked");
    showDelayedTooltip(gxmesBtn);
    switchPage("gxmes");
  });

  updateButtons();

  document.addEventListener("keydown", (e) => {
    const overlay = document.getElementById("game-overlay");
    const settingsPage = document.getElementById("settings-page");

    if (e.key === "Escape") {
      if (overlay && overlay.classList.contains("active")) {
        e.preventDefault();
        document.getElementById("btn-exit").click();
        return;
      }
      if (settingsPage && settingsPage.classList.contains("active")) {
        e.preventDefault();
        closeSettings();
        return;
      }
    }

    if (e.target.tagName === "INPUT") return;

    if (e.key === "/") {
      e.preventDefault();
      if (currentPage === "home") {
        homeSearch.focus();
      } else if (currentPage === "gxmes") {
        gameSearch.focus();
      } else {
        switchPage("gxmes");
        setTimeout(() => gameSearch.focus(), 100);
      }
    }
  });

  homeSearch.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = homeSearch.value.trim().toLowerCase();
      if (query === "devmode" || query === "dev mode") {
        window.isDevMode = !window.isDevMode;
        localStorage.setItem('gxverse_devmode', window.isDevMode);
        homeSearch.value = "";
        if (typeof showToast === "function") {
          if (window.isDevMode) {
            showToast("You're in dev mode", "casual");
          } else {
            showToast("Dev mode disabled - reloading...", "info");
            setTimeout(() => location.reload(), 1000);
          }
        }
        if (typeof window.fetchGames === "function") {
          window.fetchGames();
        }
        return;
      }

      gameSearch.value = homeSearch.value;
      gameSearch.dispatchEvent(new Event("input", {bubbles: true}));
      homeSearch.value = "";
      switchPage("gxmes");
    } else if (!/[a-zA-Z0-9 ]/.test(e.key)) {
      e.preventDefault();
    }
  });
}

initNavigation();
