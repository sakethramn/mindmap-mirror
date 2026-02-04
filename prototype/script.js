const STORAGE_KEY = "mindmap_emotions";

const canvas = document.getElementById("timeline");
const ctx = canvas.getContext("2d");

const intensityInput = document.getElementById("intensity");
const intensityValue = document.getElementById("intensityValue");

if (intensityInput && intensityValue) {
  intensityInput.addEventListener("input", () => {
    intensityValue.textContent = intensityInput.value;
  });
}

function loadData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function saveEmotion() {
  const emotion = document.getElementById("emotion").value;
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
  drawTimeline(data);
}

function clearTimeline() {
  if (confirm("Delete all emotion history?")) {
    localStorage.removeItem(STORAGE_KEY);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function filterTimeline() {
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  if (!start || !end) {
    alert("Select both start and end dates");
    return;
  }

  const data = loadData().filter(e => e.date >= start && e.date <= end);
  drawTimeline(data);
}

function drawTimeline(data) {
  canvas.width = canvas.offsetWidth;
  canvas.height = 300;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (data.length === 0) return;

  const spacing = canvas.width / (data.length + 1);
  const maxHeight = canvas.height - 40;

  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);

  data.forEach((entry, i) => {
    const x = spacing * (i + 1);
    const y = canvas.height - (entry.intensity / 10) * maxHeight;

    ctx.strokeStyle = getColor(entry.emotion);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = getColor(entry.emotion);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
  });
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
  drawTimeline(loadData());
};
