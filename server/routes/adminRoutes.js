const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { protect, admin } = require('../middleware/authMiddleware');

// Maintenance Routes
// Base: /api/admin

// Toggle Archive
router.put('/archive/:type/:id', protect, admin, maintenanceController.toggleArchive);

// Bulk Cleanup
router.delete('/cleanup', protect, admin, maintenanceController.cleanup);

const libraryController = require('../controllers/libraryController');

// Library Routes
router.get('/library', protect, admin, libraryController.getLibraryImages);
router.post('/library/upload', protect, admin, libraryController.uploadMiddleware, libraryController.uploadToLibrary);

module.exports = router;
