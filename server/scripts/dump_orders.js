const { Order, User, sequelize } = require('../models');
const fs = require('fs');
const path = require('path');

async function checkOrders() {
    try {
        await sequelize.authenticate();

        const orders = await Order.findAll({
            include: [{ model: User, attributes: ['id', 'email'] }],
            order: [['createdAt', 'DESC']]
        });

        let output = '--- ORDER DUMP ---\n';
        orders.forEach(o => {
            output += `ID: ${o.id} | Status: ${o.status} | UserId: ${o.UserId} | UserEmail: ${o.User ? o.User.email : 'NULL'} | TX: ${o.transaction_id}\n`;
        });

        fs.writeFileSync(path.join(__dirname, '../orders_dump.txt'), output);
        console.log('Dump written to orders_dump.txt');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkOrders();
