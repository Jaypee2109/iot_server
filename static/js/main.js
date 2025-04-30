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

      // Prepare scatter data for sleep ratings
      const ratingPoints = data.ratings_timestamps.map((t, i) => ({
        x: t,
        y: data.ratings[i],
      }));

      analyticsChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.timestamps,
          datasets: [
            {
              label: "Temperature (°C)",
              data: data.temperature,
              yAxisID: "y",
              fill: false,
            },
            {
              label: "Humidity (%)",
              data: data.humidity,
              yAxisID: "y1",
              fill: false,
            },
            {
              label: "Sleep Rating",
              type: "scatter",
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
              type: "time",
              time: {
                parser: "YYYY-MM-DD HH:mm",
                unit: "hour",
                displayFormats: { hour: "MMM D, HH:mm" },
              },
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
