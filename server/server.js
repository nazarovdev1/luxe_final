import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import dns from 'dns'

// Fix for Node.js 17+ DNS resolution issues on some Windows environments
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first')
}

// Force Node.js to use specific DNS servers for SRV lookups if system DNS is failing
try {
  dns.setServers(['1.1.1.1', '8.8.8.8'])
} catch (err) {
  logger.warn('Could not set DNS servers:', err.message)
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from the server directory explicitly
dotenv.config({ path: path.join(__dirname, '.env') })

import { connectDB } from './config/db.js'
import prerender from 'prerender-node'
import logger from './utils/logger.js'

import productRoutes from './routes/product.route.js'
import orderRoutes from './routes/order.route.js'
import authRoutes from './routes/auth.route.js'
import reviewRoutes from './routes/review.route.js'
import contactRoutes from './routes/contact.route.js'
import announcementRoutes from './routes/announcement.route.js'
import promoRoutes from './routes/promo.route.js'
import lookRoutes from './routes/look.route.js'
import sitemapRoutes from './routes/sitemap.route.js'
import visualSearchRoutes from './routes/visualSearch.route.js'
import aiStylistRoutes from './routes/aiStylist.route.js'
import pointsRoutes from './routes/points.routes.js'
import badgeRoutes from './routes/badge.routes.js'
import challengeRoutes from './routes/challenge.routes.js'
import postRoutes from './routes/post.routes.js'
import commentRoutes from './routes/comment.routes.js'
import livestreamRoutes from './routes/livestream.routes.js'
import lookbookRoutes from './routes/lookbook.routes.js'
import sustainabilityRoutes from './routes/sustainability.routes.js'
import couponRoutes from './routes/coupon.routes.js'
import adminManagementRoutes from './routes/admin.routes.js'
import reelRoutes from './routes/reel.route.js'
import liveChatRoutes from './routes/liveChat.routes.js'
import giftCardRoutes from './routes/giftCard.routes.js'
import blogRoutes from './routes/blog.routes.js'

import { initSocket } from './services/socket.service.js'

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3003

// Initialize Socket.io
initSocket(server)

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}))

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://luxx.uz', 'https://www.luxx.uz']
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3003', 'http://127.0.0.1:3003'],
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Juda ko\'p so\'rovlar, keyinroq urinib ko\'ring' }
})
app.use('/api', globalLimiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Login urinishlari cheklangan' }
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Contact xabarlar cheklangan' }
})
app.use('/api/contact', contactLimiter)

const prerenderToken = process.env.PRERENDER_TOKEN
const isProduction = process.env.NODE_ENV === 'production'

if (prerenderToken && isProduction) {
  app.use(prerender
    .set('prerenderToken', prerenderToken)
    .set('protocol', 'https')
    .set('host', 'luxx.uz')
    .set('logRequests', false))
  logger.info('Prerender.io enabled for SEO')
} else {
  logger.info('Prerender.io disabled')
}

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: req.requestTime })
})

app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/promos', promoRoutes)
app.use('/api/looks', lookRoutes)
app.use('/api/visual-search', visualSearchRoutes)
app.use('/api/ai-stylist', aiStylistRoutes)
app.use('/api/points', pointsRoutes)
app.use('/api/badges', badgeRoutes)
app.use('/api/challenges', challengeRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/livestreams', livestreamRoutes)
app.use('/api/lookbooks', lookbookRoutes)
app.use('/api/sustainability', sustainabilityRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/admin-mgmt', adminManagementRoutes)
app.use('/api/reels', reelRoutes)
app.use('/api/live-chat', liveChatRoutes)
app.use('/api/gift-cards', giftCardRoutes)
app.use('/api/blogs', blogRoutes)
import ReelComment from './models/reelComment.model.js'
import { protect, admin } from './middleware/auth.middleware.js'
app.delete('/api/delete-reel-comment/:id', protect, async (req, res) => {
  try {
    const comment = await ReelComment.findById(req.params.id)
    if (!comment) return res.status(404).json({ success: false, message: 'Not found' })
    
    if (comment.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }

    await ReelComment.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})
app.use('/', sitemapRoutes)

import crypto from 'crypto'
app.get('/api/imagekit-auth', (req, res) => {
  try {
    const token = req.query.token || crypto.randomUUID()
    const expire = req.query.expire || Math.floor(Date.now() / 1000) + 2400
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY

    if (!privateKey) {
      throw new Error('Private Key missing')
    }

    const signature = crypto.createHmac('sha1', privateKey)
      .update(token + expire)
      .digest('hex')

    res.json({ token, expire, signature })
  } catch (error) {
    logger.error('ImageKit Auth Error:', error)
    res.status(500).json({ error: error.message })
  }
})

const publicPath = path.join(__dirname, 'public')
const indexHtmlPath = path.join(publicPath, 'index.html')

app.use(express.static(publicPath))

app.get(/.*/, (req, res) => {
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath)
  } else {
    res.status(404).send('React Build Not Found')
  }
})

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err)

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload' })
  }

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Server xatosi yuz berdi'
      : err.message
  })
})

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Please kill the process using this port or use a different port.`)
    process.exit(1)
  }
})

const startServer = async () => {
  try {
    const dbConnected = await connectDB()

    if (!dbConnected) {
      logger.warn('MongoDB connection failed. Some features may not work.')
    }

    server.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
      logger.info(`MongoDB status: ${dbConnected ? 'Connected' : 'Not connected'}`)
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} band (allaqachon ishlatilmoqda). Iltimos, portni bo'shating yoki boshqa port ishlating.`)
        process.exit(1)
      } else {
        logger.error('Server error:', err)
      }
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()