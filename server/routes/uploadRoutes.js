const express = require('express');
const router = express.Router();
const { upload, uploadImage } = require('../controllers/uploadController');

/**
 * POST /api/upload
 * Upload an image file
 * Returns: { success: true, imageUrl: '/uploads/timestamp_filename.jpg', ... }
 */
router.post('/', upload.single('image'), uploadImage);

module.exports = router;
