let analyticsChart = null;

// Save rating button
document.getElementById("saveRating").addEventListener("click", () => {
  const rating = parseInt(document.getElementById("rating").value);
  fetch("/api/rating", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp: new Date().toISOString(), rating }),
  }).then(() => alert("Rating saved!"));
});

// Show analytics button
document.getElementById("showAnalytics").addEventListener("click", () => {
  fetch("/api/analytics")
    .then((res) => res.json())
    .then((data) => {
      const canvas = document.getElementById("analyticsChart");
      canvas.style.display = "block";
      const ctx = canvas.getContext("2d");
      if (analyticsChart) analyticsChart.destroy();

      const labels = data.timestamps;
      const tempSeries = data.temperature;
      const humSeries = data.humidity;

      // Build a series that is null except at 07:00 where rating exists
      const ratingSeries = labels.map((ts) => {
        const idx = data.ratings_timestamps.indexOf(ts);
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
              borderColor: "#FF8A65", // pastel orange
              backgroundColor: "rgba(255,138,101,0.15)",
              yAxisID: "y",
              tension: 0.3,
              fill: false,
            },
            {
              label: "Humidity (%)",
              data: humSeries,
              borderColor: "#4FC3F7", // pastel blue
              backgroundColor: "rgba(79,195,247,0.15)",
              yAxisID: "y1",
              tension: 0.3,
              fill: false,
            },
            {
              label: "Sleep Rating",
              data: ratingSeries,
              borderColor: "#BA68C8", // pastel purple
              backgroundColor: "#BA68C8",
              yAxisID: "y2",
              tension: 0,
              fill: false,
              pointRadius: 6,
              spanGaps: true, // connect the rating dots across missing values
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
