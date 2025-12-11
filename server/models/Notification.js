const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.STRING, // 'order', 'user', 'reservation', 'message', 'review'
        allowNull: false
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    referenceId: {
        type: DataTypes.INTEGER, // ID of the related order, user, etc.
        allowNull: true
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Notification;
