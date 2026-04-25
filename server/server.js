console.log("1. Starting imports...");
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import prerender from 'prerender-node'

// Route Imports
import productRoutes from './routes/product.route.js'
import orderRoutes from './routes/order.route.js'
import authRoutes from './routes/auth.route.js'
import reviewRoutes from './routes/review.route.js'
import contactRoutes from './routes/contact.route.js'
import announcementRoutes from './routes/announcement.route.js'
import promoRoutes from './routes/promo.route.js'

console.log("2. Finished imports, config dotenv...");
dotenv.config()
console.log("3. Done config dotenv");

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3003

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Prerender.io for SEO - serves fully rendered HTML to search engine bots
// In production, Prerender.io cloud service renders your React pages to HTML
// so search engine bots receive fully-rendered content instead of empty JS shells
const prerenderToken = process.env.PRERENDER_TOKEN;
const isProduction = process.env.NODE_ENV === 'production';

if (prerenderToken) {
	// For local development, we skip prerender middleware
	// because Prerender.io cloud can't reach localhost
	if (!isProduction) {
		console.log('⚠️ Prerender.io disabled in dev mode (cloud can\'t reach localhost)');
		console.log('   In production, bots will receive prerendered HTML');
	} else {
		app.use(prerender
			.set('prerenderToken', prerenderToken)
			.set('protocol', 'https')
			.set('host', 'luxx.uz')
			.set('logRequests', true));
		console.log('✅ Prerender.io enabled for SEO (production mode)');
	}
} else {
	console.log('⚠️ Prerender.io disabled - set PRERENDER_TOKEN env variable');
}

// Test route
app.get('/api/test', (req, res) => {
	res.json({ success: true, message: 'Server is running (Express 5)' })
})

