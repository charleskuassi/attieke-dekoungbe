const { ContactMessage } = require('../models');
const { sendAdminNewMessage } = require('../services/emailService');

exports.createMessage = async (req, res) => {
    try {
        console.log("📨 [CONTACT] Received Body:", req.body);
        const { name, email, message, subject } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Nom, email et message requis.' });
        }

        const contactMessage = await ContactMessage.create({
            name, email, message, subject
        });
        console.log("✅ Message Saved:", contactMessage.id);

        try {
            // Admin Notification
            const { createNotification } = require('./notificationController');
            createNotification('message', `Nouveau message de ${name}: ${subject || 'Contact'}`, contactMessage.id);

            // Email Notification
            sendAdminNewMessage(contactMessage).catch(e => console.error("Email Error:", e.message));

        } catch (notifErr) {
            console.error("⚠️ Notification Error (Ignored):", notifErr.message);
        }

        res.status(201).json({ success: true, data: contactMessage });
    } catch (err) {
        console.error("❌ Create Message Error:", err);
        res.status(500).json({
            success: false,
            message: 'Erreur Serveur (Contact)',
            error: err.message
        });
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
        res.json(messages);
    } catch (err) {
        console.error("Get Messages Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await ContactMessage.update({ isRead: true }, { where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        console.error("Mark Read Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const deleted = await ContactMessage.destroy({ where: { id: req.params.id } });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        res.json({ success: true, message: 'Message deleted' });
    } catch (err) {
        console.error("Delete Message Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
