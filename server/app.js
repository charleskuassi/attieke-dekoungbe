/**
 * app.js - Export de l'application Express sans démarrer le serveur.
 * Utilisé par Supertest pour les tests d'intégration.
 */
const path = require('path');
// Charger les variables d'env (le fichier .env.test sera utilisé automatiquement par Jest)
require('dotenv').config({ path: path.join(__dirname, '.env'), override: false });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const { sanitizeInput, authLimiter } = require('./middleware/security');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// --- CORS ---
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    'https://attieke-dekoungbe.com',
    'https://www.attieke-dekoungbe.com',
    'https://skyblue-yak-798569.hostingersite.com',
    'http://localhost:5173'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., from Supertest or curl)
        if (!origin) return callback(null, true);
        // Allow all Hostinger preview subdomains (*.hostingersite.com)
        if (origin.endsWith('.hostingersite.com')) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS Policy: Origin not allowed'), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// --- SECURITY ---
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false // Désactivé pour les tests
}));
app.use(hpp());

// --- BODY PARSING ---
app.use(express.json());

// --- PASSPORT ---
const passport = require('./config/passport');
app.use(passport.initialize());

// --- STATIC FILES ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));

// --- ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));
app.use('/api/zones', require('./routes/zoneRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

const promoController = require('./controllers/promoController');
const announcementController = require('./controllers/announcementController');
const { protect, admin } = require('./middleware/authMiddleware');

app.get('/api/promo', promoController.getPromo);
app.post('/api/admin/promo', protect, admin, promoController.updatePromo);
app.get('/api/announcement', announcementController.getAnnouncement);
app.post('/api/announcement', protect, admin, announcementController.updateAnnouncement);

app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/library', require('./routes/libraryRoutes'));
app.use('/api/admin/notifications', require('./routes/notificationRoutes'));
app.get('/api/images', require('./controllers/imageController').getImages);

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// --- 404 API CATCH-ALL ---
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ message: 'API Route Not Found' });
    }
    next();
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
