// Build timestamp: 2026-03-13 00:58
// ⚠️ Désactiver la vérification SSL - requis pour Neon sur Hostinger Node.js 22
if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const hpp = require('hpp');
const { sequelize } = require('./models');
const { sanitizeInput, authLimiter } = require('./middleware/security');
// override: false → les variables déjà définies par Hostinger hPanel ne sont PAS écrasées par .env
require('dotenv').config({ path: path.join(__dirname, '.env'), override: false });

const app = express();
app.set('trust proxy', 1); // Trust Render Proxy for HTTPS
const PORT = process.env.PORT || 5000;

// --- SECURITY MIDDLEWARES ---
// 1. CORS FIRST (Critical for Vercel/Render communication)
// 1. CORS FIRST (Critical for Communication between LWS and Render)
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    'https://attiekedekoungbe.com',
    'https://www.attiekedekoungbe.com',
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
            console.error(`CORS Blocked Origin: ${origin}`);
            return callback(new Error(`CORS Policy: Origin ${origin} not allowed`), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));


// 2. Helmet (Security Headers)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Required for React
                'https://cdn.kkiapay.me', // KKiaPay payment widget
                'https://www.google.com',
                'https://www.gstatic.com',
                'https://maps.googleapis.com',
                'https://firebasemessaging.googleapis.com', // Firebase
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'", // Required for React/Tailwind
                'https://fonts.googleapis.com',
            ],
            fontSrc: [
                "'self'",
                'https://fonts.gstatic.com',
            ],
            imgSrc: [
                "'self'",
                'data:', // Base64 images
                'blob:',
                'https://res.cloudinary.com', // Cloudinary images
                'https://maps.googleapis.com',
                'https://maps.gstatic.com',
                'https://*.googleapis.com',
                'https://*.firebaseio.com',
            ],
            connectSrc: [
                "'self'",
                'https://api.attiekedekoungbe.com',
                'https://*.kkiapay.me', // KKiaPay API
                'https://identitytoolkit.googleapis.com', // Firebase Auth
                'https://firestore.googleapis.com', // Firebase Firestore
                'https://fcm.googleapis.com', // Firebase Cloud Messaging
                'https://maps.googleapis.com',
            ],
            frameSrc: [
                'https://www.google.com',
                'https://maps.google.com',
                'https://player.vimeo.com',
            ],
            workerSrc: ["'self'", 'blob:'],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [], // Force HTTPS
        },
    },
}));
app.use(hpp()); // Parameter Pollution Protection

// --- STANDARD MIDDLEWARES ---
app.use(express.json());
const passport = require('./config/passport');
app.use(passport.initialize());

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Permet de servir les images locales si besoin (Legacy)
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));

// --- ROUTES ---
// Auth Routes (Protected by Limiter)
// Auth Routes (Protected by Limiter - DISABLED)
app.use('/api/auth', require('./routes/authRoutes'));

// Core Business Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));
app.use('/api/zones', require('./routes/zoneRoutes')); // New Zones Route
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Communication & Content
app.use('/api/messages', require('./routes/messageRoutes'));
// Note: Promo/Announcement controllers should ideally be in separate route files, 
// but keeping them inline as per your structure is fine for now.
const promoController = require('./controllers/promoController');
const announcementController = require('./controllers/announcementController');
const { protect, admin } = require('./middleware/authMiddleware');

app.get('/api/promo', promoController.getPromo);
app.post('/api/admin/promo', protect, admin, promoController.updatePromo);

app.get('/api/announcement', announcementController.getAnnouncement);
app.post('/api/announcement', protect, admin, announcementController.updateAnnouncement);

// Admin & Tools Routes
app.use('/api/upload', require('./routes/uploadRoutes')); // Legacy Upload
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/library', require('./routes/libraryRoutes')); // Cloudinary Library
app.use('/api/admin/notifications', require('./routes/notificationRoutes'));

// Legacy Image Controller
app.get('/api/images', require('./controllers/imageController').getImages);

