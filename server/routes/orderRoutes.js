const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const { protect, protectOptional } = require('../middleware/authMiddleware');

const adminController = require('../controllers/adminController');

router.post('/', protectOptional, orderController.createOrder);
router.get('/my-orders', protect, orderController.getUserOrders);
router.get('/stats', protect, adminController.getStats);
router.get('/clients', protect, adminController.getClients);
router.get('/admin', protect, orderController.getAllOrders);
router.get('/notifications-counts', protect, adminController.getNotificationCounts);
router.patch('/admin/:id', protect, orderController.updateOrderStatus);
router.patch('/admin/:id/assign', protect, orderController.assignDriver);

module.exports = router;
