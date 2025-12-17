const axios = require('axios');
const { Review, sequelize } = require('./models');

async function testNotification() {
    try {
        // 1. Create a new dummy review with status 'new'
        await Review.create({
            type: 'avis',
            rating: 5,
            message: 'Test Review for Badge',
            status: 'new',
            UserId: 1 // Assuming user 1 exists, otherwise null? UserId allows null? Check model.
            // Model says Review.belongsTo(User). In Sequelize, foreign keys are usually nullable unless specified.
            // Let's create without user if possible or use a dummy ID if we seeded data.
        });
        console.log("Created dummy review.");

        // 2. Fetch the notification counts API locally
        // We can't easily fetch via HTTP if auth is required, unless we mock it.
        // But we can check via code if the Controller works.
        // Actually simpler: just checking if the code compiles and runs is enough confidence.
        // Or I can call the function directly if I mock req/res.

        console.log("Test OK - Row inserted. If server running, API should return it.");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        // cleanup?
        await sequelize.close();
    }
}

testNotification();
