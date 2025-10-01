import React from 'react';
import { Clock, Plane, Briefcase, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

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

interface FlightCardProps {
  flight: Flight;
}

export default function FlightCard({ flight }: FlightCardProps) {
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="p-6">
        {/* Airline and Flight Number */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{flight.airline}</h3>
            <p className="text-sm text-gray-600">{flight.flightNumber}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{flight.price}€</div>
            <p className="text-sm text-gray-600">par personne</p>
          </div>
        </div>

        {/* Flight Route and Times */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(flight.departure)}
            </div>
            <div className="text-sm text-gray-600">{formatDate(flight.departure)}</div>
            <div className="text-sm font-medium text-gray-900">{flight.origin.code}</div>
            <div className="text-xs text-gray-500">{flight.origin.city}</div>
          </div>

          <div className="flex-1 mx-6">
            <div className="relative">
              <div className="flex items-center justify-center">
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="mx-4 bg-blue-600 rounded-full p-2">
                  <Plane className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
              <div className="text-center mt-2">
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {flight.duration}
                </div>
                <div className="text-xs text-gray-500">Direct</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(flight.arrival)}
            </div>
            <div className="text-sm text-gray-600">{formatDate(flight.arrival)}</div>
            <div className="text-sm font-medium text-gray-900">{flight.destination.code}</div>
            <div className="text-xs text-gray-500">{flight.destination.city}</div>
          </div>
        </div>

        {/* Flight Details */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{flight.availableSeats} places disponibles</span>
          </div>
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-1" />
            <span>{flight.baggage}</span>
          </div>
          <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            {flight.class}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Prix total pour 1 passager
          </div>
          <Link
            to={`/booking/${flight.id}`}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            Sélectionner ce vol
          </Link>
        </div>
      </div>
    </div>
  );
}