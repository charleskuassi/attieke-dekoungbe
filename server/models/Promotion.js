const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Promotion = sequelize.define('Promotion', {
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    minAmount: {
        type: DataTypes.INTEGER,
        defaultValue: 15000
    },
    discountPercentage: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    }
}, {
    timestamps: true
});

module.exports = Promotion;
