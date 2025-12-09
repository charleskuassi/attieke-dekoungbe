const { sequelize } = require('../models');

async function checkSchema() {
    try {
        await sequelize.authenticate();
        const [results, metadata] = await sequelize.query("PRAGMA table_info(Orders);");
        console.log('--- Order Table Schema ---');
        console.log(JSON.stringify(results, null, 2));
        console.log('--------------------------');
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
