const { sequelize } = require('../models');

async function fixSchema() {
    try {
        console.log("🔍 Checking OrderItems table constraints...");
        const [indexes] = await sequelize.query("PRAGMA index_list('OrderItems')");

        let fixed = false;
        for (const idx of indexes) {
            // Check for unique indexes that are not primary keys (origin 'c' usually means created definition)
            if (idx.unique === 1 && idx.origin === 'c') {
                const [cols] = await sequelize.query(`PRAGMA index_info('${idx.name}')`);
                const isOrderId = cols.some(c => c.name === 'OrderId');

                // If uniqueness is ONLY on OrderId (or OrderId + something else that restricts incorrecty)
                // Actually, OrderItems should NOT have a unique index on OrderId alone.
                // It might have unique(OrderId, ProductId).

                // If it's pure OrderId, kill it.
                if (cols.length === 1 && cols[0].name === 'OrderId') {
                    console.log(`⚠️ Found incorrect UNIQUE index on OrderId: ${idx.name}`);
                    await sequelize.query(`DROP INDEX "${idx.name}"`);
                    console.log(`✅ Index ${idx.name} dropped.`);
                    fixed = true;
                }
            }
        }

        if (!fixed) {
            console.log("✅ No incorrect UNIQUE constraints found on OrderId.");
        }

    } catch (err) {
        console.error("❌ Error fixing schema:", err);
    } finally {
        await sequelize.close();
    }
}

fixSchema();
