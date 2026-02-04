const STORAGE_KEY = "mindmap_live_emotions";
const canvas = document.getElementById("timeline");
const ctx = canvas.getContext("2d");

const intensityInput = document.getElementById("intensity");
const intensityValue = document.getElementById("intensityValue");
const dayInfo = document.getElementById("dayInfo");

let points = [];
let fullData = [];

intensityInput.addEventListener("input", () => {
  intensityValue.textContent = intensityInput.value;
});

// ---------------- HELPERS ----------------
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// ---------------- STORAGE ----------------
function loadData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ---------------- UI ----------------
function clearSelection() {
  document.getElementById("emotion").value = "";
  document.getElementById("intensity").value = 5;
  document.getElementById("notes").value = "";
  intensityValue.textContent = 5;
}

// ---------------- SAVE ----------------
function saveEmotion() {
  const emotion = document.getElementById("emotion").value;
  if (!emotion) return alert("Select an emotion");

  const intensity = Number(intensityInput.value);
  const notes = document.getElementById("notes").value;

  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5);
  const minutes = timeToMinutes(timeStr);

  fullData = loadData();
  fullData.push({ emotion, intensity, notes, time: timeStr, minutes });
  saveData(fullData);

  drawTimeline(fullData);
}

// ---------------- FILTER ----------------
function filterTimeline() {
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;

  if (!start || !end) {
    alert("Select both start and end time.");
    return;
  }

  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);

  const filtered = fullData.filter(e =>
    e.minutes >= startMin && e.minutes <= endMin
  );

  drawTimeline(filtered);
}

// ---------------- CLEAR SELECTED PERIOD ----------------
function clearSelectedPeriod() {
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;

  if (!start || !end) {
    alert("Select a time range to clear.");
    return;
  }

  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);

  fullData = fullData.filter(e =>
    !(e.minutes >= startMin && e.minutes <= endMin)
  );

  saveData(fullData);
  drawTimeline(fullData);
  dayInfo.textContent = "Selected time period cleared.";
}

// ---------------- SHOW FULL ----------------
function showFullTimeline() {
  drawTimeline(fullData);
}

// ---------------- CLEAR ALL ----------------
function clearTimeline() {
  if (!confirm("Delete all emotion history?")) return;

  localStorage.removeItem(STORAGE_KEY);
  fullData = [];
  points = [];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dayInfo.textContent = "Timeline cleared. Start logging emotions again.";
}

// ---------------- DRAW ----------------
function drawTimeline(data) {
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

    // Clean line (no glow)
    if (prev) {
      drawLine(prev.x, prev.y, x, y, "#aaa");
    }

    // Soft glow dot only
    drawSoftGlowPoint(x, y, color);
    prev = { x, y };
  });

  drawAxis(data);
}

// ---------------- INTERACTION ----------------
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

// ---------------- VISUALS ----------------
function drawSoftGlowPoint(x, y, color) {
  ctx.beginPath();
  ctx.shadowBlur = 8;   // SMALL glow
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawLine(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// ---------------- AXIS ----------------
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
  fullData = loadData();
  drawTimeline(fullData);
};
