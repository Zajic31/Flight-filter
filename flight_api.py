import requests
from config import CLIENT_ID, CLIENT_SECRET

def get_access_token():
    url = "https://test.api.amadeus.com/v1/security/oauth2/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
    }

    resp = requests.post(url, data=data)
    resp.raise_for_status()
    return resp.json()["access_token"]

def search_flights(token, origin, destination, date):
    url = "https://test.api.amadeus.com/v2/shopping/flight-offers"
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "originLocationCode": origin,
        "destinationLocationCode": destination,
        "departureDate": date,
        "adults": 1,
        "max": 10
    }

    resp = requests.get(url, headers=headers, params=params)
    resp.raise_for_status()
    return resp.json()
