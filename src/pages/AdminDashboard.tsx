import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  Plane, 
  DollarSign,
  Calendar,
  Filter
} from 'lucide-react';

interface AdminStats {
  totalBookings: number;
  totalRevenue: number;
  currency: string;
  bookingsToday: number;
  revenueToday: number;
  bookingsByStatus: {
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  popularDestinations: Array<{
    destination: string;
    bookings: number;
    revenue: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  recentBookings: Array<{
    id: string;
    customer: string;
    destination: string;
    amount: number;
    status: string;
    date: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
  totalBookings: 0,
  totalRevenue: 0,
  currency: "EUR",
  bookingsToday: 0,
  revenueToday: 0,
  bookingsByStatus: {
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  },
  popularDestinations: [],
  monthlyRevenue: [],
  recentBookings: [],
});

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(response);
        
        if (response.ok) {
          const data = await response.json();
            const transformed = {
    ...data,
    bookingsByStatus: {
      confirmed: data.bookingsByStatus.find((b: { status: string; }) => b.status === "confirmed")?._count.status ?? 0,
      pending: data.bookingsByStatus.find((b: { status: string; }) => b.status === "pending")?._count.status ?? 0,
      cancelled: data.bookingsByStatus.find((b: { status: string; }) => b.status === "cancelled")?._count.status ?? 0,
    },
    popularDestinations: data.popularDestinations.map((d: any) => ({
      destination: d.destination ?? "Inconnu",
      bookings: d._count?.destination ?? 0,
      revenue: d._sum?.total_price ?? 0,
    })),
    monthlyRevenue: data.monthlyRevenue ?? [], // add safe fallback
    recentBookings: data.recentBookings ?? [],
  };
          setStats(transformed);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600">Impossible de charger les statistiques.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Administrateur
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble des performances et des ventes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Réservations totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Plane className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+{stats.bookingsToday}</span>
              <span className="text-gray-600 ml-1">aujourd'hui</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalRevenue.toLocaleString()}€
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+{stats.revenueToday}€</span>
              <span className="text-gray-600 ml-1">aujourd'hui</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Réservations confirmées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.bookingsByStatus.confirmed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-yellow-600">{stats.bookingsByStatus.pending}</span>
              <span className="text-gray-600 ml-1">en attente</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux d'annulation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((stats.bookingsByStatus.cancelled / stats.totalBookings) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <BarChart className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-red-600">{stats.bookingsByStatus.cancelled}</span>
              <span className="text-gray-600 ml-1">annulées</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Destinations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Destinations populaires
            </h3>
            <div className="space-y-4">
              {stats?.popularDestinations?.map((destination, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{destination.destination}</div>
                    <div className="text-sm text-gray-600">
                      {destination.bookings} réservations
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {destination.revenue.toLocaleString()}€
                    </div>
                    <div className="text-sm text-gray-600">revenus</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Revenus mensuels
            </h3>
            <div className="space-y-3">
              {stats?.monthlyRevenue?.map((month, index) => {
                const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue));
                const percentage = (month.revenue / maxRevenue) * 100;
                
                return (
                  <div key={index} className="flex items-center">
                    <div className="w-12 text-sm text-gray-600 font-medium">
                      {month.month}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-20 text-right text-sm font-medium text-gray-900">
                      {month.revenue.toLocaleString()}€
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Réservations récentes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-600">ID</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Client</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Destination</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Montant</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Statut</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentBookings?.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100">
                    <td className="py-4 text-sm font-medium text-gray-900">
                      {booking.id}
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {booking.customer}
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {booking.destination}
                    </td>
                    <td className="py-4 text-sm font-medium text-gray-900">
                      {booking.amount}€
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status === 'confirmed' ? 'Confirmé' : 
                         booking.status === 'pending' ? 'En attente' : 'Annulé'}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {new Date(booking.date).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}