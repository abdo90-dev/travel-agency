import React, { useState, useEffect } from 'react';
import { User, Plane, Calendar, CreditCard, Settings, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Booking {
  id: string;
  type: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  flightDetails?: {
    airline: string;
    flightNumber: string;
    route: string;
    departure: string;
    passengers: number;
  };
  pnr?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBookings(data.bookings);
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bonjour, {user?.firstName} !
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez vos réservations et votre profil
              </p>
            </div>
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <nav className="space-y-2">
                {[
                  { id: 'bookings', label: 'Mes Réservations', icon: Plane },
                  { id: 'invoices', label: 'Mes Factures', icon: FileText },
                  { id: 'profile', label: 'Mon Profil', icon: User },
                  { id: 'settings', label: 'Paramètres', icon: Settings }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm">
              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Réservations</h2>
                  
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Aucune réservation
                      </h3>
                      <p className="text-gray-600">
                        Vous n'avez pas encore effectué de réservation.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map(booking => (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Réservation #{booking.id}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {formatDate(booking.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status === 'confirmed' ? 'Confirmé' : 
                                 booking.status === 'pending' ? 'En attente' : 'Annulé'}
                              </span>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  {booking.totalAmount}€
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {booking.flightDetails && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Compagnie:</span>
                                  <p className="font-medium">{booking.flightDetails.airline}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Vol:</span>
                                  <p className="font-medium">{booking.flightDetails.flightNumber}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Route:</span>
                                  <p className="font-medium">{booking.flightDetails.route}</p>
                                </div>
                              </div>
                              {booking.pnr && (
                                <div className="mt-3">
                                  <span className="text-gray-600">PNR:</span>
                                  <span className="font-bold text-blue-600 ml-2">{booking.pnr}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Mon Profil</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom
                        </label>
                        <input
                          type="text"
                          value={user?.firstName || ''}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={user?.lastName || ''}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs placeholder */}
              {(activeTab === 'invoices' || activeTab === 'settings') && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {activeTab === 'invoices' ? 'Mes Factures' : 'Paramètres'}
                  </h2>
                  <div className="text-center py-12">
                    <p className="text-gray-600">
                      Cette section sera disponible bientôt.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}