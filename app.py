from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta
import math, random

app = Flask(__name__, template_folder="templates", static_folder="static")

ratings = []
alarm_setting = {"hour": 7, "minute": 0}

rating_data = {
    "timestamps": [],
    "ratings": [],
}

sensor_data = {"timestamps": [], "temperature": [], "humidity": []}

puzzle_metrics = {
    "timestamps": [],
    "attempts": [],
    "reaction_time": [],  # in milliseconds
}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    """
    Aggregates sensor, puzzle‐metrics and rating data into one JSON payload.
    {
      "timestamps":       [...],    # from sensor_data
      "temperature":      [...],    # from sensor_data
      "humidity":         [...],    # from sensor_data
      "attempts_timestamps":[...],  # from puzzle_metrics
      "attempts":         [...],    # from puzzle_metrics
      "reaction_time":    [...],    # from puzzle_metrics
      "ratings_timestamps":[...],   # from rating_data
      "ratings":          [...],    # from rating_data
    }
    """
    return jsonify(
        {
            "timestamps": sensor_data["timestamps"],
            "temperature": sensor_data["temperature"],
            "humidity": sensor_data["humidity"],
            "attempts_timestamps": puzzle_metrics["timestamps"],
            "attempts": puzzle_metrics["attempts"],
            "reaction_time": puzzle_metrics["reaction_time"],
            "ratings_timestamps": rating_data["timestamps"],
            "ratings": rating_data["ratings"],
        }
    )


@app.route("/api/rating", methods=["POST"])
def post_rating():
    """
    Accepts JSON { "timestamp": <ISO‐string>, "rating": <0–9> }
    and appends to rating_data.
    """
    data = request.get_json(force=True)
    ts = data.get("timestamp")
    r = data.get("rating")
    if not (ts and isinstance(r, int) and 0 <= r <= 9):
        return jsonify({"status": "error", "message": "invalid payload"}), 400

    rating_data["timestamps"].append(ts)
    rating_data["ratings"].append(r)
    return jsonify({"status": "success"}), 201


@app.route("/api/rating", methods=["GET"])
def get_ratings():
    """
    Returns JSON:
    {
      "timestamps": [ ... ],
      "ratings":    [ ... ]
    }
    """
    return jsonify(rating_data)


@app.route("/api/alarm", methods=["GET"])
def get_alarm():
    """
    Returns the currently configured alarm time.
    Response: { "hour": <0–23>, "minute": <0–59> }
    """
    return jsonify(alarm_setting)


@app.route("/api/alarm", methods=["POST"])
def set_alarm():
    """
    Update the alarm time.
    Expects JSON: { "hour": <0–23>, "minute": <0–59> }.
    """
    data = request.get_json(force=True)
    h = data.get("hour")
    m = data.get("minute")
    if not (isinstance(h, int) and 0 <= h < 24 and isinstance(m, int) and 0 <= m < 60):
        return jsonify({"status": "error", "message": "invalid hour/minute"}), 400

    alarm_setting["hour"] = h
    alarm_setting["minute"] = m
    return jsonify({"status": "success", "hour": h, "minute": m})


@app.route("/api/sensor", methods=["POST"])
def post_sensor():
    """
    Accept JSON: { "timestamp": "ISO8601", "temperature": float, "humidity": float }
    """
    data = request.get_json(force=True)
    ts = data.get("timestamp")
    t = data.get("temperature")
    h = data.get("humidity")
    # Basic validation
    if not (ts and isinstance(t, (int, float)) and isinstance(h, (int, float))):
        return jsonify({"status": "error", "message": "invalid payload"}), 400

    sensor_data["timestamps"].append(ts)
    sensor_data["temperature"].append(t)
    sensor_data["humidity"].append(h)
    return jsonify({"status": "success"}), 201


@app.route("/api/sensor", methods=["GET"])
def get_sensor():
    """
    Returns JSON:
    {
      "timestamps": [...],
      "temperature": [...],
      "humidity": [...]
    }
    """
    return jsonify(sensor_data)


@app.route("/api/metrics", methods=["POST"])
def post_metrics():
    """
    Accept JSON: { "timestamp":"ISO8601", "attempts":int, "reaction_time":int }
    """
    data = request.get_json(force=True)
    ts = data.get("timestamp")
    a = data.get("attempts")
    r = data.get("reaction_time")
    if not (ts and isinstance(a, int) and isinstance(r, (int, float))):
        return jsonify({"status": "error", "message": "invalid payload"}), 400

    puzzle_metrics["timestamps"].append(ts)
    puzzle_metrics["attempts"].append(a)
    puzzle_metrics["reaction_time"].append(r)
    return jsonify({"status": "success"}), 201


@app.route("/api/metrics", methods=["GET"])
def get_metrics():
    """
    Returns JSON:
    {
      "timestamps": [...],
      "attempts": [...],
      "reaction_time": [...]
    }
    """
    return jsonify(puzzle_metrics)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
