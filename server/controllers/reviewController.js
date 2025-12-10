const { Review, User } = require('../models');

exports.createReview = async (req, res) => {
    try {
        const { type, rating, message } = req.body;

        // Basic validation
        if (!type || !message) {
            return res.status(400).json({ message: 'Type and message are required' });
        }

        const review = await Review.create({
            UserId: req.user.id,
            type,
            rating: type === 'avis' ? rating : null,
            message,
            status: 'new'
        });
        res.status(201).json(review);
    } catch (err) {
        console.error("Create Review Error:", err);
        res.status(500).json({ message: 'Server Error', error: err.message });
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
