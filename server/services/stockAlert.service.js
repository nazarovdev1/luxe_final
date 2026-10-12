import StockAlert from '../models/stockAlert.model.js'
import smsService from './sms.service.js'
import { sendStaffMessage } from './telegram.service.js'
import logger from '../utils/logger.js'

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

const variantKey = (variant) => `${variant.size || ''}||${variant.color || ''}`
const isSellable = (variant) => variant.isActive !== false && Number(variant.stock) > 0

// Returns the variants that were sold out (or inactive) before and are sellable now.
// `{ any: true }` means a product without variants went from 0 to in-stock.
export const findRestocked = (before, after) => {
  const afterVariants = Array.isArray(after?.variants) ? after.variants : []
  const beforeVariants = Array.isArray(before?.variants) ? before.variants : []

  if (afterVariants.length > 0) {
    const previouslySellable = new Set(beforeVariants.filter(isSellable).map(variantKey))
    const restocked = afterVariants
      .filter((variant) => isSellable(variant) && !previouslySellable.has(variantKey(variant)))
      .map((variant) => ({ size: variant.size || '', color: variant.color || '' }))
    return { any: false, variants: restocked }
  }

  const wasEmpty = !(Number(before?.stock) > 0)
  const nowAvailable = Number(after?.stock) > 0
  return { any: wasEmpty && nowAvailable, variants: [] }
}

export const alertMatches = (alert, restocked) => {
  if (restocked.any) return true
  return restocked.variants.some((variant) => (
    (!alert.size || alert.size === variant.size) && (!alert.color || alert.color === variant.color)
  ))
}

export const notifyBackInStock = async (before, after) => {
  const restocked = findRestocked(before, after)
  if (!restocked.any && restocked.variants.length === 0) return { notified: 0 }

  const alerts = await StockAlert.find({ product: after._id, status: 'active' }).lean()
  const matching = alerts.filter((alert) => alertMatches(alert, restocked))
  if (matching.length === 0) return { notified: 0 }

  const productUrl = `https://luxx.uz/product/${after._id}`
  const customerText = `Luxx.uz: "${after.name}" yana sotuvda! ${productUrl}`
  const smsEnabled = Boolean(smsService.smsApiKey || smsService.clickSmsLogin)

  let smsSent = 0
  const notifiedIds = []
  for (const alert of matching) {
    const via = []
    if (smsEnabled) {
      const result = await smsService.sendSMS(alert.phone, customerText)
      if (result.success) { smsSent += 1; via.push('sms') }
    }
    await StockAlert.updateOne(
      { _id: alert._id, status: 'active' },
      { $set: { status: 'notified', notifiedAt: new Date(), notifiedVia: [...via, 'staff'] } }
    )
    notifiedIds.push(alert._id)
  }

  // Staff always get the list, so a customer is never left waiting if SMS is unavailable.
  const lines = matching.map((alert) => `• ${escapeHtml(alert.phone)}${alert.size ? ` (${escapeHtml(alert.size)})` : ''}`)
  const staff = await sendStaffMessage(
    `🔔 <b>Qayta sotuvga chiqdi:</b> ${escapeHtml(after.name)}\n` +
    `${matching.length} ta mijoz kutayotgan edi (SMS yuborildi: ${smsSent}).\n\n${lines.join('\n')}\n\n${productUrl}`
  )
  if (!staff.success) logger.warn(`Back-in-stock staff message failed: ${staff.error}`)

  return { notified: matching.length, smsSent }
}
