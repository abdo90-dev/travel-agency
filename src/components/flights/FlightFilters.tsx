import React from 'react';
import { Filter } from 'lucide-react';

interface Flight {
  airline: string;
  price: number;
}

interface Filters {
  maxPrice: number;
  airlines: string[];
  departureTime: string;
  stops: string;
}

interface FlightFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  flights: Flight[];
}

export default function FlightFilters({ filters, onFiltersChange, flights }: FlightFiltersProps) {
  const uniqueAirlines = [...new Set(flights.map(flight => flight.airline))];
  const maxPrice = Math.max(...flights.map(flight => flight.price), 500);

  const handleAirlineChange = (airline: string, checked: boolean) => {
    const newAirlines = checked
      ? [...filters.airlines, airline]
      : filters.airlines.filter(a => a !== airline);
    
    onFiltersChange({ ...filters, airlines: newAirlines });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center mb-6">
        <Filter className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Prix maximum</h4>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={maxPrice}
            value={filters.maxPrice}
            onChange={(e) => onFiltersChange({ ...filters, maxPrice: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>0€</span>
            <span className="font-medium">{filters.maxPrice}€</span>
            <span>{maxPrice}€</span>
          </div>
        </div>
      </div>

      {/* Airlines */}
      {uniqueAirlines.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Compagnies aériennes</h4>
          <div className="space-y-2">
            {uniqueAirlines.map(airline => (
              <label key={airline} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.airlines.includes(airline)}
                  onChange={(e) => handleAirlineChange(airline, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700">{airline}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Departure Time */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Heure de départ</h4>
        <div className="space-y-2">
          {[
            { value: 'any', label: 'Toute heure' },
            { value: 'morning', label: 'Matin (6h-12h)' },
            { value: 'afternoon', label: 'Après-midi (12h-18h)' },
            { value: 'evening', label: 'Soir (18h-24h)' }
          ].map(option => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="departureTime"
                value={option.value}
                checked={filters.departureTime === option.value}
                onChange={(e) => onFiltersChange({ ...filters, departureTime: e.target.value })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => onFiltersChange({
          maxPrice: maxPrice,
          airlines: [],
          departureTime: 'any',
          stops: 'any'
        })}
        className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Effacer tous les filtres
      </button>
    </div>
  );
}