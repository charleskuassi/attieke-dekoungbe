const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const crypto = require('crypto');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        scope: ['profile', 'email']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const googleId = profile.id;
                const email = profile.emails[0].value;
                const name = profile.displayName;

                // 1. Check if user exists with this googleId
                console.log("GOOGLE STRATEGY START: ", profile.id);
                let user = await User.findOne({ where: { googleId } });
                console.log("Found by GoogleID?", !!user);

                if (user) {
                    // Login
                    return done(null, user);
                }

                // 2. Check if user exists with this email (Smart Merging)
                user = await User.findOne({ where: { email } });

                if (user) {
                    // Link Google Account to existing user
                    user.googleId = googleId;
                    await user.save();
                    return done(null, user);
                }

                // 3. Register new user
                const randomPassword = crypto.randomBytes(16).toString('hex');
                user = await User.create({
                    name,
                    email,
                    googleId,
                    password: randomPassword, // Dummy password
                    role: 'customer',
                    isVerified: true // Trust Google
                });

                done(null, user);

            } catch (err) {
                done(err, null);
            }
        }
    ));
} else {
    console.warn("⚠️ Google OAuth credentials missing. Google Login disabled.");
}

module.exports = passport;
