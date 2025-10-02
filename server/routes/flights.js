import express from 'express';
import { readFileSync } from 'fs';
import amadeusPkg from 'amadeus';

const router = express.Router();

// Load airports.json for comprehensive city search
const airports = JSON.parse(
  readFileSync(new URL('./airports.json', import.meta.url))
);

// Amadeus client (for flight search)
const amadeus = new amadeusPkg({
  clientId: 'q3lnVxnPiKNiUkflpHlFotn5CiC8n3As',
  clientSecret: 'e5UR58GBCEPNauFS',
});

// ✅ Airport autocomplete using local JSON (better for city search)
router.get('/airports/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  const search = q.toString().toLowerCase();

  // Convert to array if needed
  const airportArray = Array.isArray(airports) ? airports : Object.values(airports);

  const results = airportArray
    .filter(a =>
      a.name?.toLowerCase().includes(search) ||
      a.city?.toLowerCase().includes(search) ||
      a.iata?.toLowerCase().includes(search)
    )
    .slice(0, 10)
    .map(a => ({
      code: a.iata,
      city: a.city,
      name: a.name,
      country: a.country
    }));
  
  res.json(results);
});

let cachedFlights = [];

// ✅ Flight search with Amadeus
router.get('/search', async (req, res) => {
  try {
    const { origin, destination, departure, passengers = 1 } = req.query;

    if (!origin || !destination || !departure) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate: departure,
      adults: passengers,
    });

    const flights = response.data;
    cachedFlights = response.data;

      
    if (!flights?.length) {
      return res.status(404).json({ message: 'No flights found' });
    }

    res.json({ flights });
  } catch (err) {
    console.error('Error fetching flight offers:', err);
    res.status(500).json({ error: 'Failed to fetch flight offers' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const flight = cachedFlights.find(f => f.id === req.params.id);

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    const firstItinerary = flight.itineraries?.[0];
    const firstSegment = firstItinerary?.segments?.[0];

    if (!firstSegment) {
      return res.status(500).json({ error: 'Invalid flight data' });
    }

    const detailedFlight = {
      id: flight.id,
      airline: firstSegment.carrierCode,
      flightNumber: firstSegment.number,
      origin: {
        code: firstSegment.departure?.iataCode,
        name: '', // you can enrich later with airport name
        city: ''
      },
      destination: {
        code: firstSegment.arrival?.iataCode,
        name: '',
        city: ''
      },
      departure: firstSegment.departure?.at,
      arrival: firstSegment.arrival?.at,
      duration: firstItinerary.duration,
      price: Number(flight.price?.total),
      currency: flight.price?.currency,

      // extra mock details
      aircraft: 'Boeing 737-800',
      services: ['WiFi', 'Meals', 'Entertainment'],
      seatMap: 'Available on request',
      cancellationPolicy: 'Free cancellation up to 24h before departure',
    };

    res.json(detailedFlight);
  } catch (error) {
    console.error('Error in /flights/:id', error);
    res.status(500).json({ error: 'Failed to fetch flight details' });
  }
});

export default router;