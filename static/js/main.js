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

      // Prepare sleep rating aligned with labels
      const ratingsSeries = data.timestamps.map((t, i) => {
        const idx = data.ratings_timestamps.indexOf(t);
        return idx !== -1 ? data.ratings[idx] : null;
      });

      analyticsChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.timestamps,
          datasets: [
            {
              label: "Temperature (°C)",
              data: data.temperature,
              borderColor: "red",
              backgroundColor: "rgba(255,0,0,0.2)",
              yAxisID: "y",
              fill: false,
              tension: 0.3,
            },
            {
              label: "Humidity (%)",
              data: data.humidity,
              borderColor: "blue",
              backgroundColor: "rgba(0,0,255,0.2)",
              yAxisID: "y1",
              fill: false,
              tension: 0.3,
            },
            {
              label: "Sleep Rating",
              data: ratingsSeries,
              type: "scatter",
              yAxisID: "y2",
              showLine: false,
              pointRadius: 6,
              backgroundColor: "green",
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: "category",
              title: { display: true, text: "Time" },
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
