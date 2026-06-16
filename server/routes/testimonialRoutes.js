const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const { protect } = require('../middleware/authMiddleware'); // Admin protection likely needed
const upload = require('../middleware/uploadMiddleware'); // Multer config

// Public route to view
router.get('/', testimonialController.getTestimonials);

// Admin routes
router.post('/', protect, upload.single('image'), testimonialController.createTestimonial);
router.delete('/:id', protect, testimonialController.deleteTestimonial);

module.exports = router;
