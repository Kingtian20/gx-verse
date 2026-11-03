const actionBarCanvas = document.getElementById("action-bar-canvas");
const actionCtx = actionBarCanvas.getContext("2d");
const barPod = document.getElementById("barPod");

let barRotation = 0;

function resizeActionBarCanvas() {
  actionBarCanvas.width = window.innerWidth;
  actionBarCanvas.height = window.innerHeight;
}

function renderActionBar() {
  if (!actionBarCanvas.width || !actionBarCanvas.height) {
    console.log("Canvas not sized yet");
    requestAnimationFrame(renderActionBar);
    return;
  }

  actionCtx.clearRect(0, 0, actionBarCanvas.width, actionBarCanvas.height);
  barRotation += 0.04;

  const b = barPod.getBoundingClientRect();

  actionCtx.fillStyle = "black";
  actionCtx.beginPath();
  actionCtx.roundRect(b.left, b.top, b.width, b.height, b.height / 2);
  actionCtx.fill();

  const centerX = b.left + b.width / 2;
  const centerY = b.top + b.height / 2;
  const grad = actionCtx.createConicGradient(barRotation, centerX, centerY);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.1, "#0000ff");
  grad.addColorStop(0.2, "#00fff7");
  grad.addColorStop(0.3, "transparent");

  actionCtx.strokeStyle = grad;
  actionCtx.lineWidth = 3;
  actionCtx.shadowBlur = 2;
  actionCtx.shadowColor = "rgba(0, 0, 255, 0.8)";
  actionCtx.beginPath();
  actionCtx.roundRect(b.left, b.top, b.width, b.height, b.height / 2);
  actionCtx.stroke();

  requestAnimationFrame(renderActionBar);
}

window.addEventListener("resize", resizeActionBarCanvas);
resizeActionBarCanvas();

setTimeout(() => {
  resizeActionBarCanvas();
  renderActionBar();
}, 100);
