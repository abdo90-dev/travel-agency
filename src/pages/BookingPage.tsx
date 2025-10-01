import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plane, Users, CreditCard, Check } from 'lucide-react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';


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
}

export default function BookingPage() {
  const [booking, setBooking] = useState<any | null>(null);
  const stripe = useStripe();
const elements = useElements();
  const { flightId } = useParams();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
  passengers: [
    { 
      firstName: '', 
      lastName: '', 
      email: '', 
      phone: '',
      passportNumber: '', // optional
      birthDate: '',      // optional
    }
  ],
    extras: {
      insurance: false,
      priority: false,
      meal: false
    },
    payment: {
      cardNumber: '',
      expiry: '',
      cvv: '',
      name: ''
    }
  });

  useEffect(() => {
    const fetchFlight = async () => {
      if (!flightId) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/flights/${flightId}`);
        if (response.ok) {
          const flightData = await response.json();
          // console.log(flightData);
          
          setFlight(flightData);
        }
      } catch (error) {
        console.error('Failed to fetch flight:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
  }, [flightId]);

  const steps = [
    { id: 1, title: 'Passagers', icon: Users },
    { id: 2, title: 'Options', icon: Plane },
    { id: 3, title: 'Paiement', icon: CreditCard },
    { id: 4, title: 'Confirmation', icon: Check }
  ];
const handlePayment = async () => {
  if (!stripe || !elements || !flight) return;

  try {

    const token = localStorage.getItem('token');
    
    const res = await fetch(`http://localhost:5000/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
body: JSON.stringify({
  booking_type: 'flight',
  total_price: calculateTotal(),
  margin_applied: 0,
  passengers: bookingData.passengers?.map(p => ({
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email || '',
    phone: p.phone || '',
    passportNumber: p.passportNumber || null,
    birthDate: p.birthDate || null,

  })) || [],
}),
    });
console.log("check");

   const { booking, clientSecret } = await res.json();
setBooking(booking);

    // 2. Confirm payment
    const card = elements.getElement(CardElement);
    if (!card) return;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: {
          name: `${bookingData.passengers[0].firstName} ${bookingData.passengers[0].lastName}`,
          email: bookingData.passengers[0].email,
        },
      },
    });
console.log(result.paymentIntent?.status);

    if (result.error) {
      console.error(result.error.message);
      alert(`Paiement échoué: ${result.error.message}`);
    } else if (result.paymentIntent.status === 'succeeded') {
      alert('Paiement réussi ! Votre réservation est confirmée.');
      setCurrentStep(4);
await fetch("http://localhost:5000/api/confirmation/send-confirmation", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id: booking.id,
    provider_ref: booking.provider_ref,
    origin_city: flight.origin.city,
    origin_code: flight.origin.code,
    destination_city: flight.destination.city,
    destination_code: flight.destination.code,
    departureDate: new Date(flight.departure).toLocaleDateString("en-CA"),
    departureTime: new Date(flight.departure).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }),
    arrivalDate: new Date(flight.arrival).toLocaleDateString("en-CA"),
    arrivalTime: new Date(flight.arrival).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }),
    stops: "Direct",
    duration: flight.duration,
    cabinClass: "Economy",
    airline: flight.airline,
    flightNumber: flight.flightNumber,
    passengers: booking.passengers,
    total_price: booking.total_price,
    email: booking.passengers[0].email,
    travelerName: `${booking.passengers[0].first_name} ${booking.passengers[0].last_name}`,
    agencyRef: booking.provider_ref || booking.id
  }),
});

    }
  } catch (error) {
    console.error('Erreur paiement:', error);
  }
};

