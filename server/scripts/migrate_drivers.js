const { sequelize, DeliveryDriver } = require('../models');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log("DB Connected.");

        // 1. Create Table DeliveryDrivers
        // sync() on a model creates just that table
        await DeliveryDriver.sync({ force: true });
        console.log("DeliveryDrivers table created.");

        // 2. Add Column to Orders
        const queryInterface = sequelize.getQueryInterface();
        try {
            await queryInterface.addColumn('Orders', 'deliveryDriverId', {
                type: require('sequelize').DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'DeliveryDrivers',
                    key: 'id'
                }
            });
            console.log("Column deliveryDriverId added to Orders.");
        } catch (e) {
            console.log("Column might already exist or error:", e.message);
        }

        console.log("Migration Done.");
    } catch (e) {
        console.error("Migration Error:", e);
    } finally {
        await sequelize.close();
    }
}

migrate();
