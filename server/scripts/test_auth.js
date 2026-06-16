const axios = require('axios');

async function testAuth() {
    const API_URL = 'http://localhost:5000/api/auth';

    try {
        console.log('Testing Login (Admin)...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: 'admin@attieke.com',
            password: 'admin123'
        });
        console.log('Login Success:', loginRes.data.user.email);
    } catch (err) {
        console.error('Login Failed:', err.response ? err.response.data : err.message);
    }

    try {
        console.log('\nTesting Register (New User)...');
        const email = `testuser_${Date.now()}@example.com`;
        const registerRes = await axios.post(`${API_URL}/register`, {
            name: 'Test User',
            email: email,
            password: 'password123',
            phone: '0197000000',
            address: 'Test Address'
        });
        console.log('Register Success:', registerRes.data.user.email);
    } catch (err) {
        console.error('Register Failed:', err.response ? err.response.data : err.message);
    }
}

testAuth();
