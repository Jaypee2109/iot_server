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
      const ctx = document.getElementById("analyticsChart").getContext("2d");
      document.getElementById("analyticsChart").style.display = "block";
      new Chart(ctx, {
        type: "line",
        data: {
          labels: data.timestamps,
          datasets: [
            {
              label: "Temperature (°C)",
              data: data.temperature,
              yAxisID: "y",
            },
            {
              label: "Humidity (%)",
              data: data.humidity,
              yAxisID: "y1",
            },
            {
              label: "Morning Rating",
              data: data.sleep_ratings_timestamps.map((t, i) => ({
                x: t,
                y: data.sleep_ratings[i],
              })),
              type: "scatter",
              yAxisID: "y2",
              showLine: false,
            },
            {
              label: "Manual Rating",
              data: data.manual_rating
                ? [
                    {
                      x: data.timestamps[data.timestamps.length - 1],
                      y: data.manual_rating,
                    },
                  ]
                : [],
              type: "scatter",
              yAxisID: "y2",
              showLine: false,
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
