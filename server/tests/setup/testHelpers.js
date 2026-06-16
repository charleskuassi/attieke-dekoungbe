/**
 * testHelpers.js
 * Utilitaires partagés entre les suites de tests :
 *  - Initialisation d'une base SQLite en mémoire
 *  - Génération de tokens JWT de test
 *  - Création d'utilisateurs/produits de test dans la BDD SQLite
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.test'), override: true });

const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_super_secure_12345';

// =====================================================
// BASE DE DONNÉES DE TEST (SQLite en mémoire)
// =====================================================
let testSequelize = null;

/**
 * Initialise une connexion SQLite in-memory et synchronise tous les modèles.
 * À appeler dans beforeAll() de chaque suite de tests.
 */
async function initTestDb() {
    // Forcer SQLite en mémoire en supprimant DATABASE_URL
    delete process.env.DATABASE_URL;
    process.env.NODE_ENV = 'test';

    testSequelize = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
    });

    // Charger et réinitialiser les modèles avec cette connexion de test
    const { DataTypes } = require('sequelize');

    const User = require('../models/User');
    const Product = require('../models/Product');
    const Order = require('../models/Order');
    const OrderItem = require('../models/OrderItem');
    const Testimonial = require('../models/Testimonial');
    const Review = require('../models/Review');

    // Synchroniser les tables dans la DB de test
    await testSequelize.sync({ force: true });

    return testSequelize;
}

/**
 * Ferme la connexion de test proprement.
 * À appeler dans afterAll() de chaque suite.
 */
async function closeTestDb() {
    if (testSequelize) {
        await testSequelize.close();
        testSequelize = null;
    }
}

// =====================================================
// GÉNÉRATEURS DE TOKENS JWT
// =====================================================
function generateUserToken(userId = 1, role = 'customer') {
    return jwt.sign(
        { id: userId, role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
}

function generateAdminToken(userId = 99) {
    return jwt.sign(
        { id: userId, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
}

/**
 * Crée un utilisateur admin dans la base SQLite de test.
 * Retourne l'objet user ET son token JWT.
 */
async function createTestAdmin() {
    const { User } = require('../../models');
    const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
    const admin = await User.create({
        name: 'Test Admin',
        email: `admin_${Date.now()}@test.com`,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
    });
    const token = jwt.sign({ id: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    return { user: admin, token };
}

/**
 * Crée un utilisateur customer dans la base SQLite de test.
 * Retourne l'objet user ET son token JWT.
 */
async function createTestUser() {
    const { User } = require('../../models');
    const hashedPassword = await bcrypt.hash('UserPass123!', 10);
    const user = await User.create({
        name: 'Test User',
        email: `user_${Date.now()}@test.com`,
        password: hashedPassword,
        role: 'customer',
        isVerified: true,
    });
    const token = jwt.sign({ id: user.id, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });
    return { user, token };
}

// =====================================================
// DONNÉES DE TEST
// =====================================================
const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'Password123!',
    phone: '0022900000',   // 10 chiffres (format requis par Joi)
};

const testAdmin = {
    name: 'Test Admin',
    email: 'testadmin@example.com',
    password: 'AdminPass123!',
    phone: '0022900001',
    role: 'admin',
};

const testProduct = {
    name: 'Attiéké Poisson Test',
    description: 'Un délicieux plat de test',
    price: 2500,
    category: 'Plats principaux',
    image_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
    available: true,
};

module.exports = {
    initTestDb,
    closeTestDb,
    generateUserToken,
    generateAdminToken,
    createTestAdmin,
    createTestUser,
    testUser,
    testAdmin,
    testProduct,
    JWT_SECRET,
};
