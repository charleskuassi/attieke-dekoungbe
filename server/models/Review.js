const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
    type: {
        type: DataTypes.ENUM('avis', 'plainte'),
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('new', 'read', 'archived'),
        defaultValue: 'new'
    },
    isArchived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Review;
