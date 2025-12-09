const fs = require('fs');
const path = require('path');

async function verifyProductRoutes() {
    const baseUrl = 'http://localhost:5000/api';
    let token;
    let productId;

    try {
        console.log('--- Testing Product Routes ---');

        // 1. Login
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@attieke.com', password: 'admin123' })
        });
        if (!loginRes.ok) throw new Error('Login failed');
        token = (await loginRes.json()).token;
        console.log('Login successful');

        // 2. Create Product (Multipart)
        const formData = new FormData();
        formData.append('name', 'Test Product');
        formData.append('description', 'Test Description');
        formData.append('price', '1000');
        formData.append('category', 'plats');
        formData.append('is_popular', 'false');
        // We won't upload a real file here to keep it simple, but the endpoint handles it optional

        const createRes = await fetch(`${baseUrl}/products`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }, // Fetch handles multipart boundary automatically if we pass FormData
            body: formData
        });

        if (!createRes.ok) {
            console.error('Create failed:', await createRes.text());
            throw new Error('Create product failed');
        }
        const newProduct = await createRes.json();
        productId = newProduct.id;
        console.log('Product created:', newProduct.name, `(ID: ${productId})`);

        // 3. Update Product
        const updateData = new FormData();
        updateData.append('name', 'Updated Product');
        updateData.append('price', '1500');

        const updateRes = await fetch(`${baseUrl}/products/${productId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: updateData
        });

        if (!updateRes.ok) throw new Error('Update product failed');
        const updatedProduct = await updateRes.json();
        console.log('Product updated:', updatedProduct.name, updatedProduct.price);

        // 4. Delete Product
        const deleteRes = await fetch(`${baseUrl}/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!deleteRes.ok) throw new Error('Delete product failed');
        console.log('Product deleted');

    } catch (error) {
        console.error('Verification failed:', error.message);
    }
}

verifyProductRoutes();
