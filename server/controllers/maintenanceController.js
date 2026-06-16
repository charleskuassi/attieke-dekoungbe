const { Order, Reservation, Review, ContactMessage } = require('../models');
const { Op } = require('sequelize');

// Map frontend types/targets to Sequelize Models
const getModel = (type) => {
    switch (type.toLowerCase()) {
        case 'order':
        case 'orders':
            return Order;
        case 'reservation':
        case 'reservations':
            return Reservation;
        case 'review':
        case 'reviews':
        case 'complaint': // In case frontend calls it complaints
            return Review;
        case 'message':
        case 'messages':
            return ContactMessage;
        default:
            return null;
    }
};

exports.toggleArchive = async (req, res) => {
    try {
        const { type, id } = req.params;
        const Model = getModel(type);

        if (!Model) {
            return res.status(400).json({ message: 'Invalid item type' });
        }

        const item = await Model.findByPk(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Toggle
        item.isArchived = !item.isArchived;
        await item.save();

        res.json({
            success: true,
            isArchived: item.isArchived,
            message: `Item ${item.isArchived ? 'archived' : 'unarchived'} successfully`
        });

    } catch (error) {
        console.error('Toggle Archive Error:', error);
        res.status(500).json({ message: 'Server error during archive toggle' });
    }
};

exports.cleanup = async (req, res) => {
    try {
        const { days, targets } = req.body;

        if (!days || isNaN(days)) {
            return res.status(400).json({ message: 'Invalid days parameter' });
        }
        if (!targets || !Array.isArray(targets) || targets.length === 0) {
            return res.status(400).json({ message: 'No targets specified' });
        }

        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - parseInt(days));

        let totalDeleted = 0;
        const details = {};

        // Process each target type
        for (const target of targets) {
            const Model = getModel(target);
            if (Model) {
                const deletedCount = await Model.destroy({
                    where: {
                        createdAt: {
                            [Op.lt]: dateLimit // Created Before dateLimit
                        },
                        // protected items are NOT deleted
                        isArchived: {
                            [Op.ne]: true // Not true (so false or null)
                        }
                    }
                });

                totalDeleted += deletedCount;
                details[target] = deletedCount;
            }
        }

        res.json({
            success: true,
            message: `Cleanup completed. Deleted ${totalDeleted} items.`,
            deletedCount: totalDeleted,
            details
        });

    } catch (error) {
        console.error('Cleanup Error:', error);
        res.status(500).json({ message: 'Server error during cleanup' });
    }
};
