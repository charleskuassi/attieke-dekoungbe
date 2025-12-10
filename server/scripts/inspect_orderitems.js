const { sequelize } = require('../models');

(async () => {
  try {
    const [info] = await sequelize.query("PRAGMA table_info('OrderItems')");
    console.log('PRAGMA table_info OrderItems:');
    console.dir(info, { depth: null });

    const [indexes] = await sequelize.query("PRAGMA index_list('OrderItems')");
    console.log('\nPRAGMA index_list OrderItems:');
    console.dir(indexes, { depth: null });

    for (const idx of indexes) {
      const [cols] = await sequelize.query(`PRAGMA index_info('${idx.name}')`);
      console.log(`\nIndex ${idx.name} info:`);
      console.dir(cols, { depth: null });
    }

    const [master] = await sequelize.query("SELECT sql FROM sqlite_master WHERE tbl_name='OrderItems' AND type='table'");
    console.log('\nCREATE TABLE SQL:');
    console.log(master[0] && master[0].sql);
  } catch (err) {
    console.error('Inspect error:', err.message);
  } finally {
    await sequelize.close();
  }
})();
