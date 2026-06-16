const { sequelize } = require('./models');

async function checkSchema() {
    try {
        console.log("--- INDEXES ---");
        const [results] = await sequelize.query("PRAGMA index_list('OrderItems')");
        for (const idx of results) {
            console.log(`Index: ${idx.name} (unique: ${idx.unique})`);
            const [info] = await sequelize.query(`PRAGMA index_info('${idx.name}')`);
            console.log("  Columns:", info.map(c => c.name).join(', '));
        }

        console.log("\n--- COLUMNS ---");
        const [columns] = await sequelize.query("PRAGMA table_info('OrderItems')");
        for (const col of columns) {
            console.log(`Col: ${col.name} (pk: ${col.pk})`);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
