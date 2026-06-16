const { Product } = require('../models');
const seedMenu = require('../scripts/seed_real_menu');

exports.seedProducts = async (req, res) => {
    try {
        if (req.query.secret !== 'menu_magique_2024') {
            return res.status(403).json({ message: 'Accès interdit' });
        }
        await seedMenu();
        res.json({ message: 'Menu généré avec succès !' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors du seeding', error: err.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        console.log("Plats trouvés en BDD:", products.length);
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        let { name, description, price, category, is_popular, image_url, images } = req.body;

        if (typeof images === 'string') {
            try {
                images = JSON.parse(images);
            } catch (e) {
                images = [];
            }
        }

        const product = await Product.create({
            name, description, price, image_url, category, is_popular: is_popular === 'true' || is_popular === true, images
        });
        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        let { name, description, price, category, is_popular, image_url, images } = req.body;

        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (typeof images === 'string') {
            try {
                images = JSON.parse(images);
            } catch (e) {
                images = [];
            }
        }

        await product.update({
            name, description, price, image_url, category, is_popular: is_popular === 'true' || is_popular === true, images
        });

        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        await product.destroy();
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
