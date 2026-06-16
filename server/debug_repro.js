const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        console.log('--- STARTING DEBUG REPRO ---');

        // 1. Register/Login
        const email = `debug_${Date.now()}@test.com`;
        const userPayload = {
            name: 'Debug User',
            email,
            password: 'password123',
            phone: '97000000',
            address: 'Debug Address'
        };

        console.log('1. Registering User...');
        let token;
        try {
            const regRes = await axios.post(`${BASE_URL}/auth/register`, userPayload);
            token = regRes.data.token;
            console.log('✅ Registered. Token acquired.');
        } catch (e) {
            console.error('❌ Register Failed:', e.response?.data || e.message);
            return;
        }

        // 2. Update Profile (Reproduce Settings Bug)
        console.log('\n2. Testing Update Profile...');
        try {
            const updatePayload = {
                name: 'Debug Update',
                phone: '97000000',
                address: 'New Address'
            };
            const updateRes = await axios.put(`${BASE_URL}/auth/profile`, updatePayload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Profile Update Success:', updateRes.data);
        } catch (e) {
            console.error('❌ Profile Update FAILED:');
            console.error('   Status:', e.response?.status);
            console.error('   Data:', JSON.stringify(e.response?.data, null, 2));
        }

        // 3. Create Order (Reproduce Checkout Bug)
        console.log('\n3. Testing Create Order...');
        try {
            const orderPayload = {
                customer_name: 'Debug User',
                phone: '97000000',
                address: 'New Address',
                items: [
                    { id: 1, quantity: 1 } // Assuming product ID 1 exists
                ],
                total_price: 5000,
                payment_method: 'mobile_money',
                transaction_id: 'DEBUG_TX_123',
                status: 'paid'
            };

            const orderRes = await axios.post(`${BASE_URL}/orders`, orderPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Order Create Success:', orderRes.data);
        } catch (e) {
            console.error('❌ Order Create FAILED:');
            console.error('   Status:', e.response?.status);
            console.error('   Data:', JSON.stringify(e.response?.data, null, 2));
        }

    } catch (err) {
        console.error('Global Error:', err);
    }
}

runTest();
