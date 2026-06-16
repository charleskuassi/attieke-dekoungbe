const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { User, sequelize } = require('./models');
const crypto = require('crypto');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB');

        // Check columns
        const desc = await sequelize.getQueryInterface().describeTable('Users');
        console.log('📋 Columns in Users table:', Object.keys(desc));

        if (!desc.resetPasswordToken) {
            console.error('❌ COLUMN resetPasswordToken MISSING!');
        } else {
            console.log('✅ Column resetPasswordToken exists.');
        }

        // Test User Save logic
        const email = 'legerolt@gmail.com'; // User from screenshot
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log(`⚠️ User ${email} not found. Creating test user...`);
            const testUser = await User.create({
                name: 'Test Leger',
                email: email,
                password: 'password123',
                role: 'admin',
                isVerified: true
            });
            console.log('✅ Test user created.');
            return testUser;
        } else {
            console.log(`✅ User ${email} found.`);

            // Simulate Forgot Password Logic
            const resetToken = crypto.randomBytes(20).toString('hex');
            user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            user.resetPasswordExpires = Date.now() + 3600000;

            console.log('💾 Attempting to save user with new token...');
            await user.save();
            console.log('✅ User saved successfully with reset token.');
        }

    } catch (err) {
        console.error('❌ ERROR:', err);
    } finally {
        await sequelize.close();
    }
}

test();
