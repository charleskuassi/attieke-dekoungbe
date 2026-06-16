const axios = require('axios');
const BASE_URL = 'http://localhost:5001/api';

async function runTest() {
    try {
        console.log('--- STARTING DEBUG REPRO (local port 5001) ---');

        const email = `debug_${Date.now()}@test.com`;
        const userPayload = { name: 'Debug User', email, password: 'password123', phone: '97000000', address: 'Debug Address' };

        let token;
        try { const regRes = await axios.post(`${BASE_URL}/auth/register`, userPayload); token = regRes.data.token; console.log('✅ Registered.'); }
        catch (e) { console.error('Register Failed:', e.response?.data || e.message); return; }

        try { const updatePayload = { name: 'Debug Update', phone: '97000000', address: 'New Address' }; await axios.put(`${BASE_URL}/auth/profile`, updatePayload, { headers: { Authorization: `Bearer ${token}` } }); console.log('✅ Profile Update Success'); }
        catch (e) { console.error('Profile Update FAILED:', e.response?.data || e.message); }

        try {
            // Choose a product id that exists in DB - try 1
            const orderPayload = {
                items: [ { id: 1, quantity: 1 } ],
                total: 5000,
                deliveryInfo: { name: 'Debug User', phone: '97000000', address: 'New Address' },
                paymentMethod: 'mobile_money',
                transactionId: `DEBUG_TX_${Date.now()}`
            };

            const orderRes = await axios.post(`${BASE_URL}/orders`, orderPayload, { headers: { Authorization: `Bearer ${token}` } });
            console.log('✅ Order Create Success:', orderRes.data);
        } catch (e) {
            console.error('Order Create FAILED:');
            console.error('   Status:', e.response?.status);
            console.error('   Data:', JSON.stringify(e.response?.data, null, 2));
        }

    } catch (err) { console.error('Global Error:', err); }
}

runTest();
