const { ContactMessage } = require('../models');

exports.createMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const contactMessage = await ContactMessage.create({
            name, email, message
        });

        // Admin Notification
        const { createNotification } = require('./notificationController');
        createNotification('message', `Nouveau message de ${name}`, contactMessage.id);

        res.status(201).json({ success: true, data: contactMessage });
    } catch (err) {
        console.error("Create Message Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
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
