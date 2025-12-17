const axios = require('axios');

async function checkLibrary() {
    const baseUrl = 'http://localhost:5000/api';
    const credentials = {
        email: 'admin@attieke.com',
        password: 'admin123'
    };

    try {
        console.log('1. Logging in as Admin...');
        const loginRes = await axios.post(`${baseUrl}/auth/login`, credentials);

        const token = loginRes.data.token;
        console.log('Login successful. Token obtained.');

        console.log('\n2. Fetching Library Images...');
        const libRes = await axios.get(`${baseUrl}/admin/library`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(`Library fetch successful. Found ${libRes.data.length} images.`);
        if (libRes.data.length > 0) {
            console.log('First image:', libRes.data[0]);
        }

    } catch (err) {
        if (err.response) {
            console.error('API Error:', err.response.status, err.response.data);
        } else {
            console.error('Network/Code Error:', err.message);
        }
    }
}

checkLibrary();
