from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta
import math, random

app = Flask(__name__, template_folder="templates", static_folder="static")

# In-memory storage for dummy data
ratings = []

# Generate dummy analytics for a 3-day interval at 15-minute intervals
analytics_data = {
    "timestamps": [],
    "temperature": [],
    "humidity": [],
    "sleep_ratings_timestamps": [],
    "sleep_ratings": [],
}

start = datetime.now() - timedelta(days=3)
current = start

# Generate morning sleep ratings at 7:00 AM for each of the past 4 mornings
day_start = start.replace(hour=7, minute=0, second=0, microsecond=0)
for i in range(4):  # covers 3 full days plus today
    t = day_start + timedelta(days=i)
    analytics_data["sleep_ratings_timestamps"].append(t.strftime("%Y-%m-%d %H:%M"))
    analytics_data["sleep_ratings"].append(random.randint(1, 9))

# Build time-series for temperature & humidity
while current <= datetime.now():
    analytics_data["timestamps"].append(current.strftime("%Y-%m-%d %H:%M"))
    hour_fraction = current.hour + current.minute / 60
    temp = 20 + 5 * math.sin((hour_fraction / 24) * 2 * math.pi) + random.uniform(-1, 1)
    humidity = (
        50 + 10 * math.cos((hour_fraction / 24) * 2 * math.pi) + random.uniform(-5, 5)
    )
    analytics_data["temperature"].append(round(temp, 2))
    analytics_data["humidity"].append(round(humidity, 2))
    current += timedelta(minutes=15)


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/api/rating", methods=["POST"])
def api_rating():
    data = request.get_json()
    rating = data.get("rating")
    timestamp = data.get("timestamp")
    ratings.append({"timestamp": timestamp, "rating": rating})
    return jsonify({"status": "success"})


@app.route("/api/analytics", methods=["GET"])
def api_analytics():
    last_rating = ratings[-1]["rating"] if ratings else None
    response = {
        "timestamps": analytics_data["timestamps"],
        "temperature": analytics_data["temperature"],
        "humidity": analytics_data["humidity"],
        "sleep_ratings_timestamps": analytics_data["sleep_ratings_timestamps"],
        "sleep_ratings": analytics_data["sleep_ratings"],
        "rating": last_rating,
    }
    return jsonify(response)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
