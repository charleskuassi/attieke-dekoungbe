const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  // --- MODE PRODUCTION (Ligne) ---
  console.log("🚀 Connexion à PostgreSQL (Neon)...");
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Nécessaire pour Neon/Render
      }
    }
  });
} else {
  // --- MODE DÉVELOPPEMENT (Local) ---
  console.log("🛠️ Connexion à SQLite (Local)...");
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // Le fichier local
    logging: false
  });
}

// Test de connexion
sequelize.authenticate()
  .then(() => console.log('✅ Base de données connectée avec succès.'))
  .catch(err => console.error('❌ Erreur de connexion BDD:', err));

module.exports = sequelize;
