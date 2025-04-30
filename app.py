from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta
import math, random

app = Flask(__name__, template_folder="templates", static_folder="static")

# In-memory storage for manual ratings (persisted via API)
ratings = []

# Generate realistic dummy analytics over a 3-day interval at 15-minute intervals
analytics_data = {
    "timestamps": [],
    "temperature": [],
    "humidity": [],
    # Dummy sleep rating points at 7:00 AM each day
    "ratings_timestamps": [],
    "ratings": [],
}

# Start 3 days ago
start = datetime.now() - timedelta(days=3)
current = start

# Create daily sleep ratings at 7 AM for 4 days (past 3 + today)
morning = start.replace(hour=7, minute=0, second=0, microsecond=0)
for i in range(4):
    tm = morning + timedelta(days=i)
    analytics_data["ratings_timestamps"].append(tm.strftime("%Y-%m-%d %H:%M"))
    analytics_data["ratings"].append(random.choice([6, 7, 7, 8, 6, 7, 8, 7]))

# Build time-series data every 15 minutes
interval = timedelta(minutes=15)
while current <= datetime.now():
    ts = current.strftime("%Y-%m-%d %H:%M")
    analytics_data["timestamps"].append(ts)
    h = current.hour + current.minute / 60
    # Temperature: ~16–22°C night, ~20–28°C day
    temp = 22 + 6 * math.sin((h - 6) / 24 * 2 * math.pi) + random.uniform(-0.5, 0.5)
    # Humidity: ~40–55% day, ~55–70% night
    hum = 55 + 15 * math.cos((h - 6) / 24 * 2 * math.pi) + random.uniform(-3, 3)
    analytics_data["temperature"].append(round(temp, 2))
    analytics_data["humidity"].append(round(hum, 2))
    current += interval


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/api/rating", methods=["POST"])
def api_rating():
    data = request.get_json()
    ratings.append({"timestamp": data.get("timestamp"), "rating": data.get("rating")})
    return jsonify({"status": "success"})


@app.route("/api/analytics", methods=["GET"])
def api_analytics():
    # Return temperature, humidity, and dummy sleep ratings
    return jsonify(
        {
            "timestamps": analytics_data["timestamps"],
            "temperature": analytics_data["temperature"],
            "humidity": analytics_data["humidity"],
            "ratings_timestamps": analytics_data["ratings_timestamps"],
            "ratings": analytics_data["ratings"],
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
