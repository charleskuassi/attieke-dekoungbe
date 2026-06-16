const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { protect, admin, protectOptional } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { reservationSchema } = require('../utils/validationSchemas');

// Put specific routes before parameter routes (like /:id)
router.get('/my-history', protect, reservationController.getMyReservations);
router.post('/', protectOptional, validate(reservationSchema), reservationController.createReservation);
router.get('/', protect, admin, reservationController.getAllReservations);

router.put('/:id', protect, admin, reservationController.updateStatus);

module.exports = router;
