import requests
from config import CLIENT_ID, CLIENT_SECRET

def get_access_token():
    """
    Získá přístupový token z Amadeus API.
    """
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
    """
    Vyhledá lety pomocí Amadeus Flight Search API.
    """
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

def search_airports(token, keyword):
    """
    Vyhledá letiště/města na základě klíčového slova pomocí Amadeus Location API.
    """
    url = "https://test.api.amadeus.com/v1/reference-data/locations"
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "keyword": keyword,
        "subType": "AIRPORT,CITY", 
        "view": "FULL",
        "page[limit]": 10
    }

    resp = requests.get(url, headers=headers, params=params)
    resp.raise_for_status() 
    
    # Zpracování výsledků pro frontend
    airport_results = []
    for item in resp.json().get('data', []):
        iata_code = item.get('iataCode')
        location_name = item.get('name')
        
        if iata_code and location_name:
            city_name = item.get('address', {}).get('cityName', '')
            country_name = item.get('address', {}).get('countryName', '')
            
            detail = f"{city_name}, {country_name}"
            
            if item.get('subType') == 'AIRPORT' and city_name != location_name:
                display_name = f"{location_name} ({city_name})"
            else:
                display_name = location_name

            airport_results.append({
                'iata': iata_code,
                'name': display_name,
                'detail': detail
            })
    return airport_results