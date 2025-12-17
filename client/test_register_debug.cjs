
const axios = require('axios');

async function testRegister() {
    try {
        const url = 'http://localhost:5000/api/auth/register';
        console.log(`Testing POST to ${url}`);

        const data = {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            phone: '12345678',
            address: '123 Test St'
        };

        const response = await axios.post(url, data);
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testRegister();
