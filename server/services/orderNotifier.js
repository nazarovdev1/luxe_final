import Order from '../models/order.model.js'
import { sendOrderToTelegram } from './telegram.service.js'
import logger from '../utils/logger.js'

export const MAX_NOTIFY_ATTEMPTS = 8
const MIN_AGE_MS = 90 * 1000
const MAX_AGE_MS = 24 * 60 * 60 * 1000
const RETRY_INTERVAL_MS = 2 * 60 * 1000

export const toTelegramPayload = (order) => ({
  customer: order.customer,
  items: order.items,
  totals: order.totals,
  orderId: order._id,
  lookDiscounts: order.lookDiscounts || [],
  totalLookDiscount: order.totalLookDiscount || 0
})

// Re-sends orders whose staff notification failed, so a Telegram outage never hides an order.
export const retryUnnotifiedOrders = async () => {
  const now = Date.now()
  const orders = await Order.find({
    notifiedAt: null,
    notifyAttempts: { $lt: MAX_NOTIFY_ATTEMPTS },
    createdAt: { $lte: new Date(now - MIN_AGE_MS), $gte: new Date(now - MAX_AGE_MS) }
  }).sort({ createdAt: 1 }).limit(20).lean()

  let sent = 0
  for (const order of orders) {
    const result = await sendOrderToTelegram(toTelegramPayload(order))
    await Order.updateOne(
      { _id: order._id },
      result.success
        ? { $set: { notifiedAt: new Date(), notifyError: null }, $inc: { notifyAttempts: 1 } }
        : { $set: { notifyError: String(result.error || 'unknown').slice(0, 300) }, $inc: { notifyAttempts: 1 } }
    )
    if (result.success) sent += 1
  }
  if (orders.length) logger.info(`Order notification retry: ${sent}/${orders.length} delivered`)
  return { attempted: orders.length, sent }
}

export const startOrderNotifier = () => {
  const timer = setInterval(() => {
    retryUnnotifiedOrders().catch((error) => logger.error('Order notification retry failed:', error))
  }, RETRY_INTERVAL_MS)
  timer.unref?.()
  return timer
}

// Cloud Run (and similar) throttle timers between requests, so retries are also triggered
// opportunistically by health checks and admin polling, at most once per interval.
let lastTrigger = 0
export const triggerRetryIfDue = (now = Date.now()) => {
  if (now - lastTrigger < 60 * 1000) return false
  lastTrigger = now
  retryUnnotifiedOrders().catch((error) => logger.error('Order notification retry failed:', error))
  return true
}
