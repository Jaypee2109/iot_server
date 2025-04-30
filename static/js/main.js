let analyticsChart = null;

document.getElementById("saveRating").addEventListener("click", () => {
  const rating = parseInt(document.getElementById("rating").value);
  fetch("/api/rating", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp: new Date().toISOString(), rating }),
  })
    .then((res) => res.json())
    .then(() => alert("Rating saved!"));
});

document.getElementById("showAnalytics").addEventListener("click", () => {
  fetch("/api/analytics")
    .then((res) => res.json())
    .then((data) => {
      const canvas = document.getElementById("analyticsChart");
      canvas.style.display = "block";
      const ctx = canvas.getContext("2d");
      if (analyticsChart) analyticsChart.destroy();

      // Prepare datasets mapped to category labels
      const labels = data.timestamps;
      const tempData = data.temperature;
      const humData = data.humidity;
      const ratingsSeries = labels.map((t, i) => {
        const idx = data.ratings_timestamps.indexOf(t);
        return idx !== -1 ? data.ratings[idx] : null;
      });

      analyticsChart = new Chart(ctx, {
        data: {
          labels: labels,
          datasets: [
            {
              type: "line",
              label: "Temperature (°C)",
              data: tempData,
              borderColor: "red",
              backgroundColor: "rgba(255,0,0,0.2)",
              yAxisID: "y",
              fill: false,
              tension: 0.3,
            },
            {
              type: "line",
              label: "Humidity (%)",
              data: humData,
              borderColor: "blue",
              backgroundColor: "rgba(0,0,255,0.2)",
              yAxisID: "y1",
              fill: false,
              tension: 0.3,
            },
            {
              type: "line",
              label: "Sleep Rating",
              data: ratingsSeries,
              borderColor: "green",
              backgroundColor: "green",
              yAxisID: "y2",
              fill: false,
              pointRadius: 6,
              showLine: false,
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
              title: { display: true, text: "Humidity (%)" },
              grid: { drawOnChartArea: false },
            },
            y2: {
              type: "linear",
              position: "right",
              title: { display: true, text: "Sleep Rating" },
              min: 1,
              max: 9,
              grid: { drawOnChartArea: false },
            },
          },
        },
      });
    });
});
