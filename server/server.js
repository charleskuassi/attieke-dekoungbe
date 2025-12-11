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

// Security Middleware: Helmet
app.use(helmet());

// Security Middleware: Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Limit each IP to 5000 requests per windowMs (Dev Mode)
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// Specific Auth Limiter
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // Increased for development/testing
    message: "Too many login attempts, please try again later."
});

// Middleware
// CORS Security: Allow only frontend domain (and localhost for dev)
// CORS Security: Allow all for debugging
app.use(cors());
// const allowedOrigins = [
//     'http://localhost:5173',
//     'http://localhost:3000',
// ];
// app.use(cors({
//     origin: function (origin, callback) {
//         if (!origin) return callback(null, true);
//         if (allowedOrigins.indexOf(origin) === -1) {
//             const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//             return callback(new Error(msg), false);
//         }
//         return callback(null, true);
//     },
//     credentials: true
// }));

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


app.get('/', (req, res) => {
    res.send('Attièkè Dékoungbé API is running');
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
