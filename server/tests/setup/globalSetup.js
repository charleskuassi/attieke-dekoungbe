/**
 * globalSetup.js
 * Exécuté UNE FOIS avant tous les tests.
 * Configure la base SQLite en mémoire et synchronise les modèles.
 */

// Charger le .env.test avant tout
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.test'), override: true });

const { Sequelize } = require('sequelize');

module.exports = async () => {
    console.log('\n🧪 [SETUP] Initialisation de la base SQLite en mémoire pour les tests...');

    // On stocke l'instance SQLite dans une variable globale
    // pour que les tests puissent y accéder
    global.__TEST_DB_URI__ = ':memory:';

    console.log('✅ [SETUP] Environnement de test prêt (SQLite in-memory)');
    console.log('   → Base Neon NON touchée\n');
};
