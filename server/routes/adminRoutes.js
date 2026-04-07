const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Base prefix: /api/admin

// Dashboard Stats
router.get('/stats', protect, admin, (req, res, next) => {
    if (typeof adminController.getStats !== 'function') return res.status(500).json({ message: 'adminController.getStats not loaded' });
    adminController.getStats(req, res, next);
});

// Clients List
router.get('/clients', protect, admin, (req, res, next) => {
    if (typeof adminController.getClients !== 'function') return res.status(500).json({ message: 'adminController.getClients not loaded' });
    adminController.getClients(req, res, next);
});

// Notification Counts
router.get('/notifications/counts', protect, admin, (req, res, next) => {
    if (typeof adminController.getNotificationCounts !== 'function') return res.status(500).json({ message: 'adminController.getNotificationCounts not loaded' });
    adminController.getNotificationCounts(req, res, next);
});

// User Deletion
router.delete('/users/:id', protect, admin, (req, res, next) => {
    if (typeof adminController.deleteUser !== 'function') return res.status(500).json({ message: 'adminController.deleteUser not loaded' });
    adminController.deleteUser(req, res, next);
});

// Maintenance: Archive
router.put('/archive/:type/:id', protect, admin, (req, res, next) => {
    if (typeof maintenanceController.toggleArchive !== 'function') return res.status(500).json({ message: 'maintenanceController.toggleArchive not loaded' });
    maintenanceController.toggleArchive(req, res, next);
});

// Maintenance: Cleanup
router.delete('/cleanup', protect, admin, (req, res, next) => {
    if (typeof maintenanceController.cleanup !== 'function') return res.status(500).json({ message: 'maintenanceController.cleanup not loaded' });
    maintenanceController.cleanup(req, res, next);
});

module.exports = router;

