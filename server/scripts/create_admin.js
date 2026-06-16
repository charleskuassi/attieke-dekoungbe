const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Connecting to DB...');

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const [admin, created] = await User.findOrCreate({
            where: { email: 'admin@attieke.com' },
            defaults: {
                name: 'Super Admin',
                password: hashedPassword,
                role: 'admin',
                phone: '00000000',
                address: 'Siège Attièkè Dékoungbé',
                isVerified: true
            }
        });

        if (created) {
            console.log('✅ Admin créé avec succès.');
        } else {
            console.log('ℹ️ L\'admin existait déjà. Réinitialisation du mot de passe...');
            admin.password = hashedPassword;
            admin.role = 'admin';
            admin.isVerified = true;
            await admin.save();
            console.log('✅ Admin mis à jour.');
        }

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await sequelize.close();
    }
}

createAdmin();
