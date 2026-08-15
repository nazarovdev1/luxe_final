import mongoose from 'mongoose'
import PriceAlert from '../models/priceAlert.model.js'
import Product from '../models/product.model.js'
import logger from '../utils/logger.js'

/**
 * Subscribe to price drop alert
 * POST /api/price-alerts
 */
export const createPriceAlert = async (req, res) => {
  try {
    const { productId, currentPrice, targetPrice, phone, notifyMethod = 'telegram', fcmToken, telegramChatId } = req.body

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Yaroqsiz mahsulot ID' })
    }

    if (!targetPrice || Number(targetPrice) <= 0) {
      return res.status(400).json({ success: false, message: 'Kutilayotgan narx ko\'rsatilishi shart' })
    }

    const product = await Product.findById(productId).select('name price').lean()
    if (!product) {
      return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' })
    }

    const userId = req.user?._id || null
    const query = {
      productId,
      status: 'active',
      $or: [],
    }

    if (userId) query.$or.push({ userId })
    if (phone) query.$or.push({ phone: phone.trim() })

    let alert = null

    if (query.$or.length > 0) {
      alert = await PriceAlert.findOne(query)
    }

    if (alert) {
      alert.targetPrice = Number(targetPrice)
      alert.currentPrice = Number(currentPrice || product.price)
      alert.notifyMethod = notifyMethod
      if (phone) alert.phone = phone.trim()
      if (fcmToken) alert.fcmToken = fcmToken
      if (telegramChatId) alert.telegramChatId = telegramChatId
      alert.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      await alert.save()
    } else {
      alert = await PriceAlert.create({
        productId,
        userId,
        phone: phone ? phone.trim() : null,
        currentPrice: Number(currentPrice || product.price),
        targetPrice: Number(targetPrice),
        notifyMethod,
        fcmToken: fcmToken || null,
        telegramChatId: telegramChatId || null,
        status: 'active',
      })
    }

    logger.info(`Price alert subscribed for product ${productId} by ${phone || userId}`)

    res.status(201).json({
      success: true,
      message: 'Narx kuzatuvi faollashtirildi',
      data: alert,
    })
  } catch (error) {
    logger.error('Error creating price alert:', error)
    res.status(500).json({ success: false, message: 'Server xatosi: ' + error.message })
  }
}

/**
 * Cancel/unsubscribe from price alert
 * POST /api/price-alerts/unsubscribe
 */
export const unsubscribePriceAlert = async (req, res) => {
  try {
    const { productId, phone, alertId } = req.body
    const userId = req.user?._id || null

    const query = { status: 'active' }

    if (alertId && mongoose.Types.ObjectId.isValid(alertId)) {
      query._id = alertId
    } else if (productId) {
      query.productId = productId
      query.$or = []
      if (userId) query.$or.push({ userId })
      if (phone) query.$or.push({ phone: phone.trim() })
      if (!query.$or.length) {
        return res.status(400).json({ success: false, message: 'Telefon raqam yoki foydalanuvchi ma\'lumoti kerak' })
      }
    } else {
      return res.status(400).json({ success: false, message: 'Parametrlar yetarli emas' })
    }

    const updated = await PriceAlert.updateMany(query, {
      $set: { status: 'cancelled' },
    })

    res.status(200).json({
      success: true,
      message: 'Narx kuzatuvi bekor qilindi',
      modifiedCount: updated.modifiedCount,
    })
  } catch (error) {
    logger.error('Error unsubscribing price alert:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}

/**
 * Check if user is subscribed to price alert for a product
 * GET /api/price-alerts/check
 */
export const checkPriceAlert = async (req, res) => {
  try {
    const { productId, phone } = req.query
    const userId = req.user?._id || null

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Yaroqsiz mahsulot ID' })
    }

    const query = {
      productId,
      status: 'active',
      expiresAt: { $gt: new Date() },
      $or: [],
    }

    if (userId) query.$or.push({ userId })
    if (phone) query.$or.push({ phone: phone.trim() })

    if (!query.$or.length) {
      return res.status(200).json({ success: true, isSubscribed: false })
    }

    const alert = await PriceAlert.findOne(query).lean()

    res.status(200).json({
      success: true,
      isSubscribed: Boolean(alert),
      data: alert || null,
    })
  } catch (error) {
    logger.error('Error checking price alert:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}
