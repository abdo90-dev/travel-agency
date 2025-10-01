import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Plane, Hotel, Package, Star, Users, Shield, Clock } from 'lucide-react';
import FlightSearchForm from '../components/search/FlightSearchForm';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(37, 99, 235, 0.8), rgba(29, 78, 216, 0.8)), url("https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Votre Prochaine Aventure
            <br />
            <span className="text-orange-400">Commence Ici</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Des vols aux meilleurs prix, des hôtels de qualité, une expérience inoubliable
          </p>
          
          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <FlightSearchForm />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour un voyage parfait
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plane className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Réservation de Vols</h3>
              <p className="text-gray-600 mb-6">
                Comparez et réservez des vols aux meilleurs prix avec les meilleures compagnies aériennes.
              </p>
              <Link 
                to="/flights" 
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Rechercher des Vols
              </Link>
            </div>

            <div className="text-center p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Hotel className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Réservation d'Hôtels</h3>
              <p className="text-gray-600 mb-6">
                Découvrez des hôtels de qualité dans le monde entier avec des tarifs préférentiels.
              </p>
              <Link 
                to="/hotels" 
                className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Trouver des Hôtels
              </Link>
            </div>

            <div className="text-center p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Packages Voyage</h3>
              <p className="text-gray-600 mb-6">
                Des packages tout compris pour des vacances sans stress avec vol + hôtel.
              </p>
              <Link 
                to="/packages" 
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Voir les Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir Niya First ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Meilleurs Prix</h3>
              <p className="text-gray-600">Garantie du meilleur prix ou remboursement de la différence</p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Paiement Sécurisé</h3>
              <p className="text-gray-600">Transactions protégées avec les dernières technologies</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Réservation Rapide</h3>
              <p className="text-gray-600">Processus de réservation simple et en quelques clics</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à Partir ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez des milliers de voyageurs qui nous font confiance
          </p>
          <Link 
            to="/register" 
            className="inline-block bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Créer Mon Compte Gratuitement
          </Link>
        </div>
      </section>
    </div>
  );
}