const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, driverController.createDriver);
router.get('/', protect, admin, driverController.getAllDrivers);
router.delete('/:id', protect, admin, driverController.deleteDriver);

module.exports = router;
