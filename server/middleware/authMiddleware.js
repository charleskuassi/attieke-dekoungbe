const jwt = require('jsonwebtoken');
const { User } = require('../models');
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

const protect = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Verify user still exists in DB
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Session invalid. User not found.' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

// Optional Auth for Guest Checkout
const protectOptional = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // DEBUG LOG
    console.log("ProtectOptional called. Token present:", !!token);

    if (!token) {
        req.user = null;
        console.log("ProtectOptional: Guest mode (No token)");
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Verify user still exists in DB
        const user = await User.findByPk(decoded.id);
        req.user = user ? decoded : null;
        console.log("ProtectOptional: User identified:", user ? user.email : 'User ID not found in DB');
        next();
    } catch (err) {
        console.log("ProtectOptional Error:", err.message);
        // If token is invalid, just proceed as guest
        req.user = null;
        next();
    }
};

module.exports = { protect, protectOptional, admin };
