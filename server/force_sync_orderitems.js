const { OrderItem, sequelize } = require('./models');

async function forceSync() {
    try {
        console.log("Syncing OrderItem...");
        await OrderItem.sync({ force: true });
        console.log("OrderItem synced.");
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

forceSync();
