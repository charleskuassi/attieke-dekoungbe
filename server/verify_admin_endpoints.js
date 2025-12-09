async function verifyAdminEndpoints() {
    const baseUrl = 'http://localhost:5000/api';
    try {
        console.log('Testing Admin Endpoints...');

        // 1. Login as Admin
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@attieke.com',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) {
            console.error('Admin login failed:', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Admin logged in. Token obtained.');

        const headers = { 'Authorization': `Bearer ${token}` };

        // 2. Get Orders
        console.log('Fetching Orders...');
        const ordersRes = await fetch(`${baseUrl}/orders/admin`, { headers });
        const orders = await ordersRes.json();
        console.log(`Orders found: ${orders.length}`);

        // 3. Get Clients
        console.log('Fetching Clients...');
        const clientsRes = await fetch(`${baseUrl}/orders/clients`, { headers });
        const clients = await clientsRes.json();
        console.log(`Clients found: ${clients.length}`);

        // 4. Get Stats
        console.log('Fetching Stats...');
        const statsRes = await fetch(`${baseUrl}/orders/stats`, { headers });
        const stats = await statsRes.json();
        console.log('Stats:', JSON.stringify(stats, null, 2));

    } catch (error) {
        console.error('Admin verification failed:', error.message);
    }
}

verifyAdminEndpoints();
