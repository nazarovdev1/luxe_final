import axios from 'axios'
import PriceAlert from '../models/priceAlert.model.js'
import logger from '../utils/logger.js'

const getTelegramConfig = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  return token && chatId ? { token, chatId } : null
}

/**
 * Format telegram price drop alert message
 */
const formatPriceDropMessage = ({ product, alert, oldPrice, newPrice }) => {
  const discountPct = oldPrice > newPrice ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0
  const productUrl = `https://luxx.uz/product/${product._id}`

  return (
    `🔔 <b>NARX TUSHDI! / PRICE DROP ALERT</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `✨ <b>${product.name}</b>\n\n` +
    `📉 <b>Eski narx:</b> <s>${Number(oldPrice).toLocaleString()} so'm</s>\n` +
    `🔥 <b>Yangi narx:</b> <b>${Number(newPrice).toLocaleString()} so'm</b> (-${discountPct}%)\n` +
    `🎯 <b>Kutilgan narx:</b> ${Number(alert.targetPrice).toLocaleString()} so'm\n` +
    (alert.phone ? `📱 <b>Mijoz tel:</b> ${alert.phone}\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🛍 <b>Xarid qilish uchun:</b> <a href="${productUrl}">LUXX.UZ da ko'rish</a>`
  )
}

/**
 * Send Telegram message
 */
const sendTelegramNotification = async ({ product, alert, oldPrice, newPrice }) => {
  const config = getTelegramConfig()
  if (!config) {
    logger.warn('Telegram not configured for price alert')
    return { success: false, error: 'Telegram not configured' }
  }

  const targetChatId = alert.telegramChatId || config.chatId
  const message = formatPriceDropMessage({ product, alert, oldPrice, newPrice })
  const photoUrl = Array.isArray(product.images) && product.images.length > 0
    ? (typeof product.images[0] === 'object' ? product.images[0].url : product.images[0])
    : null

  try {
    if (photoUrl) {
      await axios.post(
        `https://api.telegram.org/bot${config.token}/sendPhoto`,
        {
          chat_id: targetChatId,
          photo: photoUrl,
          caption: message,
          parse_mode: 'HTML',
        },
        { timeout: 8000 }
      )
    } else {
      await axios.post(
        `https://api.telegram.org/bot${config.token}/sendMessage`,
        {
          chat_id: targetChatId,
          text: message,
          parse_mode: 'HTML',
        },
        { timeout: 8000 }
      )
    }
    return { success: true }
  } catch (error) {
    logger.error('Failed to send Telegram price drop notification:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Check and trigger all matching price alerts when a product's price drops
 */
export const checkAndTriggerPriceAlerts = async (product, oldPrice, newPrice) => {
  if (!product || !product._id || newPrice >= oldPrice) {
    return { triggeredCount: 0 }
  }

  try {
    const now = new Date()
    // Find all active alerts where targetPrice is >= newPrice and not expired
    const alerts = await PriceAlert.find({
      productId: product._id,
      status: 'active',
      targetPrice: { $gte: Number(newPrice) },
      expiresAt: { $gt: now },
    })

    if (!alerts.length) {
      return { triggeredCount: 0 }
    }

    logger.info(`Found ${alerts.length} matching price alerts for product ${product._id}`)

    let successCount = 0

    for (const alert of alerts) {
      try {
        if (alert.notifyMethod === 'telegram' || !alert.notifyMethod) {
          await sendTelegramNotification({ product, alert, oldPrice, newPrice })
        } else if (alert.notifyMethod === 'sms') {
          // SMS notification log / dispatcher
          logger.info(`[SMS Dispatch] To: ${alert.phone} - "${product.name} narxi ${newPrice.toLocaleString()} so'mga tushdi!"`)
          // Fallback also notify telegram channel for operational tracking
          await sendTelegramNotification({ product, alert, oldPrice, newPrice })
        } else if (alert.notifyMethod === 'push') {
          logger.info(`[Push Notification] To token: ${alert.fcmToken} - "${product.name} narxi tushdi!"`)
          await sendTelegramNotification({ product, alert, oldPrice, newPrice })
        }

        alert.status = 'triggered'
        alert.triggeredAt = new Date()
        await alert.save()
        successCount++
      } catch (err) {
        logger.error(`Error triggering price alert ${alert._id}:`, err.message)
      }
    }

    return { triggeredCount: successCount, totalMatched: alerts.length }
  } catch (error) {
    logger.error('Error in checkAndTriggerPriceAlerts:', error)
    return { triggeredCount: 0, error: error.message }
  }
}
