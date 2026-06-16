const { Order, User } = require('../models');

async function checkOrders() {
    try {
        const orders = await Order.findAll({
            include: [{ model: User, attributes: ['id', 'name'] }]
        });
        console.log('--- ALL ORDERS ---');
        console.log(JSON.stringify(orders, null, 2));
        console.log('------------------');
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

checkOrders();
