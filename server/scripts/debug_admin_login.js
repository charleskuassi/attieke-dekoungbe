const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

async function debugAdmin() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to Database');

        const email = 'admin@attieke.com';
        const passwordToCheck = 'admin123';

        // 1. Fetch User
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.error('❌ Admin user NOT found in DB!');
            return;
        }

        console.log(`👤 User Found: ID=${user.id}, Role=${user.role}, Verified=${user.isVerified}`);
        console.log(`🔑 Stored Hash: ${user.password.substring(0, 20)}...`);

        // 2. Compare Password
        console.log(`🔍 Comparing password '${passwordToCheck}'...`);
        const isValid = await bcrypt.compare(passwordToCheck, user.password);

        if (isValid) {
            console.log('✅ PASSWORD IS CORRECT! The hash matches "admin123".');
            console.log('👉 If login fails on site, the issue is NETWORK or BUILD (not the password).');
        } else {
            console.error('❌ INVALID PASSWORD. The hash in DB does not match "admin123".');

            // Fix it immediately if wrong
            console.log('🛠️ Fixing password now...');
            const newHash = await bcrypt.hash(passwordToCheck, 10);
            user.password = newHash;
            await user.save();
            console.log('✅ Password Reset to "admin123". Try again.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugAdmin();
