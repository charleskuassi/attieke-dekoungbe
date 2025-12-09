const { sequelize } = require('./models');

async function checkSchema() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("PRAGMA table_info('Orders');"); // Sequelize usually pluralizes, but let's check both or use model name
        console.log('Orders table columns:', results);

        // If table name is singular 'Order' (which is reserved in SQL, so usually quoted or pluralized)
        // My model definition says `sequelize.define('Order', ...)` so it might be `Orders` or `Order` depending on config.
        // Let's check all tables first.
        const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
        console.log('Tables:', tables);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
