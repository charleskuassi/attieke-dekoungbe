/**
 * products.test.js
 * Tests d'intégration pour les routes de produits :
 *  - GET  /api/products          → liste publique
 *  - POST /api/products          → création (admin seulement)
 *  - PUT  /api/products/:id      → mise à jour (admin seulement)
 *  - DELETE /api/products/:id    → suppression (admin seulement)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.test'), override: true });
delete process.env.DATABASE_URL;

const request = require('supertest');
const { createTestAdmin, createTestUser, testProduct } = require('./setup/testHelpers');

// Mocker la base de données avec SQLite en mémoire
jest.mock('../config/database', () => {
    const { Sequelize } = require('sequelize');
    return new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
    });
});

const app = require('../app');
const { Product, User } = require('../models');

// ──────────────────────────────────────────────────────────────────────────────
// LIFECYCLE
// ──────────────────────────────────────────────────────────────────────────────
beforeAll(async () => {
    const db = require('../config/database');
    await db.sync({ force: true });
    console.log('✅ [products.test] Base SQLite synchronisée');
});

afterAll(async () => {
    const db = require('../config/database');
    await db.close();
});

afterEach(async () => {
    await Product.destroy({ where: {}, truncate: true });
    await User.destroy({ where: {}, truncate: true });
});

// ──────────────────────────────────────────────────────────────────────────────
// TESTS
// ──────────────────────────────────────────────────────────────────────────────

describe('Product Routes', () => {

    // ── GET /api/products ────────────────────────────────────────────────────
    describe('GET /api/products', () => {
        it('devrait retourner une liste vide si aucun produit', async () => {
            const res = await request(app).get('/api/products');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('devrait retourner les produits existants', async () => {
            await Product.bulkCreate([
                testProduct,
                { ...testProduct, name: 'Attiéké Bœuf Test', price: 3000 },
            ]);

            const res = await request(app).get('/api/products');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThanOrEqual(2);
        });

        it('devrait être accessible sans authentification', async () => {
            const res = await request(app).get('/api/products');
            expect(res.statusCode).not.toBe(401);
        });
    });

    // ── POST /api/products ───────────────────────────────────────────────────
    describe('POST /api/products', () => {
        it('devrait refuser sans token (401)', async () => {
            const res = await request(app)
                .post('/api/products')
                .send(testProduct);
            expect(res.statusCode).toBe(401);
        });

        it('devrait refuser avec un token utilisateur non-admin (403)', async () => {
            const { token } = await createTestUser();
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${token}`)
                .send(testProduct);
            expect([401, 403]).toContain(res.statusCode);
        });

        it('devrait créer un produit avec un token admin valide', async () => {
            const { token } = await createTestAdmin();
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${token}`)
                .send(testProduct);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('name', testProduct.name);
            expect(res.body).toHaveProperty('price', testProduct.price);
        });

        it('devrait refuser si le nom est manquant', async () => {
            const { token } = await createTestAdmin();
            const { name, ...productWithoutName } = testProduct;

            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${token}`)
                .send(productWithoutName);

            expect([400, 422, 500]).toContain(res.statusCode);
        });
    });

    // ── PUT /api/products/:id ────────────────────────────────────────────────
    describe('PUT /api/products/:id', () => {
        it('devrait mettre à jour un produit avec un token admin', async () => {
            const product = await Product.create(testProduct);
            const { token } = await createTestAdmin();

            const res = await request(app)
                .put(`/api/products/${product.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ price: 9999 });

            expect(res.statusCode).toBe(200);
            expect(res.body.price).toBe(9999);
        });

        it('devrait retourner 404 pour un produit inexistant', async () => {
            const { token } = await createTestAdmin();
            const res = await request(app)
                .put('/api/products/999999')
                .set('Authorization', `Bearer ${token}`)
                .send({ price: 9999 });

            expect(res.statusCode).toBe(404);
        });
    });

    // ── DELETE /api/products/:id ─────────────────────────────────────────────
    describe('DELETE /api/products/:id', () => {
        it('devrait supprimer un produit avec un token admin', async () => {
            const product = await Product.create(testProduct);
            const { token } = await createTestAdmin();

            const res = await request(app)
                .delete(`/api/products/${product.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);

            const deleted = await Product.findByPk(product.id);
            expect(deleted).toBeNull();
        });

        it('devrait refuser sans token', async () => {
            const product = await Product.create(testProduct);
            const res = await request(app).delete(`/api/products/${product.id}`);
            expect(res.statusCode).toBe(401);
        });
    });

});
