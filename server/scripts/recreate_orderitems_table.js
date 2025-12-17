const { sequelize } = require('../models');

async function recreateTable() {
  try {
    console.log('⚠️ Recreating OrderItems table to remove UNIQUE on OrderId...');
    await sequelize.query('PRAGMA foreign_keys=OFF;');
    await sequelize.query('BEGIN TRANSACTION;');

    // Create new table without UNIQUE constraint on OrderId
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS OrderItems_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quantity INTEGER NOT NULL DEFAULT 1,
        price_at_order REAL NOT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        OrderId INTEGER,
        ProductId INTEGER
      );
    `);

    // Copy data
    await sequelize.query(`
      INSERT INTO OrderItems_new (id, quantity, price_at_order, createdAt, updatedAt, OrderId, ProductId)
      SELECT id, quantity, price_at_order, createdAt, updatedAt, OrderId, ProductId FROM OrderItems;
    `);

    // Drop old table
    await sequelize.query(`DROP TABLE IF EXISTS OrderItems;`);

    // Rename new table
    await sequelize.query(`ALTER TABLE OrderItems_new RENAME TO OrderItems;`);

    // Recreate useful indexes (non-unique)
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_OrderItems_ProductId ON OrderItems (ProductId);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_OrderItems_OrderId_ProductId ON OrderItems (OrderId, ProductId);`);

    await sequelize.query('COMMIT;');
    await sequelize.query('PRAGMA foreign_keys=ON;');

    console.log('✅ Recreated OrderItems table and restored indexes.');
  } catch (err) {
    console.error('❌ Failed to recreate OrderItems table:', err.message);
    try { await sequelize.query('ROLLBACK;'); } catch (e) { /* ignore */ }
  } finally {
    await sequelize.close();
  }
}

recreateTable();
