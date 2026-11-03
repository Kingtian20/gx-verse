function showToast(message, type = "info", duration = 4000) {
  const container = document.getElementById("toast-container");
  if (!container) {
    console.error("Toast container not found");
    return;
  }

  const existingToasts = container.querySelectorAll(".toast");
  if (existingToasts.length >= 5) {
    const oldestToast = existingToasts[0];
    oldestToast.classList.add("hiding");
    oldestToast.addEventListener("animationend", () => {
      oldestToast.remove();
    });
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icons = {
    error: "fa-solid fa-xmark",
    warn: "fa-solid fa-exclamation-triangle",
    casual: "fa-solid fa-check",
    info: "fa-solid fa-info-circle"
  };

  toast.innerHTML = `
    <div class="toast-content">
      <i class="toast-icon ${icons[type] || icons.info}"></i>
      <span class="toast-message">${message}</span>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hiding");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, duration);
}
