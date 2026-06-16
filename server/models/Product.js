const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING
    },
    images: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    category: {
        type: DataTypes.STRING
    },
    is_popular: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Product;
