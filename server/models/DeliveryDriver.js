const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryDriver = sequelize.define('DeliveryDriver', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('available', 'busy', 'off'),
        defaultValue: 'available'
    }
});

module.exports = DeliveryDriver;
