const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Announcement = sequelize.define('Announcement', {
    message: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Announcement;
