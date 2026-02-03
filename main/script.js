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
  return JSON.parse(localStorage.getItem("dailyEmotionData")) || [];
}

/* Save Emotion for Today */
function saveEmotion() {
  const emotion = document.getElementById("emotion").value;
  const intensity = Number(intensitySlider.value);
  const notes = document.getElementById("notes").value;
  const today = new Date().toLocaleDateString();

  let data = getData();

  // Only one entry per day
  const existingIndex = data.findIndex(e => e.date === today);

  const entry = {
    emotion,
    intensity,
    notes,
    date: today
  };

  if (existingIndex >= 0) {
    data[existingIndex] = entry;
  } else {
    data.push(entry);
  }

  localStorage.setItem("dailyEmotionData", JSON.stringify(data));

  document.getElementById("notes").value = "";
  drawTimeline();
  generateInsights();
  alert("Today's emotion saved.");
}

/* Draw Timeline with Meaning */
function drawTimeline() {
  const data = getData();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Axis Labels
  ctx.fillStyle = "#888";
  ctx.font = "12px Inter";
  ctx.fillText("Time →", canvas.width - 60, canvas.height - 10);
  ctx.fillText("Intensity ↑", 10, 20);

  const spacing = canvas.width / (data.length + 1);

  data.forEach((entry, index) => {
    const x = spacing * (index + 1);
    const y = canvas.height - entry.intensity * 22;

    // Draw point
    ctx.beginPath();
    ctx.arc(x, y, 8 + entry.intensity / 2, 0, Math.PI * 2);
    ctx.fillStyle = getEmotionColor(entry.emotion);
    ctx.shadowBlur = 15;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Connect lines
    if (index > 0) {
      const prev = data[index - 1];
      const prevX = spacing * index;
      const prevY = canvas.height - prev.intensity * 22;

      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#444";
      ctx.stroke();
    }

    // Date label
    ctx.fillStyle = "#aaa";
    ctx.font = "10px Inter";
    ctx.fillText(entry.date, x - 20, canvas.height - 5);
  });
}

/* Insights */
function generateInsights() {
  const data = getData();
  const resultBox = document.getElementById("result");

  if (data.length < 3) {
    resultBox.innerText =
      "Keep logging daily emotions. After 3 days, trend insights will appear here.";
    return;
  }

  let emotionCount = {};
  let totalIntensity = 0;

  data.forEach(e => {
    emotionCount[e.emotion] = (emotionCount[e.emotion] || 0) + 1;
    totalIntensity += e.intensity;
  });

  const dominantEmotion = Object.keys(emotionCount).reduce((a, b) =>
    emotionCount[a] > emotionCount[b] ? a : b
  );

  const avgIntensity = (totalIntensity / data.length).toFixed(1);

  resultBox.innerText =
    `How to read this:\n` +
    `• Timeline height shows how strong your emotion was that day\n` +
    `• Color shows the type of emotion\n\n` +
    `Your Emotional Pattern:\n` +
    `• Dominant Emotion: ${dominantEmotion.toUpperCase()}\n` +
    `• Average Intensity: ${avgIntensity}\n\n` +
    `Insight:\n` +
    (avgIntensity > 6
      ? "Your emotions are generally strong. Consider reflection and calming strategies."
      : "Your emotional levels are balanced. Maintain consistency and awareness.");
}

/* Initial Load */
drawTimeline();
generateInsights();

/* Color Mapping */
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
