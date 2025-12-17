const { sequelize, User } = require('../models');

async function clean() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // Disable foreign key checks if needed (SQLite specific but helpful)
        await sequelize.query('PRAGMA foreign_keys = OFF');

        await User.destroy({
            where: {},
            truncate: true
        });

        await sequelize.query('PRAGMA foreign_keys = ON');

        console.log('✅ Tous les utilisateurs (Admin inclus) ont été supprimés.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

clean();