// DEBUG route - brauzerda https://luxx.uz/api/debug ochib tekshiring
app.get('/api/debug', async (req, res) => {
	const logs = []
	const addLog = (msg) => { logs.push(msg); console.log(msg) }

	try {
		addLog('🔍 DEBUG STARTED')
		addLog('----------------------------------------')

		// 1. Environment
		addLog('📋 STEP 1: Environment')
		addLog('MONGO_URL: ' + (process.env.MONGO_URL ? '✅ Mavjud' : '❌ Topilmadi'))
		addLog('NODE_ENV: ' + (process.env.NODE_ENV || 'not set'))

		// Parse MONGO_URL to check format
		if (process.env.MONGO_URL) {
			const url = process.env.MONGO_URL
			addLog('')
			addLog('📋 MONGO_URL Analysis:')
			addLog('Protocol: ' + (url.startsWith('mongodb+srv://') ? '✅ mongodb+srv' : url.startsWith('mongodb://') ? '⚠️ mongodb (old)' : '❌ Unknown'))
			addLog('Has password: ' + (url.includes(':') && url.includes('@') ? '✅ Yes' : '❌ No'))
			addLog('Cluster: ' + (url.match(/@(.+?)\//)?.[1] || 'Could not parse'))
			addLog('Database: ' + (url.match(/\.net\/(\w+)/)?.[1] || 'Could not parse'))
		}

		addLog('')
		addLog('📋 STEP 2: MongoDB Status')
		const mongoose = (await import('mongoose')).default
		addLog('Connection State: ' + mongoose.connection.readyState)
		addLog('States: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting')

		// Wait for connection if connecting
		if (mongoose.connection.readyState === 2) {
			addLog('⏳ Waiting for connection to complete...')
			await new Promise(resolve => setTimeout(resolve, 5000))
			addLog('Connection State after wait: ' + mongoose.connection.readyState)
		}

		if (mongoose.connection.readyState === 1) {
			addLog('✅ MongoDB: Connected to ' + mongoose.connection.host)
		} else if (mongoose.connection.readyState === 0) {
			addLog('❌ MongoDB: Not connected!')
			addLog('Attempting to connect with 30s timeout...')

			try {
				await mongoose.connect(process.env.MONGO_URL, {
					serverSelectionTimeoutMS: 30000,
				})
				addLog('✅ Connection successful!')
				addLog('Connection State now: ' + mongoose.connection.readyState)
			} catch (connErr) {
				addLog('❌ Connection failed: ' + connErr.message)
			}
		}

		// Ensure we're connected before testing
		if (mongoose.connection.readyState !== 1) {
			addLog('⚠️ Still not connected, tests may fail')
		}

		// 3. Test Products
		addLog('')
		addLog('📋 STEP 3: Products Test')
		try {
			const Product = (await import('./models/product.model.js')).default
			const count = await Product.countDocuments().maxTimeMS(30000)
			addLog('✅ Products count: ' + count)
		} catch (prodErr) {
			addLog('❌ Products error: ' + prodErr.message)
		}

		// 4. Test Announcements
		addLog('')
		addLog('📋 STEP 4: Announcements Test')
		try {
			const Announcement = (await import('./models/announcement.model.js')).default
			const count = await Announcement.countDocuments().maxTimeMS(30000)
			addLog('✅ Announcements count: ' + count)
		} catch (annErr) {
			addLog('❌ Announcements error: ' + annErr.message)
		}

		addLog('')
		addLog('========================================')
		addLog('DEBUG COMPLETED')

		res.json({ success: true, logs })
	} catch (error) {
		addLog('❌ FATAL ERROR: ' + error.message)
		res.json({ success: false, error: error.message, logs })
	}
})

// Client Setup Helper
// Checks if React build exists
const publicPath = path.join(__dirname, 'public')
const indexHtmlPath = path.join(publicPath, 'index.html')

// API Routes
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/announcements', announcementRoutes)
console.log("4. Registering /api/promos");
app.use('/api/promos', promoRoutes)
console.log("5. Registering looks...");
import lookRoutes from './routes/look.route.js'
console.log('✅ Registering /api/looks route');
app.use('/api/looks', lookRoutes)

// SITEMAP Route
import sitemapRoutes from './routes/sitemap.route.js'
app.use('/', sitemapRoutes)

// IMAGEKIT AUTH (No external dependencies)
import crypto from 'crypto'
app.get('/api/imagekit-auth', (req, res) => {
	try {
		const token = req.query.token || crypto.randomUUID();
		const expire = req.query.expire || Math.floor(Date.now() / 1000) + 2400;
		const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

		if (!privateKey) throw new Error('Private Key missing');

		const signature = crypto.createHmac('sha1', privateKey)
			.update(token + expire)
			.digest('hex');

		res.json({
			token,
			expire,
			signature
		});
	} catch (error) {
		console.error('ImageKit Auth Error:', error.message);
		res.status(500).json({ error: error.message });
	}
});

// TEMP Routes (Can be removed later)
app.get('/api/setup-admin', async (req, res) => {
	try {
		const User = (await import('./models/user.model.js')).default
		const adminUsername = 'admin536'
		const adminPassword = 'admin126'
		// ... Logic preserved from previous steps

		const userExists = await User.findOne({ username: adminUsername })
		if (userExists) {
			userExists.password = adminPassword
			userExists.isAdmin = true
			await userExists.save()
			return res.json({ success: true, message: 'Admin updated' })
		}

		await User.create({
			username: adminUsername,
			phone: '+998990000536',
			password: adminPassword,
			isAdmin: true
		})
		res.json({ success: true, message: 'Admin created' })
	} catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/test-telegram', async (req, res) => {
	try {
		const { default: axios } = await import('axios')
		const token = process.env.TELEGRAM_BOT_TOKEN
		const chatId = process.env.TELEGRAM_CHAT_ID
		const actualToken = token || '8504200030:AAG...'
		const actualChatId = chatId || '1816138407'

		await axios.post(`https://api.telegram.org/bot${actualToken}/sendMessage`, {
			chat_id: actualChatId,
			text: '🔔 Test message',
		})
		res.json({ success: true, message: 'Sent!' })
	} catch (error) { res.status(500).json({ error: error.message }) }
})

// Serve Static Files
app.use(express.static(publicPath))

// SPA Fallback - FIXED for Express 5
// Using regex instead of '*' string to avoid "Missing parameter name" error
app.get(/.*/, (req, res) => {
	if (fs.existsSync(indexHtmlPath)) {
		res.sendFile(indexHtmlPath)
	} else {
		res.status(404).send('React Build Not Found in /public')
	}
})

// Start server only after MongoDB is connected
const startServer = async () => {
	console.log('6. Inside startServer()')

	// Connect to MongoDB FIRST
	const dbConnected = await connectDB()

	if (!dbConnected) {
		console.log('Warning: MongoDB connection failed. Some features may not work.')
	}

	app.listen(PORT, () => {
		console.log('Server is running on port ' + PORT)
		console.log('MongoDB status:', dbConnected ? 'Connected' : 'Not connected')
	})
}

console.log('7. Calling startServer()...')
startServer().catch(err => {
	console.error('Failed to start server:', err)
})
