async function testCreateOrder() {
    const baseUrl = 'http://localhost:5000/api';
    const email = 'testorder' + Date.now() + '@example.com';
    const password = 'password123';

    try {
        console.log('1. Registering user...');
        const regRes = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Order User',
                email,
                password,
                phone: '0123456789',
                address: 'Test Address'
            })
        });

        if (!regRes.ok) {
            console.error('Registration failed:', await regRes.text());
            return;
        }

        const regData = await regRes.json();
        const token = regData.token;
        console.log('Got token from registration');

        // 2. Create Order with status 'paid'
        console.log('2. Creating Order with status "paid"...');
        const orderData = {
            customer_name: 'Test Customer',
            phone: '0123456789',
            address: 'Test Address',
            items: [{ id: 1, quantity: 1 }],
            total_price: 1000,
            payment_method: 'mobile_money',
            status: 'paid' // This should fail
        };

        const res = await fetch(`${baseUrl}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        const data = await res.json();
        console.log('Order creation status:', res.status);
        console.log('Order creation response:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testCreateOrder();
