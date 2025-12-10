const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, reviewController.createReview);
router.get('/', protect, admin, reviewController.getAllReviews);
router.put('/:id/read', protect, admin, reviewController.markAsRead);

module.exports = router;
