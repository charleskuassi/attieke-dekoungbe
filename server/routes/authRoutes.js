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

    router.get('/google/callback', (req, res, next) => {
        passport.authenticate('google', { session: false }, (err, user, info) => {
            if (err) {
                console.error("GOOGLE AUTH ERROR:", err);
                return res.redirect('/login?error=auth_error');
            }
            if (!user) {
                console.error("GOOGLE AUTH FAILED: No user returned", info);
                return res.redirect('/login?error=google_failed');
            }

            // Success: User found
            req.user = user;
            console.log("GOOGLE CALLBACK SUCCESS - User:", user.email);
            
            // PARSE STATE with Fallback
            let returnUrl = process.env.FRONTEND_URL || '/';
            let isMobile = false;

            try {
                const rawState = req.query.state;
                if (rawState) {
                    if (rawState === 'mobile') {
                        isMobile = true;
                    } else if (rawState === 'web') {
                        // Keep default returnUrl
                    } else {
                        // Try Base64 Decode
                        const decoded = Buffer.from(rawState, 'base64').toString('utf-8');
                        // Simple check to avoid JSON.parse on random strings
                        if (decoded.trim().startsWith('{')) {
                            const data = JSON.parse(decoded);
                            if (data.platform === 'mobile') isMobile = true;
                            if (data.returnUrl) returnUrl = data.returnUrl;
                        }
                    }
                }
            } catch (e) {
                console.log("State parsing failed, using default:", e.message);
            }

            try {
                const token = jwt.sign(
                    { id: user.id, role: user.role },
                    process.env.JWT_SECRET || 'your_super_secret_key',
                    { expiresIn: '1d' }
                );

                if (isMobile) {
                    console.log("Redirecting to Mobile App Scheme");
                    return res.redirect(`attiekeapp://google-callback?token=${token}`);
                }

                // Web Redirect
                const cleanUrl = returnUrl.replace(/\/$/, '');
                console.log(`Redirecting to Web Frontend: ${cleanUrl}/#/google-callback`);
                return res.redirect(`${cleanUrl}/#/google-callback?token=${token}`);
            } catch (error) {
                console.error("Token Generation Error:", error);
                return res.redirect('/login?error=token_error');
            }
        })(req, res, next);
    });
} else {
    router.get('/google', (req, res) => {
        res.status(503).send('Google Login is not configured on this server.');
    });
}

module.exports = router;
