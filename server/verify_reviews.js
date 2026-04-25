import mongoose from 'mongoose'
import dotenv from 'dotenv'
import axios from 'axios'
import User from './models/user.model.js'
import Product from './models/product.model.js'
import Review from './models/review.model.js'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const runVerification = async () => {
    try {
        console.log('Current directory:', process.cwd())
        console.log('MONGO_URL exists:', !!process.env.MONGO_URL)

        if (!process.env.MONGO_URL) {
            throw new Error('MONGO_URL is missing')
        }

        await mongoose.connect(process.env.MONGO_URL)
        console.log('Connected to MongoDB')

        const API_URL = 'http://localhost:3003/api'
        const testPhone = '+998998887766'

        // 1. Clean up
        await User.deleteOne({ phone: testPhone })
        const testProduct = await Product.findOne({ name: 'Test Review Product' })
        if (testProduct) {
            await Review.deleteMany({ product: testProduct._id })
            await Product.deleteOne({ _id: testProduct._id })
        }
        console.log('Cleaned up old test data')

        // 2. Create Test User & Login
        console.log('Creating Test User...')
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            username: 'Review Tester',
            phone: testPhone,
            password: 'password123'
        })
        const token = regRes.data.data.token
        console.log('User created and logged in')

        // 3. Create Test Product
        console.log('Creating Test Product...')
        const product = new Product({
            name: 'Test Review Product',
            price: 100,
            category: 'Test',
            images: ['test.jpg'],
            description: 'For testing reviews'
        })
        await product.save()
        console.log('Product created:', product._id)

        // 4. Add Review
        console.log('Adding Review...')
        const reviewRes = await axios.post(`${API_URL}/reviews`, {
            productId: product._id,
            rating: 5,
            comment: 'Great product!'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        console.log('Review added:', reviewRes.data._id)

        // 5. Get Reviews
        console.log('Fetching Reviews...')
        const getRes = await axios.get(`${API_URL}/reviews/${product._id}`)
        const reviews = getRes.data
        console.log('Reviews fetched:', reviews.length)

        if (reviews.length > 0 && reviews[0].comment === 'Great product!') {
            console.log('VERIFICATION SUCCESSFUL!')
        } else {
            console.log('VERIFICATION FAILED: Review not found or incorrect')
        }

        // Cleanup
        await User.deleteOne({ phone: testPhone })
        await Review.deleteMany({ product: product._id })
        await Product.deleteOne({ _id: product._id })
        console.log('Cleanup complete')

    } catch (error) {
        if (error.response) {
            console.error('API Error Status:', error.response.status)
            console.error('API Error Data:', error.response.data)
        } else {
            console.error('Verification Error:', error.message)
        }
    } finally {
        await mongoose.disconnect()
    }
}

runVerification()
