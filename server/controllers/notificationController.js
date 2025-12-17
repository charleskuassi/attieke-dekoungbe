const { Notification } = require('../models');

// Helper function to create notification (Internal)
exports.createNotification = async (type, message, referenceId = null) => {
    try {
        await Notification.create({ type, message, referenceId });
        console.log(`Notification Created: [${type}] ${message}`);
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
};

// API: Get Unread Notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            limit: 50,
            order: [['createdAt', 'DESC']]
        });

        const unreadCount = await Notification.count({ where: { isRead: false } });

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
};

// API: Mark as Read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === 'all') {
            await Notification.update({ isRead: true }, { where: { isRead: false } });
        } else {
            await Notification.update({ isRead: true }, { where: { id } });
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
};

// API: Delete All Notifications
exports.deleteAllNotifications = async (req, res) => {
    try {
        await Notification.destroy({ where: {}, truncate: true });
        res.json({ success: true, message: "All notifications cleared" });
    } catch (error) {
        console.error("Delete All Notifications Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
