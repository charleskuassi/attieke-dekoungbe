const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function verifyAdmin() {
    try {
        const admin = await User.findOne({ where: { email: 'admin@attieke.com' } });
        if (!admin) {
            console.log('Admin user NOT found!');
            return;
        }
        console.log('Admin user found:', admin.email);

        const isMatch = await bcrypt.compare('admin123', admin.password);
        console.log('Password "admin123" match:', isMatch);

    } catch (err) {
        console.error('Error:', err);
    }
}

verifyAdmin();
