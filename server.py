from flask import Flask, request, jsonify
from flask_cors import CORS
from flight_api import get_access_token, search_flights

app = Flask(__name__)
CORS(app)  # povolí fetch z libovolného originu

@app.route("/flights", methods=["GET"])
def flights():
    origin = request.args.get("from")
    destination = request.args.get("to")
    date = request.args.get("date")

    if not origin or not destination or not date:
        return jsonify({"error": "Missing parameters"}), 400

    try:
        token = get_access_token()
        data = search_flights(token, origin, destination, date)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🚀 Backend running at http://localhost:5000")
    app.run(port=5000, debug=True)
