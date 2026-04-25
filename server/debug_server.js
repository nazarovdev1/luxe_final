// DEBUG SCRIPT - Production serverda ishga tushiring
// node debug_server.js

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

console.log('========================================')
console.log('🔍 LUXE DEBUG SCRIPT')
console.log('========================================')
console.log('')

// 1. Environment tekshirish
console.log('📋 STEP 1: Environment Variables')
console.log('----------------------------------------')
console.log('MONGO_URL:', process.env.MONGO_URL ? '✅ Mavjud' : '❌ Topilmadi')
console.log('PORT:', process.env.PORT || '3003 (default)')
console.log('')

if (!process.env.MONGO_URL) {
    console.log('❌ XATO: MONGO_URL .env faylda topilmadi!')
    console.log('🔧 Yechim: .env faylda MONGO_URL ni tekshiring')
    process.exit(1)
}

// 2. MongoDB ulanish
console.log('📋 STEP 2: MongoDB Ulanish')
console.log('----------------------------------------')

const testConnection = async () => {
    try {
        console.log('⏳ MongoDB ga ulanmoqda...')
        console.log('   URL:', process.env.MONGO_URL.replace(/\/\/.*:.*@/, '//***:***@'))

        const startTime = Date.now()

        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
        })

        const connectionTime = Date.now() - startTime
        console.log(`✅ MongoDB ulandi! (${connectionTime}ms)`)
        console.log('   Host:', mongoose.connection.host)
        console.log('   Database:', mongoose.connection.name)
        console.log('')

        // 3. Product model va ma'lumotlarni tekshirish
        console.log('📋 STEP 3: Products Collection')
        console.log('----------------------------------------')

        // Dinamik import
        const Product = (await import('./models/product.model.js')).default

        const productCount = await Product.countDocuments()
        console.log('✅ Products soni:', productCount)

        if (productCount > 0) {
            const sampleProduct = await Product.findOne().lean()
            console.log('✅ Birinchi product:', sampleProduct?.name || 'Nomi yoq')
        }
        console.log('')

        // 4. Announcement tekshirish
        console.log('📋 STEP 4: Announcements Collection')
        console.log('----------------------------------------')

        const Announcement = (await import('./models/announcement.model.js')).default

        const announcementCount = await Announcement.countDocuments()
        console.log('✅ Announcements soni:', announcementCount)

        const activeAnnouncement = await Announcement.findOne({ isActive: true })
        console.log('✅ Active announcement:', activeAnnouncement ? 'Bor' : 'Yoq (null)')
        console.log('')

        // Xulosa
        console.log('========================================')
        console.log('✅ BARCHA TESTLAR O\'TDI!')
        console.log('========================================')
        console.log('')
        console.log('Agar bu script ishlasa, lekin sayt ishlamasa,')
        console.log('muammo server.js yoki route fayllarida bo\'lishi mumkin.')
        console.log('')

    } catch (error) {
        console.log('')
        console.log('========================================')
        console.log('❌ XATO TOPILDI!')
        console.log('========================================')
        console.log('')
        console.log('Xato turi:', error.name)
        console.log('Xato xabari:', error.message)
        console.log('')

        if (error.name === 'MongoServerSelectionError') {
            console.log('🔧 YECHIM:')
            console.log('   1. MongoDB Atlas Network Access tekshiring')
            console.log('   2. Internet ulanishini tekshiring')
            console.log('   3. MONGO_URL to\'g\'riligini tekshiring')
        } else if (error.name === 'MongoParseError') {
            console.log('🔧 YECHIM:')
            console.log('   MONGO_URL formati noto\'g\'ri')
            console.log('   To\'g\'ri format: mongodb+srv://user:pass@cluster.mongodb.net/dbname')
        } else {
            console.log('🔧 Batafsil xato:')
            console.log(error)
        }
        console.log('')
    } finally {
        await mongoose.disconnect()
        console.log('MongoDB uzildi.')
        process.exit(0)
    }
}

testConnection()
