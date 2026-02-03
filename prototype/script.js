const canvas = document.getElementById("timeline");
const ctx = canvas.getContext("2d");

const intensitySlider = document.getElementById("intensity");
const intensityValue = document.getElementById("intensityValue");

intensityValue.innerText = intensitySlider.value;
intensitySlider.oninput = () => {
  intensityValue.innerText = intensitySlider.value;
};

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* Storage */
function getData() {
  return JSON.parse(localStorage.getItem("emotionData")) || [];
}

/* Save Emotion */
function saveEmotion() {
  const emotion = document.getElementById("emotion").value;
  const intensity = Number(intensitySlider.value);
  const notes = document.getElementById("notes").value;

  const entry = {
    emotion,
    intensity,
    notes,
    time: new Date().toLocaleTimeString()
  };

  const data = getData();
  data.push(entry);
  localStorage.setItem("emotionData", JSON.stringify(data));

  document.getElementById("notes").value = "";
  drawTimeline();
  updateHistory();
}

/* Draw Timeline with Explanation */
function drawTimeline() {
  const data = getData();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Axis labels */
  ctx.fillStyle = "#888";
  ctx.font = "12px Inter";
  ctx.fillText("Time →", canvas.width - 60, canvas.height - 10);
  ctx.fillText("Intensity ↑", 10, 20);

  const spacing = canvas.width / (data.length + 1);

  data.forEach((entry, index) => {
    const x = spacing * (index + 1);
    const y = canvas.height - entry.intensity * 20;

    /* Draw point */
    ctx.beginPath();
    ctx.arc(x, y, 8 + entry.intensity / 2, 0, Math.PI * 2);
    ctx.fillStyle = getEmotionColor(entry.emotion);
    ctx.shadowBlur = 15;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
    ctx.shadowBlur = 0;

    /* Connect lines */
    if (index > 0) {
      const prev = data[index - 1];
      const prevX = spacing * index;
      const prevY = canvas.height - prev.intensity * 20;

      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#444";
      ctx.stroke();
    }

    /* Emotion label */
    ctx.fillStyle = "#aaa";
    ctx.font = "10px Inter";
    ctx.fillText(entry.emotion, x - 15, canvas.height - 5);
  });
}

/* Colors */
function getEmotionColor(emotion) {
  switch (emotion) {
    case "happy": return "#4caf50";
    case "calm": return "#4cafef";
    case "stressed": return "#ff9800";
    case "sad": return "#9c27b0";
    case "angry": return "#f44336";
    default: return "#ccc";
  }
}

/* History */
function updateHistory() {
  const history = document.getElementById("history");
  const data = getData();
  history.innerHTML = "";

  data.slice(-10).reverse().forEach(entry => {
    const div = document.createElement("div");
    div.style.marginBottom = "10px";
    div.innerHTML = `
      <strong>${entry.emotion.toUpperCase()}</strong>
      <span style="color:#aaa"> (${entry.time})</span><br>
      Intensity: ${entry.intensity}<br>
      <small>${entry.notes}</small>
    `;
    history.appendChild(div);
  });
}

/* Initial Render */
drawTimeline();
updateHistory();
