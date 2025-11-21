// app.js

// --- 1. STATICKÝ SEZNAM LETIŠŤ (25 záznamů) ---
// Tento seznam nahrazuje volání Amadeus API pro autocomplete.
const AIRPORTS = [
    // Česká letiště
    { iata: 'PRG', name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czechia' },
    { iata: 'BRQ', name: 'Brno–Tuřany Airport', city: 'Brno', country: 'Czechia' },
    { iata: 'OSR', name: 'Leoš Janáček Airport Ostrava', city: 'Ostrava', country: 'Czechia' },
    { iata: 'PED', name: 'Pardubice Airport', city: 'Pardubice', country: 'Czechia' },
    { iata: 'KLV', name: 'Karlovy Vary Airport', city: 'Karlovy Vary', country: 'Czechia' },
    
    // Hlavní evropské destinace
    { iata: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria' },
    { iata: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
    { iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
    { iata: 'BER', name: 'Berlin Brandenburg Airport', city: 'Berlin', country: 'Germany' },
    { iata: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland' },
    { iata: 'KRK', name: 'Kraków John Paul II International Airport', city: 'Krakow', country: 'Poland' },
    { iata: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom' },
    { iata: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
    { iata: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
    { iata: 'FCO', name: 'Rome–Fiumicino International Airport', city: 'Rome', country: 'Italy' },
    { iata: 'BCN', name: 'Barcelona–El Prat Airport', city: 'Barcelona', country: 'Spain' },
    { iata: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', country: 'Spain' },
    { iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
    { iata: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece' },
    
    // Globální destinace
    { iata: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA' },
    { iata: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA' },
    { iata: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE' },
    { iata: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
    { iata: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China' },
    { iata: 'SYD', name: 'Sydney Airport', city: 'Sydney', country: 'Australia' },
];


document.getElementById("searchBtn").addEventListener("click", loadFlights);

async function loadFlights() {
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    const date = document.getElementById("date").value;
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "Loading...";

    if (!from || !to || !date) {
        alert("Vyplň všechny údaje!");
        resultsDiv.innerHTML = "";
        return;
    }

    try {
        // Zde zůstává volání Python backendu pro hledání letů (vyžaduje spuštěný server)
        const res = await fetch(`http://localhost:5000/flights?from=${from}&to=${to}&date=${date}`);
        const data = await res.json();

        if (data.error) {
            resultsDiv.innerHTML = `<p>Chyba při hledání letů: ${data.error}</p>`;
            return;
        }

        if (!data.data || data.data.length === 0) {
            resultsDiv.innerHTML = "<p>Žádné lety nenalezeny.</p>";
            return;
        }

        resultsDiv.innerHTML = ""; 

        data.data.forEach(offer => {
            offer.itineraries.forEach(itinerary => {
                const segments = itinerary.segments;
                const first = segments[0];
                const last = segments[segments.length - 1];

                const dep = first.departure.at;
                const arr = last.arrival.at;
                const airline = first.carrierCode;
                const duration = itinerary.duration;
                const price = offer.price.total;

                const card = document.createElement("div");
                card.className = "flight-card";

                card.innerHTML = `
                    <p><strong>${from} → ${to}</strong></p>
                    <p>Odlet: ${dep}</p>
                    <p>Přílet: ${arr}</p>
                    <p>Aerolinka: ${airline}</p>
                    <p>Délka letu: ${duration}</p>
                    <p>Cena: ${price} EUR</p>
                `;

                resultsDiv.appendChild(card);
            });
        });

    } catch (error) {
        resultsDiv.innerHTML = `<p>Chyba připojení k backendu: Ujistěte se, že Python server běží na http://localhost:5000</p>`;
        console.error("Error fetching flights:", error);
    }
}


// --- 2. LOKÁLNÍ AUTOSUGESCE (Rychlé filtrování v prohlížeči) ---

// Debounce funkce (pro výkon, i když je volání rychlé)
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Funkce pro filtrování statických dat a plnění datalistu
function filterAirports(inputElement, datalistElement) {
    const query = inputElement.value.trim().toLowerCase();
    
    datalistElement.innerHTML = ''; 

    // Hledáme jen, když je délka dotazu alespoň 1 znak
    if (query.length === 0) {
        return;
    }

    // Filtr statického seznamu AIRPORTS
    const matchedAirports = AIRPORTS.filter(airport => {
        // Hledání shody v IATA kódu, názvu letiště nebo názvu města
        return airport.iata.toLowerCase().includes(query) || 
               airport.name.toLowerCase().includes(query) || 
               airport.city.toLowerCase().includes(query);
    });

    // Naplníme datalist
    // Limit 10, aby se nezobrazilo příliš mnoho možností
    matchedAirports.slice(0, 10).forEach(airport => {
        const option = document.createElement('option');
        // Hodnota je IATA kód (klíčový pro hledání letů)
        option.value = airport.iata; 
        // Zobrazovaný text
        option.textContent = `${airport.iata} - ${airport.name} (${airport.city}, ${airport.country})`;
        
        datalistElement.appendChild(option);
    });
}

// Získáme input a datalist elementy
const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const fromDatalist = document.getElementById("from-list");
const toDatalist = document.getElementById("to-list");

// Vytvoříme debouncované funkce
const debouncedFromSearch = debounce(() => filterAirports(fromInput, fromDatalist), 100);
const debouncedToSearch = debounce(() => filterAirports(toInput, toDatalist), 100);

// Připojíme event listenery
fromInput.addEventListener("input", debouncedFromSearch);
toInput.addEventListener("input", debouncedToSearch);