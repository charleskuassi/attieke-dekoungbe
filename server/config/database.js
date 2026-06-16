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

  // IMPORTANT: Sur Hostinger avec Node.js 22, rejectUnauthorized DOIT être false
  // pour les connexions vers Neon (le certificat de Neon n'est pas reconnu par le store Node.js par défaut)
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
        rejectUnauthorized: false,  // TOUJOURS false pour Neon sur Hostinger Node 22
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
      console.error('💡 CONSEIL SSL: Erreur de certificat SSL avec Neon sur Hostinger Node 22');
    }
    if (err.message && err.message.includes('timeout')) {
      console.error('💡 CONSEIL TIMEOUT: Le port 5432 est peut-être bloqué par votre hébergeur. Vérifiez les règles de pare-feu.');
    }
  });

module.exports = sequelize;
