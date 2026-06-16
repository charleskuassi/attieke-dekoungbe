const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zoneController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public: Checkout needs to fetch zones
router.get('/', zoneController.getAllZones);

// Admin Only
router.post('/', protect, admin, zoneController.createZone);
router.delete('/:id', protect, admin, zoneController.deleteZone);

module.exports = router;
