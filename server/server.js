const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { sequelize } = require('./models');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.set('trust proxy', 1); // Trust Render Proxy for HTTPS
const PORT = process.env.PORT || 5000;

const hpp = require('hpp');

// Security Middleware: Helmet (Headers Protection)
app.use(helmet());

// Security Middleware: HPP (Parameter Pollution Protection)
app.use(hpp());

// Security Middleware: Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true, // Legacy header
    legacyHeaders: false, // Legacy header
});
app.use(limiter);

// Specific Auth Limiter
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Strict limit for login/register
    message: "Too many login attempts, please try again later."
});

// Middleware
// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL // Production URL from env
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        // SECURITY NOTE: In strictly secured production, you might want to block no-origin requests,
        // but for now we allow them to permit server-to-server calls or tools like Postman if needed.
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            console.warn(`Blocked CORS request from: ${origin}`);
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
const passport = require('./config/passport');
app.use(passport.initialize());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Apply Auth Limiter to Auth Routes
// app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.get('/api/images', require('./controllers/imageController').getImages);

// Promo Routes
const promoController = require('./controllers/promoController');
const { protect, admin } = require('./middleware/authMiddleware');
app.get('/api/promo', promoController.getPromo);
app.post('/api/admin/promo', protect, admin, promoController.updatePromo);

// Announcement Routes
const announcementController = require('./controllers/announcementController');
app.get('/api/announcement', announcementController.getAnnouncement);
app.post('/api/announcement', protect, admin, announcementController.updateAnnouncement);

// Reservation Routes
// Reservation Routes
app.use('/api/reservations', require('./routes/reservationRoutes'));
// Message Routes
// Message Routes
app.use('/api/messages', require('./routes/messageRoutes'));
// Driver Routes
app.use('/api/drivers', require('./routes/driverRoutes'));
// Review/Complaint Routes
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Admin Maintenance Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/library', require('./routes/libraryRoutes'));
app.use('/api/admin/notifications', require('./routes/notificationRoutes'));


app.get('/', (req, res) => {
    res.send('Attièkè Dèkoungbé API is running');
});

// Start Server
async function startServer() {
    try {
        // Back to gentle sync, we will use a script to add the column
        if (process.env.SKIP_DB_SYNC === 'true') {
            console.log('Skipping DB sync because SKIP_DB_SYNC=true');
        } else {
            await sequelize.sync({ alter: true });
            console.log('Database connected (Sync OK)');
        }
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Unable to connect/sync database:', err);
        // Fallback or exit? For now, we want to know why.
    }
}

startServer();
