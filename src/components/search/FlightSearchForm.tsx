import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, ArrowLeftRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AirportInput from "../../pages/AirportInput"
export default function FlightSearchForm() {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departure: '',
    return: '',
    passengers: 1,
    tripType: 'round-trip'
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query string for flight search
    const params = new URLSearchParams({
      origin: formData.from,
      destination: formData.to,
      departure: formData.departure,
      ...(formData.tripType === 'round-trip' && { return: formData.return }),
      passengers: formData.passengers.toString()
    });
    // console.log(formData.departure);
    
    navigate(`/flights?${params.toString()}`);
  };

  const handleSwap = () => {
    setFormData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
      {/* Trip Type Selector */}
      <div className="flex space-x-4 mb-6">
        <label className="flex items-center">
          <input
            type="radio"
            name="tripType"
            value="round-trip"
            checked={formData.tripType === 'round-trip'}
            onChange={(e) => setFormData(prev => ({ ...prev, tripType: e.target.value }))}
            className="mr-2"
          />
          <span className="text-gray-700">Aller-Retour</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="tripType"
            value="one-way"
            checked={formData.tripType === 'one-way'}
            onChange={(e) => setFormData(prev => ({ ...prev, tripType: e.target.value }))}
            className="mr-2"
          />
          <span className="text-gray-700">Aller Simple</span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* From/To Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Départ</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
<AirportInput
  value={formData.from}
  
  onChange={(val) => {
    console.log("Departure selected:", val);
    setFormData(prev => ({ ...prev, from: val }))
}}
  placeholder="Ville ou aéroport de départ"
/>
            </div>
          </div>

          <div className="flex justify-center items-end pb-3">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              <ArrowLeftRight className="h-5 w-5 text-blue-600" />
            </button>
          </div>

          <div className="md:col-span-2 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Arrivée</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
<AirportInput
  value={formData.to}
  onChange={(val) => {
    console.log("distination selected:", val);
    setFormData(prev => ({ ...prev, to: val }))
  
  }}
  placeholder="Ville ou aéroport d'arrivée"
/>
            </div>
          </div>
        </div>

        {/* Dates and Passengers Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de départ</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={formData.departure}
                onChange={(e) => setFormData(prev => ({ ...prev, departure: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {formData.tripType === 'round-trip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de retour</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.return}
                  onChange={(e) => setFormData(prev => ({ ...prev, return: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min={formData.departure}
                />
              </div>
            </div>
          )}

          <div className={formData.tripType === 'round-trip' ? '' : 'md:col-span-2'}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Passagers</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={formData.passengers}
                onChange={(e) => setFormData(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>
                    {num} passager{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center justify-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Rechercher</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
