const { sequelize, Announcement } = require('./models');
const cloudinary = require('./config/cloudinary');
require('dotenv').config();

async function testAdminFeatures() {
    try {
        await sequelize.sync();
        console.log('✅ DB Connected');

        // Test Announcement
        let announcement = await Announcement.findOne();
        if (!announcement) {
            console.log('ℹ️ No announcement found, creating one...');
            announcement = await Announcement.create({ message: 'Test Announcement', isActive: true });
        }
        console.log('✅ Announcement Fetched:', announcement.toJSON());

        // Test Cloudinary Config
        console.log('ℹ️ Cloudinary Config Check:');
        console.log('   - CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'OK' : 'MISSING');
        console.log('   - CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'OK' : 'MISSING');
        console.log('   - CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'OK' : 'MISSING');

        // Verify valid configuration object
        try {
            const ping = await cloudinary.api.ping();
            console.log('✅ Cloudinary Connection OK:', ping);
        } catch (cloudErr) {
            console.error('❌ Cloudinary Connection Failed:', cloudErr.message);
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
    } finally {
        await sequelize.close();
    }
}

testAdminFeatures();
