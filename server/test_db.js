import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testDB = async () => {
    try {
        console.log('Testing MongoDB connection...');
        console.log('URL:', process.env.MONGO_URL);
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        process.exit(0);
    } catch (error) {
        console.error('Mongo DB Error:', error.message);
        process.exit(1);
    }
};

testDB();
