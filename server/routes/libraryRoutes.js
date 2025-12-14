const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const { upload } = require('../config/cloudinary');

// POST /api/admin/library/upload
router.post('/upload', upload.single('image'), libraryController.uploadImage);

// GET /api/admin/library
router.get('/', libraryController.getLibraryImages);

// DELETE /api/admin/library/delete
router.post('/delete', libraryController.deleteImage); // Using POST to send easy JSON body with public_id

module.exports = router;
