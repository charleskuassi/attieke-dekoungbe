const { sequelize } = require('../models');

async function updateSchema() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Syncing database with alter: true...');
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully.');

    } catch (error) {
        console.error('Error syncing database:', error);
    } finally {
        await sequelize.close();
    }
}

updateSchema();
