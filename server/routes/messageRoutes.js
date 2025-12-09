const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', messageController.createMessage);
router.get('/', protect, admin, messageController.getAllMessages);
router.patch('/:id/read', protect, admin, messageController.markAsRead);
router.delete('/:id', protect, admin, messageController.deleteMessage);

module.exports = router;
