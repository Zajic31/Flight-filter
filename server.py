from flask import Flask, request, jsonify
from flask_cors import CORS
# Ujistěte se, že importujete VŠECHNY tři funkce
from flight_api import get_access_token, search_flights, search_airports 

app = Flask(__name__)
# CORS povoluje, aby frontend na localhostu mohl volat tento backend
CORS(app) 

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
        # V případě chyby API letů zalogujeme a vrátíme chybu
        print(f"Error fetching flights: {e}") 
        return jsonify({"error": str(e)}), 500

# NOVÁ ROUTE PRO HLEDÁNÍ LETIŠŤ/MĚST (pro autocomplete)
@app.route("/airports/search", methods=["GET"])
def airport_search():
    keyword = request.args.get("q") 

    # Požadavek musí mít alespoň 2 znaky, jinak vrátíme prázdné
    if not keyword or len(keyword) < 2:
        return jsonify([])

    try:
        # Voláme funkci search_airports z flight_api.py
        token = get_access_token()
        data = search_airports(token, keyword)
        return jsonify(data)
    except Exception as e:
        # Logujeme chybu (např. 401 Unauthorized), ale vrátíme prázdné pole, 
        # aby se neshodila frontend aplikace
        print(f"Error fetching airports: {e}") 
        return jsonify([])

if __name__ == "__main__":
    print("🚀 Backend running at http://localhost:5000")
    # Zkontrolujte, že máte soubor flight_api.py uložen, než spustíte server!
    app.run(port=5000, debug=True)