const { sequelize, Order } = require('./models');

async function syncOrder() {
    try {
        await sequelize.authenticate();
        console.log('Syncing Order model...');
        await Order.sync({ alter: true });
        console.log('Order model synced successfully.');
    } catch (error) {
        console.error('Error syncing Order model:', error);
    } finally {
        await sequelize.close();
    }
}

syncOrder();
