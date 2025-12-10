const { sequelize } = require('../models');

(async () => {
  try {
    console.log('Dropping Products_backup if exists...');
    await sequelize.query('DROP TABLE IF EXISTS Products_backup;');
    console.log('Done.');
  } catch (err) {
    console.error('Error dropping Products_backup:', err.message);
  } finally {
    await sequelize.close();
  }
})();
