const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const jwt = require('jsonwebtoken');
const passport = require('passport');

const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/validationSchemas');

router.get('/test', (req, res) => {
    res.send('Auth Routes Working');
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:token', authController.resetPassword);
router.put('/profile', protect, authController.updateProfile);
router.get('/me', protect, authController.getMe);

// Google Auth Routes
if (process.env.GOOGLE_CLIENT_ID) {
    router.get('/google', (req, res, next) => {
        const state = req.query.state || 'web';
        passport.authenticate('google', { session: false, scope: ['profile', 'email'], state })(req, res, next);
    });

    router.get('/google/callback',
        passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_failed` }),
        (req, res) => {
            console.log("GOOGLE CALLBACK SUCCESS - User:", req.user.email);
            const token = jwt.sign(
                { id: req.user.id, role: req.user.role },
                process.env.JWT_SECRET || 'your_super_secret_key',
                { expiresIn: '1d' }
            );

            // Check if this is a mobile login
            const state = req.query.state;
            if (state === 'mobile') {
                console.log("Redirecting to Mobile App Scheme");
                // Custom Scheme Redirect for Android/iOS App
                return res.redirect(`attiekeapp://google-callback?token=${token}`);
            }

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            console.log("Redirecting to Frontend:", `${frontendUrl}/google-callback`);

            // Use explicit HTML redirect for better debugging/compatibility than res.redirect sometimes
            res.redirect(`${frontendUrl}/google-callback?token=${token}`);
        }
    );
} else {
    router.get('/google', (req, res) => {
        res.status(503).send('Google Login is not configured on this server.');
    });
}

module.exports = router;
