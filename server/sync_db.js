const { sequelize } = require('./models');

async function forceSync() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await sequelize.sync({ force: true });
        console.log('Database synced (force: true). All tables recreated.');
    } catch (error) {
        console.error('Error syncing database:', error);
    } finally {
        await sequelize.close();
    }
}

forceSync();
