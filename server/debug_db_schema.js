const { sequelize } = require('./models');

async function checkSchema() {
    try {
        const [results, metadata] = await sequelize.query("PRAGMA index_list('OrderItems')");
        console.log("Indexes on OrderItems:", results);

        const [columns, meta2] = await sequelize.query("PRAGMA table_info('OrderItems')");
        console.log("Columns on OrderItems:", columns);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
