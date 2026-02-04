const STORAGE_KEY = "mindmap_live_emotions";
const canvas = document.getElementById("timeline");
const ctx = canvas.getContext("2d");

const intensityInput = document.getElementById("intensity");
const intensityValue = document.getElementById("intensityValue");
const dayInfo = document.getElementById("dayInfo");

let points = [];
let animationFrame = null;

intensityInput.addEventListener("input", () => {
  intensityValue.textContent = intensityInput.value;
});

function loadData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearSelection() {
  document.getElementById("emotion").value = "";
  document.getElementById("intensity").value = 5;
  document.getElementById("notes").value = "";
  intensityValue.textContent = 5;
}

function saveEmotion() {
  const emotion = document.getElementById("emotion").value;
  if (!emotion) return alert("Select an emotion");

  const intensity = Number(intensityInput.value);
  const notes = document.getElementById("notes").value;

  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const data = loadData();
  data.push({ emotion, intensity, notes, time });
  saveData(data);

  drawTimeline(data, true);
}

function clearTimeline() {
  if (!confirm("Delete all emotion history?")) return;

  localStorage.removeItem(STORAGE_KEY);
  points = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dayInfo.textContent = "Timeline cleared. Start logging emotions again.";

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

function drawTimeline(data, animate) {
  canvas.width = canvas.offsetWidth;
  canvas.height = 320;
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

    drawGlowPoint(x, y, color);
    prev = { x, y };
  });

  drawAxis(data);
}

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  for (const p of points) {
    if (Math.hypot(p.x - mx, p.y - my) < 10) {
      const d = p.entry;
      dayInfo.innerHTML = `
        <strong>Time:</strong> ${d.time}<br>
        <strong>Emotion:</strong> ${d.emotion}<br>
        <strong>Intensity:</strong> ${d.intensity}/10<br>
        <strong>Notes:</strong> ${d.notes || "None"}
      `;
      break;
    }
  }
});

function drawGlowPoint(x, y, color) {
  ctx.beginPath();
  ctx.shadowBlur = 15;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.arc(x, y, 6, 0, Math.PI * 2);
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
  const steps = 25;

  function frame() {
    step++;
    const x = x1 + (x2 - x1) * (step / steps);
    const y = y1 + (y2 - y1) * (step / steps);

    drawGlowLine(x1, y1, x, y, color);

    if (step < steps) {
      animationFrame = requestAnimationFrame(frame);
    }
  }
  frame();
}

function drawAxis(data) {
  ctx.fillStyle = "#aaa";
  ctx.font = "12px Arial";

  data.forEach((entry, i) => {
    const x = (canvas.width / (data.length + 1)) * (i + 1);
    ctx.fillText(entry.time, x - 15, canvas.height - 8);
  });

  ctx.fillText("Intensity ↑", 5, 15);
  ctx.fillText("Time →", canvas.width - 60, canvas.height - 8);
}

function getColor(emotion) {
  return {
    happy: "#4caf50",
    calm: "#03a9f4",
    stressed: "#ff9800",
    sad: "#9c27b0",
    angry: "#f44336"
  }[emotion] || "#fff";
}

window.onload = () => {
  drawTimeline(loadData(), false);
};
