const { sequelize } = require('./models');

async function checkSchema() {
    try {
        const [results, metadata] = await sequelize.query("PRAGMA index_list('OrderItems')");
        console.log("Indexes on OrderItems:", JSON.stringify(results, null, 2));

        const [columns, metaColumns] = await sequelize.query("PRAGMA table_info('OrderItems')");
        console.log("Columns on OrderItems:", JSON.stringify(columns, null, 2));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
