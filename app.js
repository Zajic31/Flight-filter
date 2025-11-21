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
        // absolutní URL na backend
        const res = await fetch(`http://localhost:5000/flights?from=${from}&to=${to}&date=${date}`);
        const data = await res.json();

        if (!data.data || data.data.length === 0) {
            resultsDiv.innerHTML = "<p>Žádné lety nenalezeny.</p>";
            return;
        }

        resultsDiv.innerHTML = ""; // vyčistit předchozí výsledky

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

    } catch (err) {
        resultsDiv.innerHTML = "Chyba při načítání letů: " + err;
    }
}
