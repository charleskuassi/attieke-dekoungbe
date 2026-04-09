const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter pour les routes sensibles
 * Limite à 100 requêtes par 15 minutes
 * SKIP pour /api/health (cron-job.org keep-alive)
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par IP
    message: { error: 'Trop de requêtes, veuillez réessayer plus tard' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Ne pas appliquer le rate limiting sur le health check
        return req.path === '/api/health';
    },
});

/**
 * Rate Limiter strict pour l'authentification
 * Limite à 5 tentatives par 15 minutes
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 tentatives max
    message: { error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Ne compte que les échecs
});

/**
 * Rate Limiter pour les endpoints publics
 */
const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30, // 30 requêtes pour les endpoints publics
    message: { error: 'Trop de requêtes, veuillez réessayer plus tard' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Middleware pour sanitiser les inputs (XSS prevention)
 */
const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            // Échappe les caractères HTML dangereux
            return obj
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (typeof obj === 'object' && obj !== null) {
            const sanitized = {};
            for (const key in obj) {
                sanitized[key] = sanitize(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };

    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);

    next();
};

/**
 * Middleware pour vérifier le Content-Type
 */
const checkContentType = (requiredTypes) => {
    return (req, res, next) => {
        const contentType = req.headers['content-type'];

        if (!contentType) {
            return res.status(400).json({ error: 'Content-Type header requis' });
        }

        const isAllowed = requiredTypes.some(type => contentType.includes(type));
        if (!isAllowed) {
            return res.status(415).json({
                error: `Content-Type non supporté. Attendu: ${requiredTypes.join(' ou ')}`
            });
        }

        next();
    };
};

module.exports = {
    apiLimiter,
    authLimiter,
    publicLimiter,
    sanitizeInput,
    checkContentType,
};
