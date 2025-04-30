from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# In-memory storage for dummy data
ratings = []
analytics_data = {
    "timestamps": [
        "00:00",
        "01:00",
        "02:00",
        "03:00",
        "04:00",
        "05:00",
        "06:00",
        "07:00",
        "08:00",
    ],
    "temperature": [22, 21.5, 21, 20.5, 20, 19.5, 19, 18.5, 18],
    "humidity": [40, 42, 44, 46, 48, 50, 52, 54, 56],
}


@app.route("/")
def index():
    return "<h1> Flask is alive!</h1>"


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
