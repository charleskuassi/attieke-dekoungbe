const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    price_at_order: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
});

module.exports = OrderItem;
