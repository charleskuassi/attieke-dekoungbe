const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

async function fixAdmin() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to Database');

        const email = 'admin@attieke.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        let admin = await User.findOne({ where: { email } });

        if (admin) {
            console.log(`👤 Admin existant trouvé (ID: ${admin.id}). Mise à jour...`);
            admin.password = hashedPassword;
            admin.role = 'admin';
            admin.isVerified = true;
            await admin.save();
            console.log('✅ Admin mis à jour avec succès !');
        } else {
            console.log('⚠️ Admin non trouvé. Création...');
            admin = await User.create({
                name: 'Admin User',
                email: email,
                password: hashedPassword,
                phone: '0000000000',
                address: 'Admin HQ',
                role: 'admin',
                isVerified: true
            });
            console.log('✅ Admin créé avec succès !');
        }

        console.log('🔑 Identifiants confirmés :');
        console.log(`   Email: ${email}`);
        console.log(`   Pass : ${password}`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await sequelize.close();
    }
}

fixAdmin();
