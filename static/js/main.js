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

      // Map dummy sleep ratings to index-based x-values
      const ratingPoints = data.ratings_timestamps.map((t, i) => {
        const idx = data.timestamps.indexOf(t);
        return { x: idx, y: data.ratings[i] };
      });

      analyticsChart = new Chart(ctx, {
        data: {
          labels: data.timestamps,
          datasets: [
            {
              type: "line",
              label: "Temperature (°C)",
              data: data.temperature,
              yAxisID: "y",
              fill: false,
            },
            {
              type: "line",
              label: "Humidity (%)",
              data: data.humidity,
              yAxisID: "y1",
              fill: false,
            },
            {
              type: "scatter",
              label: "Sleep Rating",
              data: ratingPoints,
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
            },
            y2: {
              type: "linear",
              position: "right",
              title: { display: true, text: "Sleep Rating" },
              min: 1,
              max: 9,
            },
          },
        },
      });
    });
});
