const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // Adjust if path is different
    logging: false
});

const Order = sequelize.define('Order', {
    customer_name: DataTypes.STRING,
    total_price: DataTypes.FLOAT,
    status: DataTypes.STRING
});

async function run() {
    try {
        await sequelize.authenticate();
        console.log("DB Connected.");
        const orders = await Order.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
        console.log("Orders found:", orders.length);
        console.log(JSON.stringify(orders, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
