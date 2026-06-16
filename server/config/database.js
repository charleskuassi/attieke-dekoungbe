const { Sequelize } = require('sequelize');
// override: false → les variables Hostinger hPanel ont priorité sur le fichier .env
require('dotenv').config({ override: false });

let sequelize;

let databaseUrl = process.env.DATABASE_URL;

// Nettoyage de sécurité si l'URL contient des guillemets (fréquent lors du copier-coller)
if (databaseUrl) {
  databaseUrl = databaseUrl.trim();
  // Supprimer les guillemets simples ou doubles entourant l'URL
  if ((databaseUrl.startsWith("'") && databaseUrl.endsWith("'")) || 
      (databaseUrl.startsWith('"') && databaseUrl.endsWith('"'))) {
    databaseUrl = databaseUrl.slice(1, -1);
  }
}

if (databaseUrl) {
  // --- MODE PRODUCTION (PostgreSQL Neon) ---
  console.log("🚀 Connexion à PostgreSQL (Neon)...");

  // Déterminer le mode SSL selon la variable d'env
  // Sur Hostinger, rejectUnauthorized: false est souvent nécessaire
  const isHostinger = process.env.HOSTING_PROVIDER === 'hostinger';
  // Par défaut, désactiver le rejet SSL non autorisé en production (requis pour Neon sur Hostinger)
  let rejectUnauthorized = false;
  if (process.env.SSL_REJECT_UNAUTHORIZED === 'true') {
    rejectUnauthorized = true;
  }

  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: rejectUnauthorized, // Mettre SSL_REJECT_UNAUTHORIZED=false dans .env si erreur SSL
        // Timeout de connexion étendu pour les hébergeurs partagés
        connectTimeout: 10000
      }
    }
  });
} else {
  // --- MODE DÉVELOPPEMENT (Local) ---
  console.warn("⚠️ DATABASE_URL non trouvée. Utilisation de SQLite pour le développement local.");
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  });
}

// Test de connexion avec message d'aide en cas d'erreur SSL
sequelize.authenticate()
  .then(() => console.log('✅ Base de données connectée avec succès.'))
  .catch(err => {
    console.error('❌ Erreur de connexion BDD:', err.message || err);
    if (err.message && err.message.includes('SSL')) {
      console.error('💡 CONSEIL SSL: Ajoutez SSL_REJECT_UNAUTHORIZED=false dans vos variables d\'environnement Hostinger');
    }
    if (err.message && err.message.includes('timeout')) {
      console.error('💡 CONSEIL TIMEOUT: Le port 5432 est peut-être bloqué par votre hébergeur. Vérifiez les règles de pare-feu.');
    }
  });

module.exports = sequelize;
