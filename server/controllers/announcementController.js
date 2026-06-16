const { Announcement } = require('../models');

exports.getAnnouncement = async (req, res) => {
    try {
        // We assume there's only one announcement record for the site
        let announcement = await Announcement.findOne();

        // If none exists, create a default one
        if (!announcement) {
            announcement = await Announcement.create({
                message: '',
                isActive: false
            });
        }

        res.json(announcement);
    } catch (error) {
        console.error('Error fetching announcement:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateAnnouncement = async (req, res) => {
    try {
        const { message, isActive } = req.body;

        // Find the first announcement (singleton pattern)
        let announcement = await Announcement.findOne();

        if (announcement) {
            announcement.message = message;
            announcement.isActive = isActive;
            await announcement.save();
        } else {
            announcement = await Announcement.create({ message, isActive });
        }

        res.json(announcement);
    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
