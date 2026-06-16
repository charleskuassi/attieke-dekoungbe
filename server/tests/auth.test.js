/**
 * auth.test.js
 * Tests d'intégration pour les routes d'authentification :
 *  - GET  /api/auth/test        → route sanity check
 *  - POST /api/auth/register    → inscription
 *  - POST /api/auth/login       → connexion
 *  - GET  /api/auth/me          → profil protégé
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.test'), override: true });
delete process.env.DATABASE_URL;

const request = require('supertest');

jest.mock('../config/database', () => {
    const { Sequelize } = require('sequelize');
    return new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
    });
});

const app = require('../app');
const { User } = require('../models');

// ──────────────────────────────────────────────────────────────────────────────
// DONNÉES DE TEST (téléphone 10 chiffres requis par Joi)
// ──────────────────────────────────────────────────────────────────────────────
const validUser = {
    name: 'Test User',
    email: 'authtest@example.com',
    password: 'Password123!',
    phone: '0022900000',
};

// ──────────────────────────────────────────────────────────────────────────────
// LIFECYCLE
// ──────────────────────────────────────────────────────────────────────────────
beforeAll(async () => {
    const db = require('../config/database');
    await db.sync({ force: true });
    console.log('✅ [auth.test] Base SQLite synchronisée');
});

afterAll(async () => {
    const db = require('../config/database');
    await db.close();
});

afterEach(async () => {
    await User.destroy({ where: {}, truncate: true });
});

// ──────────────────────────────────────────────────────────────────────────────
// TESTS
// ──────────────────────────────────────────────────────────────────────────────

describe('Auth Routes', () => {

    // ── Sanity check ────────────────────────────────────────────────────────
    describe('GET /api/auth/test', () => {
        it('devrait retourner 200 avec le message de confirmation', async () => {
            const res = await request(app).get('/api/auth/test');
            expect(res.statusCode).toBe(200);
            expect(res.text).toMatch(/Auth Routes Working/);
        });
    });

    // ── Inscription ─────────────────────────────────────────────────────────
    describe('POST /api/auth/register', () => {
        it('devrait créer un compte avec des données valides', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('userId');
            expect(res.body.message).toMatch(/réussie|vérifier/i);
        });

        it('devrait refuser si le mot de passe est trop court', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...validUser, password: '123' });

            expect(res.statusCode).toBe(400);
        });

        it("devrait refuser si l'email est invalide", async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...validUser, email: 'not-an-email' });

            expect(res.statusCode).toBe(400);
        });

        it('devrait refuser un email déjà utilisé', async () => {
            await request(app).post('/api/auth/register').send(validUser);
            const res = await request(app).post('/api/auth/register').send(validUser);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/exist|utilisé|already/i);
        });
    });

    // ── Connexion ───────────────────────────────────────────────────────────
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/api/auth/register').send(validUser);
            // Manuellement marquer comme vérifié dans SQLite
            await User.update({ isVerified: true }, { where: { email: validUser.email } });
        });

        it('devrait connecter un utilisateur avec des identifiants corrects', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: validUser.email, password: validUser.password });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', validUser.email);
        });

        it('devrait refuser avec un mauvais mot de passe', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: validUser.email, password: 'WrongPass999!' });

            expect(res.statusCode).toBe(400); // 400 is returned by authController.login for invalid credentials
        });

        it('devrait refuser avec un email inexistant', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'inconnu@example.com', password: validUser.password });

            expect(res.statusCode).toBe(400); // 400 is returned for invalid credentials
        });
    });

    // ── Route protégée /me ──────────────────────────────────────────────────
    describe('GET /api/auth/me', () => {
        it('devrait retourner 401 sans token', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.statusCode).toBe(401);
        });

        it('devrait retourner le profil avec un token valide', async () => {
            await request(app)
                .post('/api/auth/register')
                .send(validUser);

            const user = await User.findOne({ where: { email: validUser.email } });
            
            const verifyRes = await request(app)
                .post('/api/auth/verify-email')
                .send({ email: validUser.email, code: user.verificationCode });

            const token = verifyRes.body.token;

            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('email', validUser.email);
        });

        it('devrait retourner 401 avec un token invalide', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer TOKEN_INVALIDE_12345');

            expect(res.statusCode).toBe(401);
        });
    });

});
