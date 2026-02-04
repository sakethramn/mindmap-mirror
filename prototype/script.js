const STORAGE_KEY = "mindmap_emotions";
const canvas = document.getElementById("timeline");
const ctx = canvas.getContext("2d");

const intensityInput = document.getElementById("intensity");
const intensityValue = document.getElementById("intensityValue");
const dayInfo = document.getElementById("dayInfo");

let points = [];

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

// ---------------- SAVE / UPDATE ----------------
function saveEmotion() {
  const emotion = document.getElementById("emotion").value;
  if (!emotion) {
    alert("Please select an emotion first.");
    return;
  }

  const intensity = Number(document.getElementById("intensity").value);
  const notes = document.getElementById("notes").value;
  const today = new Date().toISOString().split("T")[0];

  let data = loadData();
  const index = data.findIndex(e => e.date === today);

  const entry = { emotion, intensity, notes, date: today };

  if (index !== -1) {
    data[index] = entry;
    alert("Today's emotion updated!");
  } else {
    data.push(entry);
    alert("Emotion saved!");
  }

  saveData(data);
  drawTimeline(data, true);
}

// ---------------- FILTER ----------------
function filterTimeline() {
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  if (!start || !end) {
    alert("Select both dates");
    return;
  }

  const data = loadData().filter(e => e.date >= start && e.date <= end);
  drawTimeline(data, false);
}

// ---------------- CLEAR TIMELINE ----------------
function clearTimeline() {
  if (confirm("Delete all emotion history?")) {
    localStorage.removeItem(STORAGE_KEY);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dayInfo.textContent = "Timeline cleared. Start logging emotions again.";
  }
}

// ---------------- DRAW TIMELINE ----------------
function drawTimeline(data, animate) {
  canvas.width = canvas.offsetWidth;
  canvas.height = 300;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  points = [];

  if (data.length === 0) return;

  const spacing = canvas.width / (data.length + 1);
  const maxHeight = canvas.height - 40;

  let prev = null;

  data.forEach((entry, i) => {
    const x = spacing * (i + 1);
    const y = canvas.height - (entry.intensity / 10) * maxHeight;
    const color = getColor(entry.emotion);

    points.push({ x, y, entry });

    if (prev) {
      if (animate) {
        animateLine(prev.x, prev.y, x, y, color);
      } else {
        drawLine(prev.x, prev.y, x, y, color);
      }
    }

    drawPoint(x, y, color);
    prev = { x, y };
  });

  drawAxes(data);
}

// ---------------- INTERACTION ----------------
canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  points.forEach(p => {
    if (Math.hypot(p.x - mx, p.y - my) < 8) {
      const d = p.entry;
      dayInfo.innerHTML = `
        <strong>Date:</strong> ${d.date}<br>
        <strong>Emotion:</strong> ${d.emotion}<br>
        <strong>Intensity:</strong> ${d.intensity}/10<br>
        <strong>Notes:</strong> ${d.notes || "None"}
      `;
    }
  });
});

// ---------------- DRAW HELPERS ----------------
function drawPoint(x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawLine(x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function animateLine(x1, y1, x2, y2, color) {
  let step = 0;
  const steps = 20;

  function frame() {
    step++;
    const x = x1 + (x2 - x1) * (step / steps);
    const y = y1 + (y2 - y1) * (step / steps);

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (step < steps) requestAnimationFrame(frame);
  }

  frame();
}

function drawAxes(data) {
  ctx.fillStyle = "#aaa";
  ctx.font = "12px Arial";

  data.forEach((entry, i) => {
    const x = (canvas.width / (data.length + 1)) * (i + 1);
    ctx.fillText(entry.date.slice(5), x - 15, canvas.height - 5);
  });

  ctx.fillText("Intensity ↑", 5, 15);
  ctx.fillText("Days →", canvas.width - 60, canvas.height - 10);
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
