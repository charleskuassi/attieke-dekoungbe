const { User, sequelize } = require('../models');

async function cleanCustomers() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const result = await User.destroy({
            where: {
                role: 'customer'
            }
        });

        console.log(`Successfully deleted ${result} customer accounts.`);
        console.log('Admin accounts remain intact.');

    } catch (error) {
        console.error('Error cleaning customers:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

cleanCustomers();
