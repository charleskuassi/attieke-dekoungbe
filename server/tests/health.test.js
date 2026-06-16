/**
 * health.test.js
 * Tests rapides pour les routes de santé et de base :
 *  - GET /api/health     → vérification que le serveur répond
 *  - GET /api/auth/test  → test de la route auth de base
 *  - GET /api/products   → route publique accessible
 *  - Route 404 API       → les routes API inconnues retournent JSON (pas HTML)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.test'), override: true });
delete process.env.DATABASE_URL;

const request = require('supertest');

// Mocker la base avec SQLite en mémoire
jest.mock('../config/database', () => {
    const { Sequelize } = require('sequelize');
    return new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
    });
});

const app = require('../app');

// ──────────────────────────────────────────────────────────────────────────────
// LIFECYCLE
// ──────────────────────────────────────────────────────────────────────────────
beforeAll(async () => {
    const db = require('../config/database');
    await db.sync({ force: true });
    console.log('✅ [health.test] Base SQLite synchronisée');
});

afterAll(async () => {
    const db = require('../config/database');
    await db.close();
});

// ──────────────────────────────────────────────────────────────────────────────
// TESTS
// ──────────────────────────────────────────────────────────────────────────────

describe('Health & Sanity Checks', () => {

    describe('GET /api/health', () => {
        it('devrait retourner 200 avec status ok', async () => {
            const res = await request(app).get('/api/health');
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('ok');
        });

        it('devrait inclure un timestamp ISO', async () => {
            const res = await request(app).get('/api/health');
            expect(res.body.timestamp).toBeDefined();
            expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
        });
    });

    describe('GET /api/auth/test', () => {
        it('devrait confirmer que les routes auth sont chargées', async () => {
            const res = await request(app).get('/api/auth/test');
            expect(res.statusCode).toBe(200);
        });
    });

    describe('GET /api/products (route publique)', () => {
        it('devrait être accessible sans authentification', async () => {
            const res = await request(app).get('/api/products');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('Gestion des routes inconnues', () => {
        it('une route API inconnue devrait retourner JSON 404 (pas HTML)', async () => {
            const res = await request(app).get('/api/route-qui-nexiste-pas');
            expect(res.statusCode).toBe(404);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toHaveProperty('message');
        });

        it('devrait retourner "API Route Not Found" pour les endpoints API manquants', async () => {
            const res = await request(app).get('/api/inexistant');
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toMatch(/not found/i);
        });
    });

    describe('CORS Headers', () => {
        it('devrait accepter les requêtes sans origine (ex: Postman, Supertest)', async () => {
            const res = await request(app)
                .get('/api/health')
                .set('Origin', ''); // Pas d'origine
            expect(res.statusCode).toBe(200);
        });
    });

});
