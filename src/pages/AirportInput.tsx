import React, { useState, useRef } from "react";

interface AirportInputProps {
  value: string; // stores the actual IATA code (CDG, ALG...)
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function AirportInput({ value, onChange, placeholder }: AirportInputProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [displayValue, setDisplayValue] = useState(""); // what the user sees
  const debounceRef = useRef<any>(null);

  const fetchSuggestions = async (q: string) => {
    if (!q) return setSuggestions([]);
    try {
      const res = await fetch(`http://localhost:5000/api/flights/airports/search?q=${q}`);
      if (!res.ok) {
        setSuggestions([]);
        return;
      }
      const data = await res.json();
      // Filter to only include airports with IATA codes (required for Amadeus)
      const airportsWithIATA = data.filter((airport: { code: string; }) => airport.code && airport.code.trim() !== '');
      setSuggestions(airportsWithIATA.slice(0, 10));
    } catch {
      setSuggestions([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setDisplayValue(inputVal); // update visible text
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(inputVal), 300);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-black"
      />
      {suggestions.length > 0 && (
        <ul className="absolute bg-white border w-full mt-1 max-h-40 overflow-auto z-10 rounded shadow">
          {suggestions.map((a, index) => (
            <li
              key={a.code || `${a.city}-${index}`}
              onClick={() => {
                setSuggestions([]);
                setDisplayValue(`${a.city} (${a.code}) - ${a.name}`);
                onChange(a.code); 
              }}
              className="cursor-pointer px-2 py-1 hover:bg-blue-100 hover:text-black text-black"
            >
              {a.city} ({a.code}) - {a.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}