const { Order, User, sequelize } = require('../models');

async function checkOrders() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const orders = await Order.findAll({
            include: [{ model: User, attributes: ['id', 'name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });

        console.log('--- ALL ORDERS ---');
        orders.forEach(o => {
            console.log(`ID: ${o.id}, Total: ${o.total_price}, Status: ${o.status}, UserId: ${o.UserId}, User: ${o.User ? o.User.email : 'NONE'}`);
        });
        console.log('------------------');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkOrders();
