const { Order } = require('../models');

async function checkOrders() {
    try {
        const orders = await Order.findAll();
        console.log('--- ALL ORDERS (Simple) ---');
        console.log(JSON.stringify(orders, null, 2));
        console.log('------------------');
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

checkOrders();
