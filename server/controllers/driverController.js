const { DeliveryDriver } = require('../models');

exports.createDriver = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const driver = await DeliveryDriver.create({ name, phone });
        res.status(201).json(driver);
    } catch (err) {
        console.error("Create Driver Error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllDrivers = async (req, res) => {
    try {
        const drivers = await DeliveryDriver.findAll();
        res.json(drivers);
    } catch (err) {
        console.error("Get Drivers Error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteDriver = async (req, res) => {
    try {
        const driver = await DeliveryDriver.destroy({ where: { id: req.params.id } });
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json({ message: 'Driver deleted' });
    } catch (err) {
        console.error("Delete Driver Error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};
