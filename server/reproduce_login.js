async function testAuth() {
    const baseUrl = 'http://localhost:5000/api/auth';
    const testUser = {
        name: 'Test User',
        email: 'test' + Date.now() + '@example.com',
        password: 'password123',
        phone: '1234567890',
        address: '123 Test St'
    };

    try {
        console.log('1. Testing Registration...');
        const regRes = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const regData = await regRes.json();
        console.log('Registration Status:', regRes.status);
        console.log('Registration Response:', regData);

        if (!regRes.ok) throw new Error('Registration failed');

        console.log('\n2. Testing Login...');
        const loginRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });

        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        console.log('Login Response:', loginData);

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testAuth();
