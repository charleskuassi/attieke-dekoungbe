const { sequelize, Product } = require('../models');

async function debugImages() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');
        const products = await Product.findAll();
        console.log('--- Product Image URLs ---');
        products.forEach(p => {
            console.log(`[${p.id}] ${p.name}: "${p.image_url}"`);
        });
        console.log('--------------------------');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugImages();
