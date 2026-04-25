import mongoose from 'mongoose'
import dotenv from 'dotenv'
import axios from 'axios'
import User from './models/user.model.js'
import Order from './models/order.model.js'

dotenv.config()

const runVerification = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to MongoDB')

        // 1. Clean up test data
        const testPhone = '+998999999999'
        await User.deleteOne({ phone: testPhone })
        await Order.deleteMany({ 'customer.phone': testPhone })
        console.log('Cleaned up old test data')

        const API_URL = 'http://localhost:3003/api'

        // 2. Test Registration
        console.log('Testing Registration...')
        try {
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                username: 'Test User',
                phone: testPhone,
                password: 'password123'
            })
            console.log('Registration: SUCCESS')

            const token = regRes.data.data.token
            const userId = regRes.data.data._id

            // 3. Test Login
            console.log('Testing Login...')
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                phone: testPhone,
                password: 'password123'
            })
            console.log('Login: SUCCESS')

            // 4. Test Create Order with User ID
            console.log('Testing Order Creation with User Link...')
            const orderRes = await axios.post(`${API_URL}/orders`, {
                customer: {
                    name: 'Test User',
                    phone: testPhone,
                    address: 'Test Address'
                },
                items: [{
                    name: 'Test Product',
                    quantity: 1,
                    price: 1000
                }],
                totals: {
                    subtotal: 1000,
                    deliveryFee: 0,
                    total: 1000
                },
                userId: userId
            })
            console.log('Order Creation: SUCCESS')

            // 5. Test Get My Orders
            console.log('Testing Get My Orders...')
            const myOrdersRes = await axios.get(`${API_URL}/orders/my-orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log('Get My Orders: SUCCESS')
            console.log('Orders found:', myOrdersRes.data.data ? myOrdersRes.data.data.length : 0)

            if (myOrdersRes.data.data && myOrdersRes.data.data.length > 0) {
                console.log('VERIFICATION SUCCESSFUL!')
            } else {
                console.log('VERIFICATION FAILED: No orders found')
            }

        } catch (apiError) {
            console.error('API Error:', apiError.response ? apiError.response.data : apiError.message)
        }

    } catch (error) {
        console.error('Verification Error:', error)
    } finally {
        await mongoose.disconnect()
    }
}

runVerification()
