const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    customer_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    total_price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'preparing', 'shipping', 'completed', 'cancelled'),
        defaultValue: 'pending'
    },
    payment_method: {
        type: DataTypes.STRING,
        defaultValue: 'cash'
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: true // Allow null for guest orders if we still wanted them, but V2 enforces login. Let's keep true for safety or migration.
    },
    isArchived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    delivery_zone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    delivery_cost: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports = Order;
