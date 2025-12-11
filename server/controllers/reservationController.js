const { Reservation } = require('../models');

exports.createReservation = async (req, res) => {
    try {
        const { name, phone, date, time, guests, message } = req.body;

        const reservationData = {
            name, phone, date, time, guests, message
        };

        // If user is authenticated, link the reservation
        if (req.user) {
            reservationData.UserId = req.user.id;
        }

        const reservation = await Reservation.create(reservationData);

        // Admin Notification
        const { createNotification } = require('./notificationController');
        createNotification('reservation', `Nouvelle réservation de ${name} pour le ${date} à ${time}`, reservation.id);

        res.status(201).json({ success: true, data: reservation });
    } catch (err) {
        console.error("Create Reservation Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.findAll({
            where: { UserId: req.user.id },
            order: [['date', 'DESC'], ['time', 'DESC']]
        });
        res.json(reservations);
    } catch (err) {
        console.error("Get My Reservations Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getAllReservations = async (req, res) => {
    try {
        // Sort by date (nearest first)
        const reservations = await Reservation.findAll({ order: [['date', 'ASC'], ['time', 'ASC']] });
        res.json(reservations);
    } catch (err) {
        console.error("Get Reservations Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const reservation = await Reservation.findByPk(id);

        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        reservation.status = status;
        await reservation.save();
        res.json({ success: true, data: reservation });
    } catch (err) {
        console.error("Update Reservation Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
