const { User, Order, sequelize } = require('./models');
const { Op } = require('sequelize');

async function resetData() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to Database.');

        console.log('🗑️  Clearing all Orders...');
        // SQLite doesn't support TRUNCATE, using destroy with empty where
        await Order.destroy({ where: {} });

        console.log('🗑️  Deleting non-admin Users...');
        const deletedUsers = await User.destroy({
            where: {
                role: {
                    [Op.ne]: 'admin'
                }
            }
        });

        console.log(`✅ Success! Deleted ${deletedUsers} customer accounts.`);
        console.log('ℹ️  Admin accounts preserved (if any exist).');

    } catch (error) {
        console.error('❌ Error resetting data:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

resetData();
