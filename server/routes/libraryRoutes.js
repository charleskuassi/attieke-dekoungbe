const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');

// POST /api/admin/library/upload
router.post('/upload', libraryController.uploadMiddleware, libraryController.uploadImage);

// GET /api/admin/library
router.get('/', libraryController.getLibraryImages);

module.exports = router;
