const { sequelize } = require('../models');

async function resetDb() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Forcing database sync (DROPPING TABLES)...');
        await sequelize.sync({ force: true });
        console.log('Database reset successfully.');

    } catch (error) {
        console.error('Error resetting database:', error);
    } finally {
        await sequelize.close();
    }
}

resetDb();
