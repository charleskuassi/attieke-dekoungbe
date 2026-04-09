const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, sanitizeInput } = require('../middleware/security');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/validationSchemas');

// Base prefix: /api/auth

// Sanitize all inputs on auth routes
router.use(sanitizeInput);

router.get('/test', (req, res) => {
    res.send('Auth Routes Working');
});

// Registration
router.post('/register', authLimiter, validate(registerSchema), (req, res, next) => {
    if (typeof authController.register !== 'function') return res.status(500).json({ error: 'Auth registration not loaded' });
    authController.register(req, res, next);
});

// Login
router.post('/login', authLimiter, validate(loginSchema), (req, res, next) => {
    if (typeof authController.login !== 'function') return res.status(500).json({ error: 'Auth login not loaded' });
    authController.login(req, res, next);
});

// Verify Email
router.post('/verify-email', (req, res, next) => {
    if (typeof authController.verifyEmail !== 'function') return res.status(500).json({ error: 'Auth verification not loaded' });
    authController.verifyEmail(req, res, next);
});

// Forgot Password
router.post('/forgot-password', (req, res, next) => {
    if (typeof authController.forgotPassword !== 'function') return res.status(500).json({ error: 'Auth forgot-password not loaded' });
    authController.forgotPassword(req, res, next);
});

// Reset Password
router.put('/reset-password/:token', (req, res, next) => {
    if (typeof authController.resetPassword !== 'function') return res.status(500).json({ error: 'Auth reset-password not loaded' });
    authController.resetPassword(req, res, next);
});

// Profile Management
router.put('/profile', protect, (req, res, next) => {
    if (typeof authController.updateProfile !== 'function') return res.status(500).json({ error: 'Auth profile update not loaded' });
    authController.updateProfile(req, res, next);
});

// FCM Token Update
router.put('/fcm-token', protect, (req, res, next) => {
    if (typeof authController.updateFcmToken !== 'function') return res.status(500).json({ error: 'Auth FCM-token not loaded' });
    authController.updateFcmToken(req, res, next);
});

// Get Me
router.get('/me', protect, (req, res, next) => {
    if (typeof authController.getMe !== 'function') return res.status(500).json({ error: 'Auth get-me not loaded' });
    authController.getMe(req, res, next);
});

// Google Auth Routes
if (process.env.GOOGLE_CLIENT_ID) {
    router.get('/google', (req, res, next) => {
        const state = req.query.state || 'web';
        passport.authenticate('google', { session: false, scope: ['profile', 'email'], state })(req, res, next);
    });

    router.get('/google/callback', (req, res, next) => {
        passport.authenticate('google', { session: false }, (err, user, info) => {
            if (err || !user) {
                console.error("GOOGLE AUTH ERROR:", err || "No user");
                return res.redirect(`${process.env.FRONTEND_URL || ''}/login?error=google_failed`);
            }
            req.user = user;
            try {
                const token = jwt.sign(
                    { id: user.id, role: user.role },
                    process.env.JWT_SECRET || 'your_super_secret_key',
                    { expiresIn: '1d' }
                );
                return res.redirect(`${process.env.FRONTEND_URL || ''}/#/google-callback?token=${token}`);
            } catch (error) {
                return res.redirect(`${process.env.FRONTEND_URL || ''}/login?error=token_error`);
            }
        })(req, res, next);
    });
} else {
    router.get('/google', (req, res) => {
        res.status(503).send('Google Login is not configured on this server.');
    });
}

module.exports = router;
