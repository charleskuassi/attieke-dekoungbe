const { Review, User } = require('../models');
const { sendAdminNewReview } = require('../services/emailService');

exports.createReview = async (req, res) => {
    try {
        console.log("⭐ [REVIEW] Received Body:", req.body);
        // Accept 'comment' or 'message' from frontend
        const { type, rating, message, comment } = req.body;
        const finalMessage = message || comment;

        // Basic validation
        if (!type || !finalMessage) {
            return res.status(400).json({ message: 'Le type et le message sont requis' });
        }

        if (!req.user) {
            console.warn("⚠️ Review attempted without User (Auth Middleware should have caught this)");
            return res.status(401).json({ message: 'Vous devez être connecté.' });
        }

        const review = await Review.create({
            UserId: req.user.id,
            type,
            rating: type === 'avis' ? rating : null,
            message: finalMessage,
            status: 'new'
        });
        console.log("✅ Review Created:", review.id);

        try {
            // Admin Notification
            const { createNotification } = require('./notificationController');
            const notifType = type === 'avis' ? 'review' : 'complaint';
            createNotification('review', `Nouveau ${type} de ${req.user.name || 'Client'}`, review.id);

            // Email
            sendAdminNewReview(review).catch(e => console.error("Email Error:", e.message));

        } catch (notifErr) {
            console.error("⚠️ Notification Error (Ignored):", notifErr.message);
        }

        res.status(201).json(review);
    } catch (err) {
        console.error("❌ Create Review Error:", err);
        res.status(500).json({ message: 'Erreur Serveur (Avis)', error: err.message });
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [{
                model: User,
                attributes: ['name', 'phone', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    } catch (err) {
        console.error("Get Reviews Error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        review.status = 'read';
        await review.save();
        res.json(review);
    } catch (err) {
        console.error("Mark Read Error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};
