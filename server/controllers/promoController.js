const { Promotion } = require('../models');

// Get the current promotion settings (create default if not exists)
exports.getPromo = async (req, res) => {
    try {
        let promo = await Promotion.findOne();
        if (!promo) {
            promo = await Promotion.create({
                isActive: false,
                minAmount: 15000,
                discountPercentage: 5
            });
        }
        res.json(promo);
    } catch (error) {
        console.error('Error fetching promotion:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Update promotion settings (Admin only)
exports.updatePromo = async (req, res) => {
    try {
        console.log('Update Promo Request Body:', req.body);
        const { isActive, minAmount, discountPercentage } = req.body;

        let promo = await Promotion.findOne();
        if (!promo) {
            console.log('No existing promo found, creating new one.');
            promo = await Promotion.create({
                isActive,
                minAmount,
                discountPercentage
            });
        } else {
            console.log('Updating existing promo:', promo.id);
            await promo.update({
                isActive,
                minAmount,
                discountPercentage
            });
        }

        console.log('Promo updated successfully:', promo.toJSON());
        res.json(promo);
    } catch (error) {
        console.error('Error updating promotion:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};
