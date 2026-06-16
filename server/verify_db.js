const { sequelize, Promotion } = require('./models');

async function verifyDB() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        await sequelize.sync({ alter: true }); // Force update schema
        console.log('Database synced.');

        const promo = await Promotion.findOne();
        console.log('Current Promo:', promo ? promo.toJSON() : 'None');

        if (!promo) {
            await Promotion.create({
                isActive: false,
                minAmount: 15000,
                discountPercentage: 5
            });
            console.log('Default promo created.');
        }

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

verifyDB();
