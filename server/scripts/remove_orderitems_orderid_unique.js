const { sequelize } = require('../models');

async function removeUniqueOnOrderId() {
  try {
    console.log('🔍 Listing indexes for OrderItems...');
    const [indexes] = await sequelize.query("PRAGMA index_list('OrderItems')");

    for (const idx of indexes) {
      try {
        // Only consider unique indexes
        if (!idx.unique) continue;

        const [cols] = await sequelize.query(`PRAGMA index_info('${idx.name}')`);
        const colNames = cols.map(c => c.name);

        // If the index covers exactly the OrderId column, drop it
        if (colNames.length === 1 && colNames[0] === 'OrderId') {
          console.log(`⚠️ Dropping unique index '${idx.name}' on OrderId`);
          await sequelize.query(`DROP INDEX IF EXISTS "${idx.name}"`);
          console.log(`✅ Dropped ${idx.name}`);
        } else {
          console.log(`ℹ️ Skipping index '${idx.name}' columns=[${colNames.join(',')}]`);
        }
      } catch (innerErr) {
        console.error('Error inspecting/dropping index', idx.name, innerErr.message);
      }
    }

    // As an additional guard, inspect sqlite_master for any column-level UNIQUE on OrderItems
    const [masters] = await sequelize.query("SELECT name, sql FROM sqlite_master WHERE tbl_name='OrderItems' AND type='table'");
    if (masters.length > 0) {
      const sql = masters[0].sql || '';
      if (/UNIQUE\s*\(\s*\"?OrderId\"?\s*\)/i.test(sql)) {
        console.log('⚠️ Table definition contains UNIQUE(OrderId) in CREATE TABLE SQL.');
        console.log('ℹ️ Recreating table without UNIQUE(OrderId) is required.');
        console.log('✋ Aborting automated recreate to avoid data loss — please run manual migration.');
      } else {
        console.log('✅ No inline UNIQUE(OrderId) in CREATE TABLE SQL.');
      }
    }

  } catch (err) {
    console.error('❌ Error while removing unique constraint:', err.message);
  } finally {
    await sequelize.close();
  }
}

removeUniqueOnOrderId();
