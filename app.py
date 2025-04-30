from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta
import math, random

app = Flask(__name__, template_folder="templates", static_folder="static")

# In-memory storage for manual ratings
ratings = []

# Generate realistic dummy analytics for a 3-day interval at 15-minute intervals
analytics_data = {
    "timestamps": [],
    "temperature": [],
    "humidity": [],
    "sleep_ratings_timestamps": [],
    "sleep_ratings": [],
}

# Set start time 3 days ago and generate data points
start = datetime.now() - timedelta(days=3)
current = start

# Generate morning sleep ratings at 7:00 AM for each of the past 4 mornings
morning_time = start.replace(hour=7, minute=0, second=0, microsecond=0)
for i in range(4):
    t = morning_time + timedelta(days=i)
    analytics_data["sleep_ratings_timestamps"].append(t.strftime("%Y-%m-%d %H:%M"))
    # realistic ratings skewed between 5 and 9
    analytics_data["sleep_ratings"].append(random.choice([5, 6, 7, 8, 9]))

# Build time-series for temperature & humidity every 15 minutes
delta = timedelta(minutes=15)
while current <= datetime.now():
    analytics_data["timestamps"].append(current.strftime("%Y-%m-%d %H:%M"))
    hour_fraction = current.hour + current.minute / 60
    # Temperature: ~16–22°C at night, ~20–28°C in daytime
    temp = (
        22
        + 6 * math.sin((hour_fraction - 6) / 24 * 2 * math.pi)
        + random.uniform(-0.5, 0.5)
    )
    # Humidity: ~40–55% daytime, ~55–70% nighttime
    humidity = (
        55
        + 15 * math.cos((hour_fraction - 6) / 24 * 2 * math.pi)
        + random.uniform(-3, 3)
    )
    analytics_data["temperature"].append(round(temp, 2))
    analytics_data["humidity"].append(round(humidity, 2))
    current += delta


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
    last_rating = ratings[-1]["rating"] if ratings else None
    return jsonify(
        {
            "timestamps": analytics_data["timestamps"],
            "temperature": analytics_data["temperature"],
            "humidity": analytics_data["humidity"],
            "sleep_ratings_timestamps": analytics_data["sleep_ratings_timestamps"],
            "sleep_ratings": analytics_data["sleep_ratings"],
            "manual_rating": last_rating,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
