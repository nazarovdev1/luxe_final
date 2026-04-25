import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = 3003;
const BASE_URL = `http://localhost:${PORT}/api`;

async function verifyAPI() {
    console.log('--- API RBAC VERIFICATION ---');
    
    try {
        // 1. Check public endpoints
        const products = await axios.get(`${BASE_URL}/products`);
        console.log(`✅ Public GET /products: Found ${products.data?.length || 0} products`);

        // 2. Check protected endpoint without token (should fail)
        try {
            await axios.get(`${BASE_URL}/orders/all`);
            console.log('❌ Protected GET /orders/all: Allowed without token (FAILED)');
        } catch (err) {
            console.log(`✅ Protected GET /orders/all: Blocked as expected (${err.response?.status})`);
        }

        console.log('--- VERIFICATION COMPLETE ---');
    } catch (error) {
        console.log(`⚠️ Verification stopped: ${error.message}. Is server running?`);
    }
}

verifyAPI();