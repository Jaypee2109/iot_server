document.getElementById("saveRating").addEventListener("click", () => {
  const rating = document.getElementById("rating").value;
  fetch("/api/rating", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rating: parseInt(rating),
      timestamp: new Date().toISOString(),
    }),
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
              label: "Sleep Rating",
              data: data.timestamps.map((t, i) =>
                i === data.timestamps.length - 1 ? data.rating : null
              ),
              type: "scatter",
              yAxisID: "y2",
            },
          ],
        },
        options: {
          scales: {
            y: {
              type: "linear",
              position: "left",
              title: { display: true, text: "Temperature" },
            },
            y1: {
              type: "linear",
              position: "right",
              title: { display: true, text: "Humidity" },
            },
            y2: {
              type: "linear",
              position: "right",
              title: { display: true, text: "Rating" },
              min: 1,
              max: 9,
            },
          },
        },
      });
    });
});
