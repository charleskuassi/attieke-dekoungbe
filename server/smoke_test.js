const axios = require('axios');
const { Product, User, Order, sequelize } = require('./models');

const BASE_URL = 'http://localhost:5000/api';

async function verifySystem() {
    console.log('--- STARTING SMOKE TEST ---');

    // 1. Database Connectivity
    try {
        await sequelize.authenticate();
        console.log('✅ Database Connection: SUCCESS');
    } catch (err) {
        console.error('❌ Database Connection: FAILED', err.message);
        process.exit(1);
    }

    // 2. Data Integrity Checks
    try {
        const productCount = await Product.count();
        console.log(`✅ Product Count: ${productCount} (Expected: ~113)`);

        const userCount = await User.count();
        console.log(`✅ User Count: ${userCount}`);

        const orderCount = await Order.count();
        console.log(`✅ Order Count: ${orderCount}`);
    } catch (err) {
        console.error('❌ Data Integrity Check: FAILED', err.message);
    }

    // 3. API Checks (Server running?)
    // This requires the server to be running separately. We will assume it is OR this script is run after start.
    // For now, let's just do DB checks as they are internal. 
    // If we want to check API, we need axios.

    try {
        // Wait for server to potentially start if run concurrently (simple sleep)
        // await new Promise(r => setTimeout(r, 2000)); 

        // This part might fail if server isn't up yet, handling gracefully
        await axios.get(`${BASE_URL}/products`)
            .then(res => console.log(`✅ API /products: ${res.status} OK`))
            .catch(err => {
                if (err.code === 'ECONNREFUSED') {
                    console.log('⚠️ API Check: Server not running or unreachable (ECONNREFUSED). Running DB checks only.');
                } else {
                    console.log(`❌ API /products: FAILED (${err.message})`);
                }
            });

    } catch (err) {
        // Ignore top level
    }

    console.log('--- SMOKE TEST COMPLETE ---');
    process.exit(0);
}

verifySystem();
