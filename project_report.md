# Rapport de Projet : Attièkè Dékoungbé

## 1. Vue d'ensemble
Le projet **Attièkè Dékoungbé** est une plateforme e-commerce moderne dédiée à la vente et à la livraison de plats traditionnels. L'application offre une expérience utilisateur fluide, de la commande au paiement, avec une interface d'administration complète pour la gestion de l'activité.

## 2. Stack Technique
- **Frontend** : React.js (Vite), TailwindCSS, Lucide React (Icônes), Recharts (Graphiques).
- **Backend** : Node.js, Express.js.
- **Base de Données** : SQLite (avec ORM Sequelize).
- **Paiement** : Intégration KKiaPay (Mobile Money).
- **Authentification** : JWT (JSON Web Tokens).

## 3. Fonctionnalités Clés

### Côté Client
- **Catalogue Interactif** : Affichage des plats avec images, descriptions et prix.
- **Panier Dynamique** : Gestion en temps réel des articles (ajout, suppression, quantités).
- **Checkout Sécurisé** :
  - Validation stricte des numéros de téléphone (Format Bénin : 10 chiffres, préfixe 01).
  - Intégration KKiaPay pour les paiements Mobile Money.
  - Mode "Démo" pour tester le flux sans transaction réelle.
- **Espace Client** : Suivi de l'historique des commandes et des statuts.

### Côté Administrateur
- **Tableau de Bord (Dashboard)** :
  - Statistiques en temps réel (Ventes du jour, Commandes en attente).
  - Graphique d'évolution des ventes sur 30 jours.
- **Gestion des Commandes** :
  - Liste complète avec détails (Client, Articles, Total).
  - Mise à jour du statut en un clic (Payé -> En cuisine -> Livré).
- **Gestion Clients** : Vue d'ensemble de la base utilisateurs.

## 4. Structure du Projet

### Arborescence Client (`/client/src`)
- **Pages Principales** :
  - `Home.jsx` : Page d'accueil (Vitrine).
  - `Menu.jsx` : Catalogue des produits.
  - `Checkout.jsx` : Processus de paiement (Multi-étapes).
  - `Admin.jsx` : Dashboard administrateur (Gestion complète).
  - `ClientDashboard.jsx` : Espace client.
  - `Reviews.jsx` : Page des avis clients.
  - `Reservation.jsx` : Réservation de tables/événements.

### Scripts Serveur Utilitaires (`/server/scripts`)
Le backend dispose de nombreux scripts de maintenance et de débogage :
- `seed_real_menu.js` : Initialisation de la base avec le menu réel.
- `debug_orders*.js` : Outils d'analyse des commandes et transactions.
- `fix_db_bug.js`, `remove_orderitems_orderid_unique.js` : Correctifs de structure BDD.
- `create_admin.js` : Création rapide d'un compte admin.

## 5. État d'Avancement et Correctifs Récents
Le projet est en phase **"Production Ready"** (Prêt pour la production).

### Correctifs Apportés (Dernière Session)
1.  **Stabilité de la Base de Données** :
    - Correction d'une contrainte `UNIQUE` erronée qui empêchait l'ajout de plusieurs articles par commande.
    - Ajout de la colonne `transaction_id` pour le suivi des paiements.
2.  **Robustesse du Checkout** :
    - Réécriture complète de la logique de validation et de soumission.
    - Gestion des erreurs améliorée (Feedback utilisateur clair).
3.  **Fiabilité du Backend** :
    - Transactions atomiques pour la création de commande (garantit l'intégrité des données).
    - Logs détaillés pour le débogage.

## 6. Prochaines Étapes
- **Déploiement** : Mise en ligne sur un serveur VPS ou une plateforme Cloud (Render, Vercel + Railway).
- **Notifications SMS** : Intégration d'une API SMS pour notifier les clients en temps réel.

---
**Statut Global : ✅ OPÉRATIONNEL**
Le système est fonctionnel, testé et prêt pour la démonstration client.
