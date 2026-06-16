const { sequelize } = require('../models');

(async () => {
    try {
        console.log("Syncing database schema...");
        await sequelize.sync({ alter: true });
        console.log("✅ Database schema synchronized successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error syncing database:", error);
        process.exit(1);
    }
})();
