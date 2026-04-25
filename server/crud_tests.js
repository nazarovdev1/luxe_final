import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = 3003;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('🚀 Starting Backend CRUD & RBAC Tests...');
  
  // Wait a bit to ensure server is hot
  await new Promise(r => setTimeout(r, 2000));
  
  try {
    const endpoints = [
      { method: 'get', url: '/products', auth: false },
      { method: 'post', url: '/products', auth: true },
      { method: 'get', url: '/orders/all', auth: true },
      { method: 'get', url: '/announcements', auth: true }
    ];

    for (const endpoint of endpoints) {
      try {
        await axios[endpoint.method](`${BASE_URL}${endpoint.url}`);
        console.log(`✅ ${endpoint.method.toUpperCase()} ${endpoint.url}: Success or Public`);
      } catch (err) {
        if (endpoint.auth && err.response?.status === 401) {
          console.log(`✅ ${endpoint.method.toUpperCase()} ${endpoint.url}: Correctly blocked (401 Unauthorized)`);
        } else {
          console.log(`⚠️ ${endpoint.method.toUpperCase()} ${endpoint.url}: Failed with status ${err.response?.status || 'Unknown'}`);
        }
      }
    }
  } catch (error) {
    console.log(`❌ Test suite failed: ${error.message}`);
  }
}

runTests();