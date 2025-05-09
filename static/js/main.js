let analyticsChart = null;

// Fetch and display San Diego’s current weather via Open-Meteo
function fetchWeather() {
  const weatherDiv = document.getElementById("weather");
  weatherDiv.textContent = "Loading weather…";
  fetch(
    "https://api.open-meteo.com/v1/forecast" +
      "?latitude=32.7157&longitude=-117.1611" +
      "&current_weather=true" +
      "&timezone=America/Los_Angeles"
  )
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      // Open-Meteo returns temperature in °C
      const tempC = data.current_weather.temperature.toFixed(1);
      // Optional: convert to °F
      const tempF = ((tempC * 9) / 5 + 32).toFixed(1);
      weatherDiv.innerHTML = `<strong>${tempC}°C</strong> (${tempF}°F)`;
    })
    .catch((err) => {
      console.error("Weather fetch failed:", err);
      weatherDiv.textContent = "Unable to load weather.";
    });
}

fetchWeather();
// refresh every 10 minutes
setInterval(fetchWeather, 10 * 60 * 1000);

// Save rating button
document.getElementById("saveRating").addEventListener("click", () => {
  const rating = parseInt(document.getElementById("rating").value);
  fetch("/api/rating", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp: new Date().toISOString(), rating }),
  }).then(() => alert("Rating saved!"));
});

// Analytics chart
document.getElementById("showAnalytics").addEventListener("click", () => {
  Promise.all([
    fetch("/api/sensor").then((r) => r.json()),
    fetch("/api/metrics").then((r) => r.json()),
    fetch("/api/rating").then((r) => r.json()),
  ])
    .then(([sensor, metrics, rating]) => {
      // 1) Build a sorted union of all timestamps
      const allTimestamps = [
        ...sensor.timestamps,
        ...metrics.timestamps,
        ...rating.timestamps,
      ];
      const labels = Array.from(new Set(allTimestamps)).sort();

      // 2) Helper to map a series onto the unified labels
      function mapSeries(srcLabels, srcData) {
        const map = {};
        srcLabels.forEach((ts, i) => (map[ts] = srcData[i]));
        return labels.map((ts) => (ts in map ? map[ts] : null));
      }

      // 3) Prepare all datasets (no more analytics fetch)
      const datasets = [
        {
          label: "ESP32 Temp (°C)",
          data: mapSeries(sensor.timestamps, sensor.temperature),
          yAxisID: "yTemp",
          borderColor: "#D32F2F",
          fill: false,
        },
        {
          label: "ESP32 Hum (%)",
          data: mapSeries(sensor.timestamps, sensor.humidity),
          yAxisID: "yHum",
          borderColor: "#1976D2",
          fill: false,
        },
        {
          label: "Puzzle Attempts",
          data: mapSeries(metrics.timestamps, metrics.attempts),
          yAxisID: "yAttempts",
          borderColor: "#388E3C",
          fill: false,
        },
        {
          label: "Reaction Time (ms)",
          data: mapSeries(metrics.timestamps, metrics.reaction_time),
          yAxisID: "yReact",
          borderColor: "#FBC02D",
          fill: false,
        },
        {
          label: "Sleep Rating",
          data: mapSeries(rating.timestamps, rating.ratings),
          yAxisID: "yRating",
          borderColor: "#7B1FA2",
          fill: false,
          spanGaps: true,
          pointRadius: 6,
        },
      ];

      // 4) Draw the combined chart
      const canvas = document.getElementById("analyticsChart");
      canvas.style.display = "block";
      const ctx = canvas.getContext("2d");
      if (analyticsChart) analyticsChart.destroy();
      analyticsChart = new Chart(ctx, {
        type: "line",
        data: { labels, datasets },
        options: {
          scales: {
            x: { type: "category", title: { display: true, text: "Time" } },
            yTemp: {
              type: "linear",
              position: "left",
              title: { display: true, text: "Temp (°C)" },
            },
            yHum: {
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: "Hum (%)" },
            },
            yAttempts: {
              type: "linear",
              position: "left",
              grid: { drawOnChartArea: false },
              title: { display: true, text: "Attempts" },
            },
            yReact: {
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: "Reaction Time (ms)" },
            },
            yRating: {
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: "Sleep Rating" },
              min: 0,
              max: 9,
            },
          },
          interaction: {
            mode: "index",
            intersect: false,
          },
        },
      });
    })
    .catch((err) => {
      console.error("Error loading combined data:", err);
      alert("Failed to load combined chart");
    });
});

// Set Alarm button
document.getElementById("setAlarm").addEventListener("click", () => {
  const timeStr = document.getElementById("alarmTime").value;
  if (!timeStr) {
    return alert("Please pick a time first");
  }
  // timeStr is "HH:MM"
  const [hour, minute] = timeStr.split(":").map((s) => parseInt(s, 10));
  fetch("/api/alarm", {
    method: "GET",
  })
    .then(() =>
      fetch("/api/alarm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hour, minute }),
      })
    )
    .then((res) => {
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return res.json();
    })
    .then((json) => {
      alert(
        `Alarm set to ${json.hour.toString().padStart(2, "0")}:${json.minute
          .toString()
          .padStart(2, "0")}`
      );
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to set alarm");
    });
});
