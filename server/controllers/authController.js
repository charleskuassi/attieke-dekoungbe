const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const log = require('../utils/logger');
const { sendVerificationEmail, sendResetPasswordEmail, sendAdminNewUser } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

exports.register = async (req, res) => {
    try {
        log('Register called:', req.body);
        console.log("Register body:", req.body);
        let { name, email, password, phone, address, role } = req.body;

        // Sanitize
        email = email?.trim().toLowerCase();
        name = name?.trim();
        phone = phone?.trim();

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
        }

        // Check user
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
        console.log("==========================================");
        console.log("🔑 CODE DE VÉRIFICATION (TEST) :", verificationCode);
        console.log("==========================================");
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            role: role || 'customer',
            isVerified: false, // Force verification
            verificationCode,
            verificationCodeExpires
        });

        // Send Email
        try {
            await sendVerificationEmail(user, verificationCode);
            // Notify Admin
            sendAdminNewUser(user).catch(err => console.error("Admin Email Error:", err.message));

            res.status(201).json({
                message: 'Inscription réussie. Veuillez vérifier votre email.',
                userId: user.id
            });
        } catch (emailError) {
            console.error("Erreur SMTP (Ignorée en local):", emailError);
            // Fallback: Return success even if email fails, with the code for local dev
            res.status(201).json({
                message: 'Inscription réussie (Mode Local: Email ignoré).',
                userId: user.id,
                devCode: verificationCode
            });
        }

    } catch (err) {
        console.error("Registration Error:", err);
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: err.errors.map(e => e.message).join(', ') });
        }
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: 'Utilisateur introuvable' });
        }

        if (user.isVerified) {
            return res.status(200).json({ message: 'Compte déjà vérifié. Connectez-vous.' });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ message: 'Code incorrect' });
        }

        if (user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ message: 'Le code a expiré' });
        }

        // Activate User
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();

        // Admin Notification
        const { createNotification } = require('./notificationController');
        createNotification('user', `Nouveau client vérifié : ${user.name}`, user.id);

        // Auto login
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Compte vérifié avec succès !',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Identifiants invalides' });
        }

        // Check verification
        if (!user.isVerified) {
            return res.status(403).json({ message: 'Votre compte n\'est pas vérifié. Veuillez vérifier vos emails.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Identifiants invalides' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Security: Don't reveal user existence
            return res.status(200).json({ message: 'Si l\'email existe, un lien de réinitialisation a été envoyé.' });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // Create reset URL
        const resetUrl = `${req.headers.origin || 'http://localhost:5173'}/reset-password/${resetToken}`;

        await sendResetPasswordEmail(user, resetUrl);

        res.status(200).json({ message: 'Si l\'email existe, un lien de réinitialisation a été envoyé.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash token to compare with DB
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { [require('sequelize').Op.gt]: Date.now() } // Expires > Now
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Lien invalide ou expiré' });
        }

        // Update password
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        // Auto login
        const newToken = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Mot de passe réinitialisé avec succès',
            token: newToken,
            user: { id: user.id, name: user.name }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        log('Update Profile called:', req.body);
        const { name, phone, address } = req.body;
        const userId = req.user.id; // From middleware

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        await user.save();

        res.json({
            message: 'Profil mis à jour avec succès',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        console.log("GET ME CALLED for ID:", req.user?.id);
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            // Add other fields as needed
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
