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

      // Prepare datasets with x (time) and y (value)
      const tempData = data.timestamps.map((t, i) => ({
        x: t,
        y: data.temperature[i],
      }));
      const humData = data.timestamps.map((t, i) => ({
        x: t,
        y: data.humidity[i],
      }));
      const ratingData = data.ratings_timestamps.map((t, i) => ({
        x: t,
        y: data.ratings[i],
      }));

      analyticsChart = new Chart(ctx, {
        type: "line",
        data: {
          datasets: [
            {
              label: "Temperature (°C)",
              data: tempData,
              borderColor: "red",
              backgroundColor: "rgba(255,0,0,0.2)",
              yAxisID: "y",
              tension: 0.3,
              fill: false,
              parsing: false,
            },
            {
              label: "Humidity (%)",
              data: humData,
              borderColor: "blue",
              backgroundColor: "rgba(0,0,255,0.2)",
              yAxisID: "y1",
              tension: 0.3,
              fill: false,
              parsing: false,
            },
            {
              type: "scatter",
              label: "Sleep Rating",
              data: ratingData,
              borderColor: "green",
              backgroundColor: "green",
              yAxisID: "y2",
              showLine: false,
              pointRadius: 6,
              parsing: false,
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
