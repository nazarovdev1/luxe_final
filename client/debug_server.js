const fetch = require('node-fetch');

const API_URL = 'http://127.0.0.1:3003/api';

async function debug() {
    console.log('--- Debugging Server Errors ---');

    // 1. Login to get token
    console.log('\n1. Logging in...');
    let token;
    let userId;
    try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: 'admin', password: 'admin' }) // Trying simpler creds or need real ones
        });

        // If admin/admin fails (it was hardcoded mock in frontend context but checking backend real DB), try creating a user
        if (!loginRes.ok) {
            console.log('Login failed, trying to register a temp user...');
            const regRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'debug_user_' + Date.now(),
                    phone: '99890' + Math.floor(Math.random() * 10000000),
                    password: 'password123'
                })
            });
            const regData = await regRes.json();
            if (regData.success) {
                token = regData.data.token;
                userId = regData.data._id;
                console.log('Registered temp user. Token:', token ? 'Yes' : 'No');
            } else {
                console.error('Registration failed:', regData);
                return;
            }
        } else {
            const loginData = await loginRes.json();
            if (loginData.success) {
                token = loginData.data.token;
                userId = loginData.data._id;
                console.log('Login successful. Token:', token ? 'Yes' : 'No');
            } else {
                console.log('Login failed:', loginData);
                // Fallback to register
            }
        }

    } catch (e) {
        console.error('Auth error:', e.message);
        return;
    }

    if (!token) {
        console.error('Could not get token, aborting.');
        return;
    }

    // 2. Test Update Cart
    console.log('\n2. Testing /api/auth/cart (PUT)...');
    try {
        const cartRes = await fetch(`${API_URL}/auth/cart`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                cart: [{ productId: '123', name: 'Test Product', quantity: 1 }]
            })
        });

        console.log('Status:', cartRes.status);
        const cartText = await cartRes.text();
        console.log('Body:', cartText);
    } catch (e) {
        console.error('Cart Update Error:', e.message);
    }

    // 3. Test Create Order
    console.log('\n3. Testing /api/orders (POST)...');
    try {
        const orderRes = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Authorization might be optional for orders depending on implementation, but usually public
            },
            body: JSON.stringify({
                customer: {
                    name: 'Debug User',
                    phone: '998901234567',
                    address: 'Debug Address',
                    location: { lat: 41.0, lng: 69.0 }
                },
                items: [{ name: 'Test Item', quantity: 1, price: 1000 }],
                totals: { total: 1000 },
                paymentMethod: 'cash'
            })
        });

        console.log('Status:', orderRes.status);
        const orderText = await orderRes.text();
        console.log('Body:', orderText);

    } catch (e) {
        console.error('Create Order Error:', e.message);
    }
}

debug();
