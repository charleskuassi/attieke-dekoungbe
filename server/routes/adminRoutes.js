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

// Library Routes moved to libraryRoutes.js

module.exports = router;
