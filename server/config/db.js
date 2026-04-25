import mongoose from 'mongoose'

let isConnected = false

export const connectDB = async () => {
	if (isConnected) {
		console.log('MongoDB already connected')
		return true
	}

	try {
		const conn = await mongoose.connect(process.env.MONGO_URL, {
			serverSelectionTimeoutMS: 30000, // 30 seconds timeout (increased for slow connections)
			socketTimeoutMS: 45000,
			maxPoolSize: 10, // Connection pool
			bufferCommands: true, // Buffer commands when disconnected
			connectTimeoutMS: 30000, // Connection timeout
		})

		// Set global buffer timeout
		mongoose.set('bufferTimeoutMS', 30000)

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
		console.log('MongoDB Connection Error:', error.message)
		isConnected = false
		return false
	}
}

export const isDBConnected = () => isConnected
