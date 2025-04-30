let analyticsChart = null;

document.getElementById("saveRating").addEventListener("click", () => {
  const rating = parseInt(document.getElementById("rating").value);
  fetch("/api/rating", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp: new Date().toISOString(), rating }),
  }).then(() => alert("Rating saved!"));
});

document.getElementById("showAnalytics").addEventListener("click", () => {
  fetch("/api/analytics")
    .then((res) => res.json())
    .then((data) => {
      const canvas = document.getElementById("analyticsChart");
      canvas.style.display = "block";
      const ctx = canvas.getContext("2d");
      if (analyticsChart) analyticsChart.destroy();

      const labels = data.timestamps;

      // Build aligned series for temperature, humidity, and ratings
      const tempSeries = data.temperature;
      const humSeries = data.humidity;
      const ratingsSeries = labels.map((t) => {
        const idx = data.ratings_timestamps.indexOf(t);
        return idx !== -1 ? data.ratings[idx] : null;
      });

      analyticsChart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Temperature (°C)",
              data: tempSeries,
              borderColor: "#FF8A65",
              backgroundColor: "rgba(255,138,101,0.2)",
              yAxisID: "y",
              tension: 0.3,
              fill: false,
            },
            {
              label: "Humidity (%)",
              data: humSeries,
              borderColor: "#4FC3F7",
              backgroundColor: "rgba(79,195,247,0.2)",
              yAxisID: "y1",
              tension: 0.3,
              fill: false,
            },
            {
              label: "Sleep Rating",
              data: ratingsSeries,
              borderColor: "#BA68C8",
              backgroundColor: "#BA68C8",
              yAxisID: "y2",
              tension: 0,
              fill: false,
              pointRadius: 6,
              spanGaps: false, // don't connect across nulls
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: "category",
              title: { display: true, text: "Time" },
              ticks: { maxTicksLimit: 12 },
            },
            y: {
              type: "linear",
              position: "left",
              title: { display: true, text: "Temperature (°C)" },
            },
            y1: {
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: "Humidity (%)" },
            },
            y2: {
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: "Sleep Rating" },
              min: 1,
              max: 9,
            },
          },
        },
      });
    });
});
