const { sequelize } = require('../models');

async function recreateV2() {
  try {
    console.log('⚠️ Recreating OrderItems table v2: add id PK, remove per-column UNIQUE on OrderId/ProductId');
    await sequelize.query('PRAGMA foreign_keys=OFF;');
    await sequelize.query('BEGIN TRANSACTION;');

    // Create new table with correct schema
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS OrderItems_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quantity INTEGER NOT NULL DEFAULT 1,
        price_at_order REAL NOT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        OrderId INTEGER NOT NULL REFERENCES Orders(id),
        ProductId INTEGER NOT NULL REFERENCES Products(id),
        UNIQUE (OrderId, ProductId)
      );
    `);

    // Copy data from old to new
    await sequelize.query(`
      INSERT INTO OrderItems_new (quantity, price_at_order, createdAt, updatedAt, OrderId, ProductId)
      SELECT quantity, price_at_order, createdAt, updatedAt, OrderId, ProductId FROM OrderItems;
    `);

    // Drop old table and rename new one
    await sequelize.query('DROP TABLE IF EXISTS OrderItems;');
    await sequelize.query('ALTER TABLE OrderItems_new RENAME TO OrderItems;');

    // Create helpful indexes (non-unique except the UNIQUE(OrderId,ProductId) already exists)
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_OrderItems_ProductId ON OrderItems (ProductId);');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_OrderItems_OrderId ON OrderItems (OrderId);');

    await sequelize.query('COMMIT;');
    await sequelize.query('PRAGMA foreign_keys=ON;');

    console.log('✅ Recreated OrderItems table v2 successfully.');
  } catch (err) {
    console.error('❌ recreate v2 failed:', err.message);
    try { await sequelize.query('ROLLBACK;'); } catch (e) { /* ignore */ }
  } finally {
    await sequelize.close();
  }
}

recreateV2();
