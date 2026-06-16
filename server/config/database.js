const { Sequelize } = require('sequelize');
// override: false → les variables Hostinger hPanel ont priorité sur le fichier .env
require('dotenv').config({ override: false });

let sequelize;

let databaseUrl = process.env.DATABASE_URL;

// Nettoyage de sécurité si l'URL contient des guillemets (fréquent lors du copier-coller)
if (databaseUrl) {
  databaseUrl = databaseUrl.trim();
  if ((databaseUrl.startsWith("'") && databaseUrl.endsWith("'")) ||
      (databaseUrl.startsWith('"') && databaseUrl.endsWith('"'))) {
    databaseUrl = databaseUrl.slice(1, -1);
  }
}

if (databaseUrl) {
  // --- MODE PRODUCTION (PostgreSQL Neon) ---
  console.log("🚀 Connexion à PostgreSQL (Neon)...");

  let dialectModule;
  try {
    // @neondatabase/serverless : connexion via WebSocket (port 443 HTTPS)
    // → contourne les blocages de port 5432 sur les hébergeurs partagés
    const neonPkg = require('@neondatabase/serverless');
    const ws = require('ws');
    neonPkg.neonConfig.webSocketConstructor = ws;
    neonPkg.neonConfig.forceDisablePgSSL = true; // WebSocket gère le chiffrement nativement
    dialectModule = neonPkg;
    console.log("✅ Adaptateur Neon WebSocket actif (port 443)");
  } catch (e) {
    console.warn("⚠️ @neondatabase/serverless non trouvé, utilisation du driver pg standard");
    dialectModule = null;
  }

  const sequelizeOptions = {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };

  if (dialectModule) {
    // Utiliser Neon WebSocket driver (pas besoin de dialectOptions SSL)
    sequelizeOptions.dialectModule = dialectModule;
  } else {
    // Fallback: driver pg standard avec SSL désactivé (rejectUnauthorized: false)
    sequelizeOptions.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        connectTimeout: 10000
      }
    };
  }

  sequelize = new Sequelize(databaseUrl, sequelizeOptions);

} else {
  // --- MODE DÉVELOPPEMENT (Local avec SQLite) ---
  console.warn("⚠️ DATABASE_URL non trouvée. Utilisation de SQLite pour le développement local.");
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  });
}

// Test de connexion
sequelize.authenticate()
  .then(() => console.log('✅ Base de données connectée avec succès.'))
  .catch(err => {
    console.error('❌ Erreur de connexion BDD:', err.message || err);
    if (err.message && err.message.includes('SSL')) {
      console.error('💡 CONSEIL: Erreur SSL — vérifiez DATABASE_URL et les ports ouverts sur Hostinger');
    }
    if (err.message && err.message.includes('timeout')) {
      console.error('💡 CONSEIL: Timeout — le port 5432 est peut-être bloqué par Hostinger');
    }
  });

module.exports = sequelize;
