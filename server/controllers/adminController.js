const { Order, OrderItem, Product, User, sequelize, Reservation, ContactMessage, Review } = require('../models');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Daily Sales
        const dailySales = await Order.sum('total_price', {
            where: {
                createdAt: {
                    [Op.gte]: today
                },
                status: { [Op.ne]: 'cancelled' }
            }
        });

        // Monthly Report (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const monthlyData = await Order.findAll({
            attributes: [
                [sequelize.fn('date', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('sum', sequelize.col('total_price')), 'total']
            ],
            where: {
                createdAt: { [Op.gte]: thirtyDaysAgo },
                status: { [Op.ne]: 'cancelled' }
            },
            group: [sequelize.fn('date', sequelize.col('createdAt'))],
            order: [[sequelize.fn('date', sequelize.col('createdAt')), 'ASC']]
        });

        // Top Products
        const topProducts = await OrderItem.findAll({
            attributes: [
                'ProductId',
                [sequelize.fn('sum', sequelize.col('quantity')), 'total_sold'],
                [sequelize.literal('SUM(quantity * price_at_order)'), 'total_revenue']
            ],
            include: [{ model: Product, attributes: ['name'] }],
            group: ['ProductId'],
            order: [[sequelize.literal('total_sold'), 'DESC']],
            limit: 5
        });

        // Format Monthly Data for Chart
        const formattedMonthlyData = monthlyData.map(item => ({
            name: new Date(item.get('date')).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            sales: parseInt(item.get('total'))
        }));

        // Top Products with Revenue
        const topProductsData = topProducts.map(item => ({
            name: item.Product ? item.Product.name : 'Inconnu',
            count: parseInt(item.get('total_sold')),
            revenue: parseInt(item.get('total_revenue') || 0)
        }));

        res.json({
            dailySales: dailySales || 0,
            monthlyData: formattedMonthlyData,
            topProducts: topProductsData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getClients = async (req, res) => {
    try {
        const clients = await User.findAll({
            where: { role: 'customer', isVerified: true },
            attributes: ['id', 'name', 'email', 'phone', 'address', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.json(clients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getNotificationCounts = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [pendingOrders, pendingReservations, unreadMessages, unreadReviews, newClients, totalClients] = await Promise.all([
            Order.count({ where: { status: 'paid' } }),
            Reservation.count({ where: { status: 'pending' } }),
            ContactMessage.count({ where: { isRead: false } }),
            Review.count({ where: { status: 'new' } }),
            User.count({ where: { role: 'customer', createdAt: { [Op.gte]: today }, isVerified: true } }),
            User.count({ where: { role: 'customer', isVerified: true } })
        ]);

        res.json({
            orders: pendingOrders,
            reservations: pendingReservations,
            messages: unreadMessages,
            reviews: unreadReviews,
            clients: newClients,
            totalClients // Return total for dashboard card
        });
    } catch (err) {
        console.error("Notification Counts Error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};
