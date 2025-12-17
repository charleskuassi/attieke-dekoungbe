const { Product, sequelize } = require('../models');
const fs = require('fs');

async function extractMapping() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const products = await Product.findAll();

        const mapping = {};

        products.forEach(p => {
            // We trust the local DB. If it has an image_url, we save it.
            if (p.image_url && p.name) {
                mapping[p.name] = p.image_url;
            }
        });

        console.log('--- JSON MAPPING START ---');
        fs.writeFileSync('server/scripts/local_mapping_clean.json', JSON.stringify(mapping, null, 2));
        console.log('Wrote mapping to server/scripts/local_mapping_clean.json');
        console.log('--- JSON MAPPING END ---');

    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}

extractMapping();
