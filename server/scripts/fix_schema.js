const { sequelize, OrderItem } = require('../models');

async function fixSchema() {
    try {
        console.log('🔄 Dropping OrderItems table...');
        await OrderItem.drop();
        console.log('✅ OrderItems table dropped.');

        console.log('🔄 Recreating OrderItems table...');
        await OrderItem.sync();
        console.log('✅ OrderItems table recreated.');

        console.log('🎉 SCHEMA FIXED! You can now restart the server.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing schema:', error);
        process.exit(1);
    }
}

fixSchema();
