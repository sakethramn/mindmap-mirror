const STORAGE_KEY = "mindmap_live_emotions";
const canvas = document.getElementById("timeline");
const ctx = canvas.getContext("2d");

const intensityInput = document.getElementById("intensity");
const intensityValue = document.getElementById("intensityValue");
const dayInfo = document.getElementById("dayInfo");

let points = [];
let glowPulse = 0;

if (intensityInput && intensityValue) {
  intensityInput.addEventListener("input", () => {
    intensityValue.textContent = intensityInput.value;
  });
}

// ---------------- STORAGE ----------------
function loadData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ---------------- CLEAR SELECTION ----------------
function clearSelection() {
  document.getElementById("emotion").value = "";
  document.getElementById("intensity").value = 5;
  document.getElementById("notes").value = "";
  intensityValue.textContent = 5;
}

// ---------------- SAVE LIVE ENTRY ----------------
function saveEmotion() {
  const emotion = document.getElementById("emotion").value;
  if (!emotion) return alert("Select an emotion");

  const intensity = Number(document.getElementById("intensity").value);
  const notes = document.getElementById("notes").value;

  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let data = loadData();
  data.push({ emotion, intensity, notes, time });

  saveData(data);
  drawTimeline(data, true);
}

// ---------------- DRAW ENGINE ----------------
function drawTimeline(data, animate) {
  canvas.width = canvas.offsetWidth;
  canvas.height = 300;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  points = [];
  if (!data.length) return;

  const spacing = canvas.width / (data.length + 1);
  const maxHeight = canvas.height - 50;

  let prev = null;

  data.forEach((entry, i) => {
    const x = spacing * (i + 1);
    const y = canvas.height - (entry.intensity / 10) * maxHeight;
    const color = getColor(entry.emotion);

    points.push({ x, y, entry });

    if (prev) {
      animate
        ? animateGlowLine(prev.x, prev.y, x, y, color)
        : drawGlowLine(prev.x, prev.y, x, y, color);
    }

    drawGlowPoint(x, y, color, i === data.length - 1);
    prev = { x, y };
  });

  drawAxis(data);
  requestAnimationFrame(pulseGlow);
}

// ---------------- GLOW EFFECTS ----------------
function drawGlowPoint(x, y, color, pulse) {
  ctx.beginPath();
  ctx.shadowBlur = pulse ? 25 : 15;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.arc(x, y, 6 + (pulse ? glowPulse : 0), 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawGlowLine(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.shadowBlur = 20;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function animateGlowLine(x1, y1, x2, y2, color) {
  let step = 0;
  const steps = 30;

  function frame() {
    step++;
    const x = x1 + (x2 - x1) * (step / steps);
    const y = y1 + (y2 - y1) * (step / steps);

    drawGlowLine(x1, y1, x, y, color);
    if (step < steps) requestAnimationFrame(frame);
  }
  frame();
}

// ---------------- AXIS ----------------
function drawAxis(data) {
  ctx.fillStyle = "#aaa";
  ctx.font = "12px Arial";

  data.forEach((entry, i) => {
    const x = (canvas.width / (data.length + 1)) * (i + 1);
    ctx.fillText(entry.time, x - 15, canvas.height - 10);
  });

  ctx.fillText("Intensity ↑", 5, 15);
  ctx.fillText("Time →", canvas.width - 60, canvas.height - 10);
}

// ---------------- CLICK INFO ----------------
canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  points.forEach(p => {
    if (Math.hypot(p.x - mx, p.y - my) < 10) {
      const d = p.entry;
      dayInfo.innerHTML = `
        <strong>Time:</strong> ${d.time}<br>
        <strong>Emotion:</strong> ${d.emotion}<br>
        <strong>Intensity:</strong> ${d.intensity}/10<br>
        <strong>Notes:</strong> ${d.notes || "None"}
      `;
    }
  });
});

// ---------------- PULSE ----------------
function pulseGlow() {
  glowPulse = (glowPulse + 0.05) % 2;
  drawTimeline(loadData(), false);
}

// ---------------- COLORS ----------------
function getColor(emotion) {
  return {
    happy: "#4caf50",
    calm: "#03a9f4",
    stressed: "#ff9800",
    sad: "#9c27b0",
    angry: "#f44336"
  }[emotion] || "#fff";
}

// ---------------- LOAD ----------------
window.onload = () => {
  drawTimeline(loadData(), false);
};
