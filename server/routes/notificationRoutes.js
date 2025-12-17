const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, notificationController.getNotifications);
router.put('/read/:id', protect, admin, notificationController.markAsRead);

module.exports = router;
