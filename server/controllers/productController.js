const { Product } = require('../models');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, is_popular } = req.body;
        let image_url = req.body.image_url;

        if (req.file) {
            image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const product = await Product.create({
            name, description, price, image_url, category, is_popular: is_popular === 'true'
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
        const { name, description, price, category, is_popular } = req.body;
        let image_url = req.body.image_url;

        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (req.file) {
            image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        await product.update({
            name, description, price, image_url, category, is_popular: is_popular === 'true'
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
