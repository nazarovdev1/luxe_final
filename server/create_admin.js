import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/user.model.js'
import { connectDB } from './config/db.js'

dotenv.config()

const createAdmin = async () => {
    try {
        await connectDB()

        const adminUsername = 'admin536'
        const adminPassword = 'admin126'
        const adminPhone = '+998990000536' // Unique placeholder phone

        // Check if admin already exists
        const userExists = await User.findOne({ username: adminUsername })

        if (userExists) {
            // Update password if exists
            userExists.password = adminPassword
            userExists.isAdmin = true
            userExists.role = 'admin'
            await userExists.save()
            console.log('Admin password updated to: ' + adminPassword)
            process.exit()
        }

        const user = await User.create({
            username: adminUsername,
            phone: adminPhone,
            password: adminPassword,
            isAdmin: true,
            role: 'admin'
        })

        console.log('✅ Admin user created successfully!')
        console.log('Username: ' + adminUsername)
        console.log('Password: ' + adminPassword)

        process.exit()
    } catch (error) {
        console.error('Error:', error)
        process.exit(1)
    }
}

createAdmin()
