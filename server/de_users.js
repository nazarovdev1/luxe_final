import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import User from './models/user.model.js'
import { connectDB } from './config/db.js'

dotenv.config()

const debugUsers = async () => {
    try {
        await connectDB()

        console.log('--- Checking Users in Database ---')
        const users = await User.find({})

        console.log(`Found ${users.length} users:`)

        for (const user of users) {
            console.log(`\nID: ${user._id}`)
            console.log(`Username: '${user.username}'`) // Quote to see spaces
            console.log(`Phone: '${user.phone}'`)
            console.log(`IsAdmin: ${user.isAdmin}`)

            // Test the requested password
            const isMatch = await bcrypt.compare('admin126', user.password)
            console.log(`Password 'admin126' matches? ${isMatch ? '✅ YES' : '❌ NO'}`)
        }

        console.log('\n----------------------------------')
        process.exit()
    } catch (error) {
        console.error('Error:', error)
        process.exit(1)
    }
}

debugUsers()
