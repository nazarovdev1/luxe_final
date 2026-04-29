import mongoose from 'mongoose'

let isConnected = false

// Set buffer timeout BEFORE any connection attempt
mongoose.set('bufferTimeoutMS', 30000)

export const connectDB = async () => {
	if (isConnected) {
		console.log('MongoDB already connected')
		return true
	}

	try {
		const mongoUrl = process.env.MONGO_URL
		
		if (!mongoUrl) {
			console.error('MONGO_URL environment variable is not set!')
			return false
		}

		console.log('Attempting to connect to MongoDB...')
		
		const conn = await mongoose.connect(mongoUrl, {
			serverSelectionTimeoutMS: 30000,
			socketTimeoutMS: 45000,
			maxPoolSize: 10,
			bufferCommands: true,
			connectTimeoutMS: 30000,
		})

		isConnected = true
		console.log(`MongoDB Connected: ${conn.connection.host}`)

		// Connection event listeners
		mongoose.connection.on('disconnected', () => {
			console.log('MongoDB disconnected! Attempting to reconnect...')
			isConnected = false
		})

		mongoose.connection.on('reconnected', () => {
			console.log('MongoDB reconnected!')
			isConnected = true
		})

		mongoose.connection.on('error', (err) => {
			console.log('MongoDB connection error:', err.message)
			isConnected = false
		})

		return true
	} catch (error) {
		console.error('--- MongoDB Connection Error ---')
		console.error('Message:', error.message)
		
		if (error.message.includes('querySrv ECONNREFUSED')) {
			console.error('HINT: This looks like a DNS/SRV record lookup issue.')
			console.error('Try checking if your network blocks MongoDB Atlas SRV records.')
			console.error('Alternative: Use the older connection string format (mongodb://) instead of (mongodb+srv://).')
		}
		
		console.error('---------------------------------')
		isConnected = false
		return false
	}
}

// Reconnect helper
export const reconnectDB = async (retries = 3) => {
	for (let i = 0; i < retries; i++) {
		console.log(`Reconnection attempt ${i + 1}/${retries}...`)
		const connected = await connectDB()
		if (connected) return true
		await new Promise(resolve => setTimeout(resolve, 5000))
	}
	return false
}

export const isDBConnected = () => isConnected