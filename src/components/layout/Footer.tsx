import React from 'react';
import { Plane, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Plane className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">Niya First</span>
            </div>
            <p className="text-gray-400 text-sm">
              Votre agence de voyage de confiance pour des expériences inoubliables.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Liens Rapides</h3>
            <div className="space-y-2">
              <a href="/flights" className="block text-gray-400 hover:text-white transition-colors">
                Réserver un Vol
              </a>
              <a href="/hotels" className="block text-gray-400 hover:text-white transition-colors">
                Réserver un Hôtel
              </a>
              <a href="/packages" className="block text-gray-400 hover:text-white transition-colors">
                Packages Voyage
              </a>
              <a href="/deals" className="block text-gray-400 hover:text-white transition-colors">
                Offres Spéciales
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support Client</h3>
            <div className="space-y-2">
              <a href="/help" className="block text-gray-400 hover:text-white transition-colors">
                Centre d'Aide
              </a>
              <a href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                Nous Contacter
              </a>
              <a href="/terms" className="block text-gray-400 hover:text-white transition-colors">
                Conditions Générales
              </a>
              <a href="/privacy" className="block text-gray-400 hover:text-white transition-colors">
                Politique de Confidentialité
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+216 71 123 456</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span className="text-sm">contact@Niya-First.tn</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Tunis, Tunisie</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Niya First. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}