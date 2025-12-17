const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryZone = sequelize.define('DeliveryZone', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = DeliveryZone;
