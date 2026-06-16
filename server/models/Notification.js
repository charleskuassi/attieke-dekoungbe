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
        type: DataTypes.STRING, // ID of the related order (Int), user (Int), or message (UUID)
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