// --- HEALTH CHECK (No Rate Limiting - for cron-job.org) ---
// Cette route est utilisée pour garder le serveur éveillé sur Render et diagnostiquer les variables d'environnement
app.get('/api/health', (req, res) => {
    const rawDbUrl = process.env.DATABASE_URL || 'NOT_FOUND';
    let dbUrlStatus = 'NOT_FOUND';
    
    if (rawDbUrl !== 'NOT_FOUND') {
        // Masquer le mot de passe pour la sécurité
        const masked = rawDbUrl.replace(/:([^:@]+)@/, ':***@');
        const hasQuotes = (rawDbUrl.startsWith("'") && rawDbUrl.endsWith("'")) || 
                          (rawDbUrl.startsWith('"') && rawDbUrl.endsWith('"'));
        dbUrlStatus = {
            value: masked,
            length: rawDbUrl.length,
            hasQuotes: hasQuotes,
            startsWithPostgres: rawDbUrl.trim().startsWith('postgresql://') || rawDbUrl.trim().startsWith('postgres://')
        };
    }

    res.status(200).json({
        status: 'ok',
        databaseUrlDiagnostic: dbUrlStatus,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// --- DIAGNOSTIC ROUTE (For SSL & Network testing) ---
app.get('/api/diag', async (req, res) => {
    const results = {};
    const url = process.env.DATABASE_URL;
    const pg = require('pg');
    const https = require('https');

    // Test 1: Network to Neon HTTPS
    try {
        await new Promise((resolve) => {
            https.get('https://ep-still-tree-ag7tcryf.c-2.eu-central-1.aws.neon.tech', (response) => {
                results.httpsTest = `Success (Status Code: ${response.statusCode})`;
                resolve();
            }).on('error', (err) => {
                results.httpsTest = `Failed: ${err.message}`;
                resolve();
            });
        });
    } catch (e) {
        results.httpsTest = `Error: ${e.message}`;
    }

    // Test 2: Raw pg connection with rejectUnauthorized: false
    if (url) {
        try {
            const client = new pg.Client({
                connectionString: url,
                ssl: { rejectUnauthorized: false }
            });
            await client.connect();
            await client.end();
            results.rawPgFalse = "Success";
        } catch (err) {
            results.rawPgFalse = `Failed: ${err.message}`;
        }

        // Test 3: Raw pg connection with rejectUnauthorized: true
        try {
            const client = new pg.Client({
                connectionString: url,
                ssl: { rejectUnauthorized: true }
            });
            await client.connect();
            await client.end();
            results.rawPgTrue = "Success";
        } catch (err) {
            results.rawPgTrue = `Failed: ${err.message}`;
        }
    } else {
        results.databaseUrl = "MISSING";
    }

    // System info
    results.system = {
        nodeVersion: process.version,
        opensslVersion: process.versions.openssl,
        dbUrlLength: url ? url.length : 0,
        dbUrlMasked: url ? url.replace(/:([^:@]+)@/, ':***@') : 'NONE'
    };

    res.json(results);
});

// --- FRONTEND SERVING (PRODUCTION) ---
// Serve static files from the 'public' directory (where we copied the React build)
app.use(express.static(path.join(__dirname, 'public')));

// Handle React Routing, return all requests to React app
app.get('*', (req, res) => {
    // Check if request is for API to avoid returning HTML for 404 API calls
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ message: 'API Route Not Found' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- SERVER START ---
async function startServer() {
    // 1. On démarre le serveur IMMEDIATEMENT pour satisfaire Render
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} (Waking up...)`);
    });

    // 2. On lance la connexion DB en parallèle
    try {
        if (process.env.SKIP_DB_SYNC === 'true') {
            console.log('⏩ Skipping DB sync');
        } else {
            console.log('🚀 Connexion à PostgreSQL (Neon)...');
            await sequelize.sync({ alter: true });
            console.log("✅ Base de données synchronisée !");
        }
    } catch (err) {
        console.error('❌ Database connection error (will retry on next request):', err);
    }
}

startServer();