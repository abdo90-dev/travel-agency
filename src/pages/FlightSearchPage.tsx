import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, Plane, MapPin } from 'lucide-react';
import FlightCard from '../components/flights/FlightCard';
import FlightFilters from '../components/flights/FlightFilters';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: { code: string; name: string; city: string };
  destination: { code: string; name: string; city: string };
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  currency: string;
  availableSeats: number;
  class: string;
  baggage: string;
}

export default function FlightSearchPage() {
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    maxPrice: 1000,
    airlines: [] as string[],
    departureTime: 'any',
    stops: 'any'
  });

  const searchCriteria = {
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    departure: searchParams.get('departure') || '',
    passengers: parseInt(searchParams.get('passengers') || '1')
  };

 useEffect(() => {
  const fetchFlights = async () => {
    if (!searchCriteria.origin || !searchCriteria.destination) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        origin: searchCriteria.origin,
        destination: searchCriteria.destination,
        departure: searchCriteria.departure,
        passengers: searchCriteria.passengers.toString()
      });

      const response = await fetch(`http://localhost:5000/api/flights/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch flights');
      }

      // ✅ Normalize flight offers for FlightCard
      const normalizedFlights = data.flights.map((offer: any) => {
        const firstItinerary = offer.itineraries[0];
        const firstSegment = firstItinerary.segments[0];
        const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];

        const travelerPricing = offer.travelerPricings?.[0];

        return {
          id: offer.id,
          airline: firstSegment.carrierCode,
          flightNumber: firstSegment.number,
          origin: {
            code: firstSegment.departure.iataCode,
            name: "", // optional
            city: ""  // optional
          },
          destination: {
            code: lastSegment.arrival.iataCode,
            name: "",
            city: ""
          },
          departure: firstSegment.departure.at,
          arrival: lastSegment.arrival.at,
          duration: firstItinerary.duration,
          price: parseFloat(offer.price.grandTotal),
          currency: offer.price.currency,
          availableSeats: offer.numberOfBookableSeats,
          class: travelerPricing?.fareDetailsBySegment?.[0]?.cabin || "Economy",
          baggage: travelerPricing?.fareDetailsBySegment?.[0]?.includedCheckedBags?.weight
            ? travelerPricing.fareDetailsBySegment[0].includedCheckedBags.weight + "kg"
            : "0kg"
        };
      });

      setFlights(normalizedFlights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  fetchFlights();
}, [searchParams]);


  const filteredFlights = flights.filter(flight => {
    if (flight.price > filters.maxPrice) return false;
    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!searchCriteria.origin || !searchCriteria.destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recherche de Vols</h2>
          <p className="text-gray-600">Veuillez effectuer une recherche pour voir les résultats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Summary */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 mr-2" />
                <span className="font-medium">{searchCriteria.origin}</span>
                <Plane className="h-4 w-4 mx-2 text-blue-600" />
                <span className="font-medium">{searchCriteria.destination}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">{searchCriteria.departure}</span>
              </div>
            </div>
            <div className="mt-2 md:mt-0">
              <span className="text-sm text-gray-600">
                {filteredFlights.length} vol{filteredFlights.length !== 1 ? 's' : ''} trouvé{filteredFlights.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FlightFilters filters={filters} onFiltersChange={setFilters} flights={flights} />
          </div>

          {/* Flight Results */}
          <div className="lg:col-span-3">
            {error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                  <Plane className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">Erreur de recherche</h3>
                  <p className="mt-2">{error}</p>
                </div>
              </div>
            ) : filteredFlights.length === 0 ? (
              <div className="text-center py-12">
                <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">Aucun vol trouvé</h3>
                <p className="text-gray-600 mt-2">
                  Essayez de modifier vos critères de recherche ou vos filtres.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFlights.map(flight => (
                  <FlightCard key={flight.id} flight={flight} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}