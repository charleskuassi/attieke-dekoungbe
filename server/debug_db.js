const { sequelize } = require('./models');

(async () => {
    try {
        // Check Columns for OrderItems
        const [results] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'OrderItems';");
        console.log('✅ TABLE OrderItems COLUMNS:', results.map(r => r.column_name));

        // Check if table exists with lowercase "orderitems" if empty
        if (results.length === 0) {
            const [resultsLower] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'orderitems';");
            console.log('✅ TABLE orderitems (lower) COLUMNS:', resultsLower.map(r => r.column_name));
        }

    } catch (error) {
        console.error('❌ ERROR:', error);
    } finally {
        process.exit(0);
    }
})();
