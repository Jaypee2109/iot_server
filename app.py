from flask import Flask, render_template, request, jsonify

app = Flask(__name__, template_folder="templates", static_folder="static")

# In-memory storage for dummy data
ratings = []

# Generate dummy analytics for a 3-day interval at 15-minute intervals
from datetime import datetime, timedelta
import math, random

analytics_data = {"timestamps": [], "temperature": [], "humidity": []}
start = datetime.now() - timedelta(days=3)
current = start
while current <= datetime.now():
    analytics_data["timestamps"].append(current.strftime("%Y-%m-%d %H:%M"))
    # simulate diurnal temperature variation
    hour_fraction = current.hour + current.minute / 60
    temp = 20 + 5 * math.sin((hour_fraction / 24) * 2 * math.pi) + random.uniform(-1, 1)
    humidity = (
        50 + 10 * math.cos((hour_fraction / 24) * 2 * math.pi) + random.uniform(-5, 5)
    )
    analytics_data["temperature"].append(round(temp, 2))
    analytics_data["humidity"].append(round(humidity, 2))
    current += timedelta(minutes=15)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/rating", methods=["POST"])
def api_rating():
    data = request.get_json()
    rating = data.get("rating")
    ratings.append({"timestamp": request.get_json().get("timestamp"), "rating": rating})
    return jsonify({"status": "success"})


@app.route("/api/analytics")
def api_analytics():
    # Return dummy analytics and last rating
    last_rating = ratings[-1]["rating"] if ratings else None
    response = analytics_data.copy()
    response["rating"] = last_rating
    return jsonify(response)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
