import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Product from './models/product.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const checkLatestProduct = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        const product = await Product.findOne().sort({ createdAt: -1 });
        let output = '';
        if (product) {
            output += `Latest Product Name: ${product.name}\n`;
            output += `Latest Product Price: ${product.price}\n`;
            output += `Latest Product Original Price: ${product.originalPrice}\n`;
            output += `Latest Product Images: ${JSON.stringify(product.images, null, 2)}\n`;
            output += `Latest Product ID: ${product._id}\n`;
        } else {
            output = 'No products found';
        }

        fs.writeFileSync('product_check_result.txt', output);
        console.log('Done writing to file');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkLatestProduct();
