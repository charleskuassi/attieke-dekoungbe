const { sequelize } = require('./models');

async function resetTable() {
    try {
        console.log("Dropping OrderItems table...");
        await sequelize.query("DROP TABLE IF EXISTS `OrderItems`");
        console.log("OrderItems dropped.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await sequelize.close();
    }
}

resetTable();
