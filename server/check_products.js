const { Product } = require('./models');
const sequelize = require('./config/database');

async function checkProducts() {
    try {
        await sequelize.authenticate();
        const count = await Product.count();
        console.log(`Product count: ${count}`);
        const products = await Product.findAll({ attributes: ['name'] });
        console.log('Products:', products.map(p => p.name));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkProducts();
