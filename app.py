from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta
import math, random

app = Flask(__name__, template_folder="templates", static_folder="static")

ratings = []

analytics_data = {
    "timestamps": [],
    "temperature": [],
    "humidity": [],
    "ratings_timestamps": [],
    "ratings": [],
}

# Align start to the top of the hour 3 days ago
start = (datetime.now() - timedelta(days=3)).replace(minute=0, second=0, microsecond=0)
current = start

# Sleep ratings at 07:00 for past 3 days + today
for i in range(4):
    morning = (start + timedelta(days=i)).replace(hour=7)
    analytics_data["ratings_timestamps"].append(morning.strftime("%Y-%m-%d %H:%M"))
    analytics_data["ratings"].append(random.choice([6, 7, 7, 8, 6, 7, 8, 7]))

interval = timedelta(minutes=15)
while current <= datetime.now():
    ts = current.strftime("%Y-%m-%d %H:%M")
    analytics_data["timestamps"].append(ts)

    hf = current.hour + current.minute / 60
    temp = 22 + 6 * math.sin((hf - 6) / 24 * 2 * math.pi) + random.uniform(-0.5, 0.5)
    hum = 55 + 15 * math.cos((hf - 6) / 24 * 2 * math.pi) + random.uniform(-3, 3)
    analytics_data["temperature"].append(round(temp, 2))
    analytics_data["humidity"].append(round(hum, 2))
    current += interval


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/rating", methods=["POST"])
def api_rating():
    data = request.get_json()
    ratings.append({"timestamp": data["timestamp"], "rating": data["rating"]})
    return jsonify({"status": "success"})


@app.route("/api/analytics")
def api_analytics():
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
