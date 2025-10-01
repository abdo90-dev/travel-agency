# TravelPro - Agence de Voyage

Une application complète d'agence de voyage construite avec React.js (frontend) et Node.js/Express (backend).

## 🚀 Fonctionnalités

### Frontend
- Interface responsive et mobile-first
- Recherche et réservation de vols
- Tunnel de réservation en 3 étapes
- Espace client (mes réservations, profil)
- Espace administrateur (statistiques, gestion)
- Authentification JWT
- Design inspiré des compagnies aériennes modernes

### Backend
- API REST avec Express.js
- Authentification JWT
- Middleware de sécurité (Helmet, CORS)
- Endpoints mockés prêts pour intégration d'APIs externes
- Structure modulaire et scalable

## 🛠️ Technologies

### Frontend
- React 18 + TypeScript
- React Router pour la navigation
- Tailwind CSS pour le styling
- Lucide React pour les icônes
- Context API pour la gestion d'état

### Backend
- Node.js + Express
- JWT pour l'authentification
- bcryptjs pour le hachage des mots de passe
- Helmet + CORS pour la sécurité
- Structure modulaire avec middleware

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd travel-agency-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration des variables d'environnement**
```bash
cp .env.example .env
# Modifiez les variables selon vos besoins
```

4. **Lancer en mode développement**
```bash
npm run dev
```

Cette commande lance simultanement :
- Frontend sur http://localhost:5173
- Backend sur http://localhost:5000

## 🌐 Déploiement sur Hostinger

### Préparation
1. **Build du frontend**
```bash
npm run build
```

2. **Structure recommandée pour Hostinger**
```
public_html/
├── index.html (et autres fichiers du build React)
├── assets/
├── api/ (backend Node.js)
└── .htaccess
```

### Configuration serveur
Créez un fichier `.htaccess` dans public_html :
```apache
RewriteEngine On

# Proxy API requests to Node.js backend
RewriteRule ^api/(.*)$ /api/index.js/$1 [L,QSA]

# React Router - redirect all requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Variables d'environnement production
Mettez à jour `.env` pour la production :
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=votre-clé-super-sécurisée-de-production
```

## 🔧 APIs à Intégrer

Le projet est préparé pour intégrer facilement ces APIs :

### 1. TBO (The Bus Office) - Vols
```javascript
// Dans server/routes/flights.js
const TBO_API_KEY = process.env.TBO_API_KEY;
const TBO_BASE_URL = 'https://api.tbo.com/v1';

// Remplacer les données mockées par de vrais appels API
```

### 2. Mystifly - Vols alternatif
```javascript
// Configuration similaire dans flights.js
const MYSTIFLY_API_KEY = process.env.MYSTIFLY_API_KEY;
```

### 3. Stripe - Paiements
```javascript
// Dans server/routes/payments.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Remplacer le paiement mocké par Stripe
```

### 4. Booking.com / Expedia - Hôtels
```javascript
// Dans server/routes/hotels.js
// Intégrer l'API de votre choix pour les hôtels
```

## 📱 Comptes de Test

### Client
- Email: `user@example.com`
- Mot de passe: `password123`

### Administrateur
- Email: `admin@example.com`
- Mot de passe: `admin123`

## 🎨 Design System

### Couleurs
- **Primaire**: Bleu (#0066CC)
- **Accent**: Orange (#FF6B35)
- **Succès**: Vert (#10B981)
- **Attention**: Jaune (#F59E0B)
- **Erreur**: Rouge (#EF4444)

### Typography
- **Headings**: Inter Bold
- **Body**: Inter Regular
- **UI**: Inter Medium

## 🔒 Sécurité

- JWT avec expiration 24h
- Hachage bcrypt pour les mots de passe
- Helmet.js pour les en-têtes de sécurité
- CORS configuré
- Validation des inputs
- Rate limiting (à ajouter en production)

## 📁 Structure du Projet

```
├── src/                     # Frontend React
│   ├── components/         # Composants réutilisables
│   ├── contexts/          # Context API (Auth, etc.)
│   ├── pages/             # Pages principales
│   └── utils/             # Utilitaires
├── server/                 # Backend Express
│   ├── routes/            # Routes API
│   ├── middleware/        # Middleware personnalisés
│   └── index.js           # Point d'entrée serveur
├── package.json
└── README.md
```

## 🚧 Prochaines Étapes

1. **Base de données**
   - Intégrer MongoDB/PostgreSQL
   - Migrer les données mockées

2. **APIs Réelles**
   - TBO pour les vols
   - Stripe pour les paiements
   - Booking.com pour les hôtels

3. **Fonctionnalités Avancées**
   - Notifications push
   - Chat support
   - Système de reviews
   - Multi-devise

4. **Performance**
   - Cache Redis
   - CDN pour les assets
   - Optimisation images

## 📞 Support

Pour toute question technique :
- Email: support@travelpro.tn
- Documentation API: `/api/docs` (à implémenter)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.