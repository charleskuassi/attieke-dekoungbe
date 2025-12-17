const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { protect, admin } = require('../middleware/authMiddleware');

// Maintenance Routes
const adminController = require('../controllers/adminController');

// Base: /api/admin

// Dashboard Stats
router.get('/stats', protect, admin, adminController.getStats);

// Clients List
router.get('/clients', protect, admin, adminController.getClients);

// Initial Count for notifications
router.get('/notifications/counts', protect, admin, adminController.getNotificationCounts);

// Delete User
router.delete('/users/:id', protect, admin, adminController.deleteUser);

// Maintenance Routes
// Toggle Archive
router.put('/archive/:type/:id', protect, admin, maintenanceController.toggleArchive);

// Bulk Cleanup
router.delete('/cleanup', protect, admin, maintenanceController.cleanup);

// Library Routes moved to libraryRoutes.js

module.exports = router;
