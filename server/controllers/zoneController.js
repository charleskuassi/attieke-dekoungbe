const { DeliveryZone } = require('../models');

exports.getAllZones = async (req, res) => {
    try {
        // Return all zones. Frontend can filter active if needed, or we just manage deletion.
        const zones = await DeliveryZone.findAll();
        res.json(zones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createZone = async (req, res) => {
    try {
        const { name, price } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ message: 'Nom et Prix requis' });
        }
        const zone = await DeliveryZone.create({ name, price });
        res.status(201).json(zone);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteZone = async (req, res) => {
    try {
        await DeliveryZone.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Zone supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