const addPassenger = () => {
  setBookingData(prev => ({
    ...prev,
    passengers: [
      ...prev.passengers,
      { 
        firstName: '', 
        lastName: '', 
        email: '', 
        phone: '', 
        passportNumber: '', 
        birthDate: '', 
        seatChoice: '', 
        baggageOption: '', 
        mealOption: '' 
      }
    ]
  }));
};


  const updatePassenger = (index: number, field: string, value: string) => {
    setBookingData(prev => ({
      ...prev,
      passengers: prev.passengers.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const calculateTotal = () => {
    if (!flight) return 0;
    let total = flight.price * bookingData.passengers.length;
    
    if (bookingData.extras.insurance) total += 15 * bookingData.passengers.length;
    if (bookingData.extras.priority) total += 25 * bookingData.passengers.length;
    if (bookingData.extras.meal) total += 18 * bookingData.passengers.length;
    
    return total;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vol non trouvé</h2>
          <p className="text-gray-600">Le vol demandé n'existe pas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-3 mr-8">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mr-8 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Step 1: Passengers */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Informations des passagers
                  </h2>
                  
                  {bookingData.passengers.map((passenger, index) => (
                    <div key={index} className="mb-8 p-6 border border-gray-200 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Passager {index + 1}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prénom
                          </label>
                          <input
                            type="text"
                            value={passenger.firstName}
                            onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom
                          </label>
                          <input
                            type="text"
                            value={passenger.lastName}
                            onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={passenger.email}
                            onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            value={passenger.phone}
                            onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addPassenger}
                    className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Ajouter un passager
                  </button>
                </div>
              )}

              {/* Step 2: Options */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Options supplémentaires
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">Assurance voyage</h3>
                        <p className="text-sm text-gray-600">Protection en cas d'annulation ou de retard</p>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-4 font-semibold">15€/passager</span>
                        <input
                          type="checkbox"
                          checked={bookingData.extras.insurance}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            extras: { ...prev.extras, insurance: e.target.checked }
                          }))}
                          className="h-5 w-5 text-blue-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">Embarquement prioritaire</h3>
                        <p className="text-sm text-gray-600">Montez à bord en premier</p>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-4 font-semibold">25€/passager</span>
                        <input
                          type="checkbox"
                          checked={bookingData.extras.priority}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            extras: { ...prev.extras, priority: e.target.checked }
                          }))}
                          className="h-5 w-5 text-blue-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">Repas à bord</h3>
                        <p className="text-sm text-gray-600">Repas chaud servi pendant le vol</p>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-4 font-semibold">18€/passager</span>
                        <input
                          type="checkbox"
                          checked={bookingData.extras.meal}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            extras: { ...prev.extras, meal: e.target.checked }
                          }))}
                          className="h-5 w-5 text-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Informations de paiement
                  </h2>
                      <div className="p-4 border border-gray-200 rounded-lg">
      <CardElement options={{
        style: {
          base: { fontSize: '16px', color: '#32325d', '::placeholder': { color: '#a0aec0' } },
        },
      }} />
    </div>

    <button
      onClick={handlePayment}
      className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Payer {calculateTotal()}€
    </button>
                
                      
                    
              
                  
                </div>
              )}
              {currentStep === 4 && bookingData && (
  <div className="text-center">
    <h2 className="text-2xl font-bold text-green-600 mb-4">
      🎉 Réservation confirmée !
    </h2>
    <p className="mb-6">Votre billet électronique est prêt.</p>

      <p className="text-lg text-gray-700">
      ✉️ Un email de confirmation avec votre billet a été envoyé à{" "}
      <span className="font-semibold">{bookingData.passengers[0].email}</span>.
    </p>
  </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  onClick={() => {
                    if (currentStep === 3) {
                      handlePayment();
                    }
                    setCurrentStep(Math.min(4, currentStep + 1))}}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {currentStep === 3 ? 'Payer '+ calculateTotal() +' €' : 'Suivant'}
                </button>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Résumé de la réservation
              </h3>
              
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">{flight.airline}</h4>
                  <p className="text-sm text-gray-600">{flight.flightNumber}</p>
                  <p className="text-sm text-gray-600">
                    {flight.origin.code} → {flight.destination.code}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(flight.departure).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Vol ({bookingData.passengers.length} passager{bookingData.passengers.length > 1 ? 's' : ''})</span>
                    <span>{flight.price * bookingData.passengers.length}€</span>
                  </div>
                  
                  {bookingData.extras.insurance && (
                    <div className="flex justify-between text-sm">
                      <span>Assurance voyage</span>
                      <span>{15 * bookingData.passengers.length}€</span>
                    </div>
                  )}
                  
                  {bookingData.extras.priority && (
                    <div className="flex justify-between text-sm">
                      <span>Embarquement prioritaire</span>
                      <span>{25 * bookingData.passengers.length}€</span>
                    </div>
                  )}
                  
                  {bookingData.extras.meal && (
                    <div className="flex justify-between text-sm">
                      <span>Repas à bord</span>
                      <span>{18 * bookingData.passengers.length}€</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{calculateTotal()}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}