const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const jwt = require('jsonwebtoken');
const passport = require('passport');

router.get('/test', (req, res) => {
    res.send('Auth Routes Working');
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:token', authController.resetPassword);
router.put('/profile', protect, authController.updateProfile);
router.get('/me', protect, authController.getMe);

// Google Auth Routes
// Google Auth Routes
if (process.env.GOOGLE_CLIENT_ID) {
    router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

    router.get('/google/callback',
        passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login?error=google_failed' }),
        (req, res) => {
            // Successful authentication
            const token = jwt.sign(
                { id: req.user.id, role: req.user.role },
                process.env.JWT_SECRET || 'your_super_secret_key',
                { expiresIn: '1d' }
            );

            // Redirect to Frontend with token
            // TODO: Use env var for frontend URL
            res.redirect(`http://localhost:5173/google-callback?token=${token}`);
        }
    );
} else {
    // Fallback if Google Auth is not configured
    router.get('/google', (req, res) => {
        res.status(503).send('Google Login is not configured on this server.');
    });
}

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login?error=google_failed' }),
    (req, res) => {
        // Successful authentication
        const token = jwt.sign(
            { id: req.user.id, role: req.user.role },
            process.env.JWT_SECRET || 'your_super_secret_key',
            { expiresIn: '1d' }
        );

        // Redirect to Frontend with token
        res.redirect(`http://localhost:5173/google-callback?token=${token}`);
    }
);

module.exports = router;
