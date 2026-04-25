import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env using the correct path
dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
    try {
        const uri = process.env.MONGO_URL;
        if (!uri) throw new Error('MONGO_URL not found in environment');
        
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(uri);
        console.log('✅ MongoDB Connection Successful');
        
        // Import models after connection
        const { default: User } = await import('./models/user.model.js');
        const { default: Product } = await import('./models/product.model.js');
        
        const userCount = await User.countDocuments();
        const prodCount = await Product.countDocuments();
        
        console.log(`📊 DB Stats: Users: ${userCount}, Products: ${prodCount}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        process.exit(1);
    }
}

testConnection();