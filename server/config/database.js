const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  // --- MODE PRODUCTION (PostgreSQL Neon) ---
  console.log("🚀 Connexion à PostgreSQL (Neon)...");
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
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

// Test de connexion
sequelize.authenticate()
  .then(() => console.log('✅ Base de données connectée avec succès.'))
  .catch(err => console.error('❌ Erreur de connexion BDD:', err));

module.exports = sequelize;
