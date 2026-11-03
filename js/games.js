function initGames() {
  const gameGrid = document.getElementById("game-grid");
  const searchInput = document.getElementById("game-search");
  const overlay = document.getElementById("game-overlay");
  const frameContainer = document.getElementById("game-frame-container");
  const globalActionBar = document.querySelector(".action-bar");

  let currentGame = null;
  let gamesList = [];
  window.isDevMode = false;

  async function fetchGames() {
    try {
      const url = window.isDevMode
        ? "gxmes-list.json"
        : "https://raw.githubusercontent.com/Kingtian20/gx-verse/main/gxmes/gxmes-list.json";
      const response = await fetch(url);
      const data = await response.json();
      gamesList = Array.isArray(data) ? data : (data ? [data] : []);
      gamesList.sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, {numeric: true, sensitivity: "base"}));
      renderGames(gamesList);
    } catch (error) {
      console.error("Failed to fetch games:", error);
      gameGrid.innerHTML = '<p style="color:white;text-align:center;font-family:Orbitron;">Failed to load games</p>';
      if (window.isDevMode && typeof showToast === "function") {
        showToast("Failed to load local gxmes-list.json", "warn");
      }
    }
  }
  window.fetchGames = fetchGames;

  function renderGames(games) {
    gameGrid.innerHTML = "";
    if (games.length === 0) {
      gameGrid.innerHTML = '<p style="color: rgba(255, 255, 255, 0.5); text-align: center; font-family: Orbitron; font-size: 1.2rem; grid-column: 1 / -1; padding: 40px;">No gxmes found</p>';
      return;
    }
    games.forEach((game) => {
      const item = document.createElement("div");
      item.className = "game-item game-pop";
      item.onclick = () => openGameModal(game);
      item.innerHTML = `
        <img src="${game.image}" alt="${game.name}" loading="lazy">
        <div class="game-title">${game.name}</div>
      `;
      gameGrid.appendChild(item);
    });
  }

  function normalizeForSearch(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  let searchDebounce;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      const term = normalizeForSearch(e.target.value);
      renderGames(gamesList.filter((game) => normalizeForSearch(game.name).includes(term)));
    }, 250);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (!/[a-zA-Z0-9 ]/.test(e.key)) {
      e.preventDefault();
    }
  });

  async function fetchText(url) {
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (err) {
      console.error("Fetch failed:", err);
      return null;
    }
  }

  async function openGameModal(game) {
    currentGame = game;
    overlay.classList.add("active");
    globalActionBar.style.display = "none";
    frameContainer.innerHTML = '<div style="color:white; text-align:center; margin-top:20%; font-family:Orbitron;">LOADING...</div>';

    if (game.method === "code") {
      const fetchedCode = await fetchText(game.url);
      frameContainer.innerHTML = "";

      if (fetchedCode) {
        const wrapper = document.createElement("div");
        wrapper.id = "game-content-wrapper";
        wrapper.style.cssText = "width:100%; height:100%; overflow:auto; background:#000;";
        frameContainer.appendChild(wrapper);

        const baseUrl = game.url.substring(0, game.url.lastIndexOf("/") + 1);
        const patchedCode = fetchedCode.replace(/(src|href)=(["'])(?!https?:\/\/|data:|\/\/)([^"']+)\2/gi, `$1=$2${baseUrl}$3$2`);

        const parser = new DOMParser();
        const parsedDoc = parser.parseFromString(patchedCode, "text/html");

        parsedDoc.head.querySelectorAll("style").forEach((style) => {
          wrapper.appendChild(style.cloneNode(true));
        });

        parsedDoc.head.querySelectorAll("link[rel='stylesheet']").forEach((link) => {
          const newLink = document.createElement("link");
          newLink.rel = "stylesheet";
          newLink.href = link.href;
          wrapper.appendChild(newLink);
        });

        const bodyContent = document.createElement("div");
        bodyContent.innerHTML = parsedDoc.body.innerHTML;
        wrapper.appendChild(bodyContent);
        if (wrapper.dataset.scriptsLoaded) return;
        wrapper.dataset.scriptsLoaded = "true";

        parsedDoc.body.querySelectorAll("script").forEach((script) => {
          const newScript = document.createElement("script");
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.textContent = script.textContent;
          }
          wrapper.appendChild(newScript);
        });
      }
    } else if (game.method === "sandbox") {
      frameContainer.innerHTML = "";
      const iframe = document.createElement("iframe");
      iframe.className = "newtab-iframe";
      iframe.setAttribute("allow", "autoplay; fullscreen; keyboard-events; gamepad");
      iframe.allowFullscreen = true;
      iframe.src = game.url;
      frameContainer.appendChild(iframe);
    } else if (game.method === "webgl") {
      frameContainer.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:white; text-align:center; font-family:sans-serif; padding: 20px; width: 100%;">
          <h2 style="margin-bottom: 10px;">WebGL Mode</h2>
          <p style="opacity: 0.8; max-width: 400px; margin-bottom: 20px;">This game requires a new window to run correctly.</p>
          <button onclick="document.getElementById('btn-fullscreen').click()" style="padding: 15px 15px; background: #3066BE; color: white; border: none; border-radius: 100px; cursor: pointer; font-size: 20px; transition: 0.2s;"><i class="fa-solid fa-expand"></i></button>
        </div>
      `;
    } else {
      try {
        const code = await fetchText(game.url);
        frameContainer.innerHTML = "";
        const iframe = document.createElement("iframe");
        iframe.className = "newtab-iframe";
        iframe.setAttribute("allow", "autoplay; fullscreen; keyboard-events; gamepad");
        iframe.allowFullscreen = true;
        const blob = new Blob([code], {type: "text/html"});
        iframe.src = URL.createObjectURL(blob);
        frameContainer.appendChild(iframe);
      } catch (error) {
        console.error("Load error:", error);
        showToast("Failed to load game.", "error");
      }
    }
  }

  document.getElementById("btn-exit").addEventListener("click", () => {
    overlay.classList.remove("active");
    frameContainer.innerHTML = "";
    globalActionBar.style.display = "flex";
    currentGame = null;
  });

  document.getElementById("btn-fullscreen").addEventListener("click", async () => {
    if (!currentGame) return;

    const targetUrl = currentGame.url;
    const fetchedContent = await fetchText(targetUrl);

    if (fetchedContent) {
      const newWin = window.open("about:blank", "_blank");
      if (newWin) {
        newWin.document.open();
        newWin.document.write(fetchedContent);
        newWin.document.close();

        setTimeout(function () {
          const docEl = newWin.document.documentElement;
          const requestFs = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
          if (requestFs) requestFs.call(docEl);
        }, 500);
      } else {
        showToast("Popup blocked! Please allow popups to launch the game.", "error");
      }
    }
  });

  fetchGames();
}

initGames();
