const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const hpp = require('hpp');
const { sequelize } = require('./models');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.set('trust proxy', 1); // Trust Render Proxy for HTTPS
const PORT = process.env.PORT || 5000;

// --- SECURITY MIDDLEWARES ---
app.use(helmet()); // Headers Protection
app.use(hpp()); // Parameter Pollution Protection

// Global Rate Limiter (Anti-DDoS léger) - DISABLED FOR DEBUG
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per windowMs
//     message: "Too many requests from this IP, please try again later.",
//     standardHeaders: true,
//     legacyHeaders: false,
// });
// app.use(limiter);

// Specific Auth Limiter (Anti-Brute Force) - DISABLED FOR DEBUG
// const authLimiter = rateLimit({
//     windowMs: 60 * 60 * 1000, // 1 hour
//     max: 20, // Max 20 login attempts per hour per IP
//     message: "Too many login attempts, please try again later."
// });

// --- CORS CONFIGURATION (PERMISSIVE DEBUG) ---
app.use(cors({
    origin: true, // Allow ALL origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));
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

// Health Check
app.get('/', (req, res) => {
    res.send('Attièkè Dèkoungbé API is running 🚀');
});

// --- SERVER START ---
async function startServer() {
    try {
        if (process.env.SKIP_DB_SYNC === 'true') {
            console.log('⏩ Skipping DB sync (SKIP_DB_SYNC=true)');
        } else {
            // ALTER: true est la clé pour ne pas effacer les données
            await sequelize.sync({ alter: true });
            console.log("✅ Base de données synchronisée (Données conservées)");
        }
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Unable to connect/sync database:', err);
    }
}

startServer();