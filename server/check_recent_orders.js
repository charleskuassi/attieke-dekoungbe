const { Order } = require('./models');

async function checkOrders() {
    try {
        const orders = await Order.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']]
        });
        console.log("Recent Orders:", JSON.stringify(orders, null, 2));
    } catch (e) {
        console.error(e);
    }
}
checkOrders();
