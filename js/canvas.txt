const canvas = document.getElementById("home-canvas");
const ctx = canvas.getContext("2d");

let stars = [];
let constellations = [];
let shootingStars = [];
let lastSpawn = Date.now();

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createStars();
  createConstellations();
}

function createStars() {
  stars = Array.from({length: 200}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.9,
    speed: Math.random() * 0.02 + 0.005,
    phase: Math.random() * Math.PI * 2,
  }));
}

function createConstellations() {
  constellations = [];

  for (let i = 0; i < 5; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;

    const points = [];
    const connections = [];
    const count = Math.floor(Math.random() * 4) + 4;
    const radius = Math.random() * 80 + 60;

    for (let j = 0; j < count; j++) {
      const angle = (j / count) * Math.PI * 2 + Math.random() * 0.5;
      const dist = radius * (0.6 + Math.random() * 0.4);

      points.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
      });
    }

    for (let j = 0; j < count; j++) {
      const next = (j + 1) % count;
      connections.push([j, next]);

      if (Math.random() > 0.5) {
        connections.push([j, (j + 2) % count]);
      }
    }

    constellations.push({points, connections});
  }
}

function createShootingStar() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.5,
    length: Math.random() * 80 + 60,
    speed: Math.random() * 3 + 2,
    angle: Math.PI / 4,
    opacity: 0.8,
  };
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach((s) => {
    s.phase += s.speed;
    const glow = (Math.sin(s.phase) + 1) / 1.5;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.opacity * glow})`;
    ctx.fill();
  });

  constellations.forEach((c) => {
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1;

    c.connections.forEach(([a, b]) => {
      const p1 = c.points[a];
      const p2 = c.points[b];

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    c.points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.70)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fill();
    });
  });

  const now = Date.now();
  if (now - lastSpawn > 1500 + Math.random() * 2000) {
    shootingStars.push(createShootingStar());
    lastSpawn = now;
  }

  shootingStars = shootingStars.filter((s) => {
    if (s.opacity <= 0) return false;

    const grad = ctx.createLinearGradient(s.x, s.y, s.x - Math.cos(s.angle) * s.length, s.y - Math.sin(s.angle) * s.length);

    grad.addColorStop(0, `rgba(255,255,255,${s.opacity})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - Math.cos(s.angle) * s.length, s.y - Math.sin(s.angle) * s.length);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.stroke();

    s.x += Math.cos(s.angle) * s.speed;
    s.y += Math.sin(s.angle) * s.speed;
    s.opacity -= 0.01;

    return true;
  });

  requestAnimationFrame(draw);
}

window.addEventListener("resize", resize);

resize();
draw();
