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

// Optional Auth for Guest Checkout - STRICTER
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
        
        if (!user) {
            console.log("ProtectOptional: Token valid but user not found in DB");
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = decoded; // Store lean decoded object (id, email, role)
        req.user.id = user.id; // Ensure ID is correct type
        console.log("ProtectOptional: User identified:", user.email);
        next();
    } catch (err) {
        console.error("ProtectOptional Error (Token Invalid):", err.message);
        // CRITICAL CHANGE: If token is sent but invalid, FAIL the request. 
        // Do NOT fall back to guest. This prevents "logged in" users from creating orphan orders.
        return res.status(401).json({ message: 'Session expired or invalid. Please login again.' });
    }
};

module.exports = { protect, protectOptional, admin };
