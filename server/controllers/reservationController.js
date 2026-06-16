const { Reservation, User } = require('../models');
const { sendAdminNewReservation, sendReservationReceived } = require('../services/emailService');

exports.createReservation = async (req, res) => {
    try {
        console.log("📝 [RESERVATION] Received Body:", req.body);
        const { name, phone, date, time, guests, message, email } = req.body;

        // Permissive validation for demo
        if (!name || !date || !time) {
            console.warn("⚠️ Missing required fields (name, date, time)");
            // We continue? No, at least these needed. But let's return error gently.
            return res.status(400).json({ success: false, message: 'Nom, date et heure requis.' });
        }

        const reservationData = {
            name, phone, date, time, guests: guests || 1, message, email
        };

        // If user is authenticated, link the reservation
        // Also try to get email from user if not in body
        let userEmail = email;
        if (req.user) {
            reservationData.UserId = req.user.id;
            console.log("👤 Linked to User:", req.user.id);
            if (!userEmail && req.user.email) userEmail = req.user.email;
        }

        const reservation = await Reservation.create(reservationData);
        console.log("✅ Reservation Created:", reservation.id);

        try {
            // Admin Notification (Fire & Forget)
            const { createNotification } = require('./notificationController');
            createNotification('reservation', `Nouvelle réservation de ${name} pour le ${date} à ${time}`, reservation.id);

            // Emails
            sendAdminNewReservation(reservation).catch(e => console.error("Admin Email Error", e.message));
            if (userEmail) {
                sendReservationReceived(reservation, userEmail).catch(e => console.error("Client Email Error", e.message));
            }

        } catch (notifErr) {
            console.error("⚠️ Notification Error (Ignored):", notifErr.message);
        }

        res.status(201).json({ success: true, data: reservation });
    } catch (err) {
        console.error("❌ Create Reservation Error:", err);
        res.status(500).json({
            success: false,
            message: 'Erreur Serveur lors de la réservation',
            error: err.message
        });
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
