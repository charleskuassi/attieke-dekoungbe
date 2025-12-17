const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true // Nullable for Google Auth users
    },
    googleId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        validate: {
            // Accepte 8 chiffres (Test / Ancien) ou 10 chiffres (Nouveau format Bénin)
            is: /^[0-9]{8}$|^[0-9]{10}$/
        }
    },
    address: {
        type: DataTypes.TEXT
    },
    role: {
        type: DataTypes.ENUM('admin', 'customer'),
        defaultValue: 'customer'
    },
    loyaltyPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verificationCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    verificationCodeExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

module.exports = User;
