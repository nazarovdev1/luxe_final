import Order from '../models/order.model.js'
import Product from '../models/product.model.js'
import User from '../models/user.model.js'
import GiftCard from '../models/giftCard.model.js'
import Look from '../models/look.model.js'
import Promo from '../models/promo.model.js'
import Coupon from '../models/coupon.model.js'
import mongoose from 'mongoose'
import { sendOrderToTelegram } from '../services/telegram.service.js'
import pointsService from '../services/points.service.js'
import logger from '../utils/logger.js'
import { getPagination } from '../utils/pagination.js'

const clampMoney = (value) => Math.max(0, Math.round((Number(value) || 0) * 100) / 100)
const GIFT_WRAP_PRICES = Object.freeze({ classic: 25000, premium: 45000, minimal: 15000 })
const DELIVERY_SLOTS = new Set(['morning', 'afternoon', 'evening', 'late_evening', 'express'])
const EXPRESS_DELIVERY_FEE = 25000

const normalizeIdempotencyKey = (req) => {
  const value = req.get('Idempotency-Key') || req.body.idempotencyKey
  return value ? String(value).trim() : null
}

const verifyDelivery = (scheduledDelivery, customer) => {
  const lat = Number(customer?.location?.lat)
  const lng = Number(customer?.location?.lng)
  const hasTashkentCoordinates = Number.isFinite(lat) && Number.isFinite(lng) && lat >= 40.9 && lat <= 41.6 && lng >= 68.8 && lng <= 69.8
  const addressMentionsTashkent = /toshkent|tashkent/i.test(String(customer?.address || ''))
  
  if (!hasTashkentCoordinates && !addressMentionsTashkent) {
    const error = new Error('Yetkazib berish hozircha faqat Toshkent shahrida mavjud')
    error.status = 400
    throw error
  }

  if (!scheduledDelivery) return { value: null, fee: 0 }

  const getTashkentDate = (d = new Date()) => {
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const tzOffset = 5; // UTC+5
    return new Date(utc + (3600000 * tzOffset));
  };

  const dateParts = String(scheduledDelivery.date).split('T')[0].split('-');
  if (dateParts.length !== 3) {
    const error = new Error('Rejalashtirilgan yetkazib berish sanasi noto\'g\'ri')
    error.status = 400
    throw error
  }
  const date = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]), 0, 0, 0, 0)
  
  const nowTashkent = getTashkentDate()
  const today = new Date(nowTashkent.getFullYear(), nowTashkent.getMonth(), nowTashkent.getDate(), 0, 0, 0, 0)
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 5)

  if (Number.isNaN(date.getTime()) || date < today || date > maxDate || !DELIVERY_SLOTS.has(scheduledDelivery.timeSlot)) {
    const error = new Error('Yetkazib berish sanasi yoki vaqti noto\'g\'ri')
    error.status = 400
    throw error
  }

  const isExpress = scheduledDelivery.timeSlot === 'express'
  if (isExpress && date.toDateString() !== today.toDateString()) {
    const error = new Error('Tezkor yetkazib berish faqat bugun uchun mavjud')
    error.status = 400
    throw error
  }

  return { value: { date, timeSlot: scheduledDelivery.timeSlot, isExpress }, fee: isExpress ? EXPRESS_DELIVERY_FEE : 0 }
}

const verifyGiftWrap = (giftWrap) => {
  if (!giftWrap) return null
  const type = String(giftWrap.type || '')
  if (!GIFT_WRAP_PRICES[type]) {
    const error = new Error('Sovg\'a qadoqlash turi noto\'g\'ri')
    error.status = 400
    throw error
  }
  return { type, cost: GIFT_WRAP_PRICES[type], message: String(giftWrap.message || '').slice(0, 500) }
}

const calculateCodeDiscount = async ({ code, subtotal, userId }) => {
  const normalizedCode = String(code || '').trim().toUpperCase()
  if (!normalizedCode || subtotal <= 0) {
    return { discountAmount: 0, promoCode: null, giftCard: null }
  }

  const giftCard = await GiftCard.findOne({
    code: normalizedCode,
    isUsed: false,
    status: { $in: ['Active', 'Sent'] }
  }).lean()

  if (giftCard) {
    return {
      discountAmount: Math.min(subtotal, clampMoney(giftCard.amount)),
      promoCode: normalizedCode,
      giftCard
    }
  }

  const coupon = await Coupon.findOne({
    code: normalizedCode,
    isActive: true,
    isUsed: false,
    $or: [{ user: null }, ...(userId ? [{ user: userId }] : [])],
    $and: [
      {
        $or: [
          { expiryDate: null },
          { expiryDate: { $exists: false } },
          { expiryDate: { $gt: new Date() } }
        ]
      }
    ]
  }).lean()

  if (coupon && subtotal >= (coupon.minPurchase || 0)) {
    const discountAmount = coupon.discountType === 'fixed'
      ? coupon.discountValue
      : subtotal * (coupon.discountValue / 100)

    return {
      discountAmount: Math.min(subtotal, clampMoney(discountAmount)),
      promoCode: normalizedCode,
      giftCard: null
    }
  }

  const promo = await Promo.findOne({ code: normalizedCode, isActive: true }).lean()
  if (promo) {
    return {
      discountAmount: Math.min(subtotal, clampMoney(subtotal * (promo.discountPercentage / 100))),
      promoCode: normalizedCode,
      giftCard: null
    }
  }

  return { discountAmount: 0, promoCode: null, giftCard: null }
}

const buildVerifiedItems = async (items = []) => {
  const ids = [...new Set(items.map((item) => item.product).filter(Boolean).map(String))]
  if (items.some((item) => !item.product) || ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    const error = new Error('Buyurtmada noto\'g\'ri mahsulot ID mavjud')
    error.status = 400
    throw error
  }

  const products = await Product.find({ _id: { $in: ids } })
    .select('name price images stock sizes colors variants')
    .lean()
  const productMap = new Map(products.map((product) => [String(product._id), product]))

  return items.map((item) => {
    const productId = String(item.product || '')
    const product = productMap.get(productId)
    const quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1)

    if (!product) {
      const error = new Error(`Mahsulot topilmadi: ${productId}`)
      error.status = 400
      throw error
    }

    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0
    const matchingVariant = hasVariants
      ? product.variants.find((variant) =>
          variant.isActive !== false &&
          (!variant.size || variant.size === String(item.selectedSize || '')) &&
          (!variant.color || variant.color === String(item.selectedColor || '')))
      : null

    if (hasVariants && !matchingVariant) {
      const error = new Error(`${product.name} uchun tanlangan rang/o'lcham mavjud emas`)
      error.status = 400
      throw error
    }
    if (!hasVariants && item.selectedSize && product.sizes?.length && !product.sizes.includes(item.selectedSize)) {
      const error = new Error(`${product.name} uchun tanlangan o'lcham mavjud emas`)
      error.status = 400
      throw error
    }
    if (!hasVariants && item.selectedColor && product.colors?.length && !product.colors.includes(item.selectedColor)) {
      const error = new Error(`${product.name} uchun tanlangan rang mavjud emas`)
      error.status = 400
      throw error
    }
    const availableStock = matchingVariant ? matchingVariant.stock : product.stock
    if (typeof availableStock === 'number' && availableStock < quantity) {
      const error = new Error(`${product.name} uchun yetarli zaxira yo'q`)
      error.status = 400
      error.details = {
        name: product.name,
        size: item.selectedSize || '',
        color: item.selectedColor || '',
        availableStock
      }
      throw error
    }

    const firstImage = product.images?.[0]
    const image = typeof firstImage === 'string' ? firstImage : firstImage?.url

    return {
      product: product._id,
      name: product.name,
      image: item.image || image || '',
      quantity,
      price: clampMoney(product.price),
      selectedColor: item.selectedColor || '',
      selectedSize: item.selectedSize || '',
      lookId: item.lookId || null,
      lookTitle: item.lookTitle || null,
      lookDiscount: 0,
      variantId: matchingVariant?._id || null
    }
  })
}

const reserveInventory = async (items) => {
  const reservations = []
  for (const item of items) {
    const query = item.variantId
      ? { _id: item.product, variants: { $elemMatch: { _id: item.variantId, isActive: { $ne: false }, stock: { $gte: item.quantity } } } }
      : { _id: item.product, stock: { $gte: item.quantity }, 'variants.0': { $exists: false } }
    const update = item.variantId
      ? { $inc: { 'variants.$[variant].stock': -item.quantity, stock: -item.quantity } }
      : { $inc: { stock: -item.quantity } }
    const options = item.variantId ? { arrayFilters: [{ 'variant._id': item.variantId, 'variant.isActive': { $ne: false } }] } : {}
    const reserved = await Product.findOneAndUpdate(query, update, options)
    if (!reserved) {
      await releaseInventory(reservations)
      const error = new Error(`${item.name} zaxirasi o'zgardi. Savatni yangilang.`)
      error.status = 409
      error.details = {
        name: item.name,
        size: item.selectedSize || '',
        color: item.selectedColor || '',
        availableStock: 0
      }
      throw error
    }
    reservations.push({ product: item.product, variantId: item.variantId, quantity: item.quantity })
  }
  return reservations
}

const releaseInventory = async (reservations) => {
  await Promise.all(reservations.map((item) => item.variantId
    ? Product.updateOne(
        { _id: item.product, 'variants._id': item.variantId },
        { $inc: { 'variants.$[variant].stock': item.quantity, stock: item.quantity } },
        { arrayFilters: [{ 'variant._id': item.variantId }] })
    : Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })))
}

export const createOrder = async (req, res) => {
  let claimedGiftCard = null
  let orderSaved = false
  let reservations = []
  try {
    const { customer, items, totals = {}, paymentMethod, lookItems, lookDiscounts } = req.body
    const userId = req.user?._id || null
    const idempotencyKey = normalizeIdempotencyKey(req)

    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey }).select('_id').lean()
      if (existingOrder) {
        return res.status(200).json({ success: true, duplicate: true, orderId: existingOrder._id })
      }
    }

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Zakas ma\'lumotlari to\'liq emas'
      })
    }

    if (!customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message: 'Xaridor ma\'lumotlari to\'liq emas'
      })
    }

    const verifiedItems = await buildVerifiedItems(items)
    const subtotal = clampMoney(verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0))
    const delivery = verifyDelivery(req.body.scheduledDelivery, customer)
    const giftWrap = verifyGiftWrap(totals.giftWrap)
    const deliveryFee = delivery.fee

    // Process look discounts
    let processedLookDiscounts = []
    let totalLookDiscount = 0
    const orderedProductIds = new Set(verifiedItems.map((item) => String(item.product)))

    if (lookItems && lookItems.length > 0) {
      for (const lookItem of lookItems) {
        try {
          const look = await Look.findById(lookItem.lookId).populate('products')
          const containsCompleteLook = look?.products?.length > 0 && look.products.every((product) => orderedProductIds.has(String(product._id)))
          if (look && look.hasActiveDiscount && containsCompleteLook) {
            const originalPrice = clampMoney(look.originalPrice || look.products.reduce((sum, product) => sum + (Number(product.price) || 0), 0))
            let discountAmount = 0

            if (look.discountType === 'percentage') {
              discountAmount = originalPrice * (look.discountValue / 100)
            } else if (look.discountType === 'fixed') {
              discountAmount = look.discountValue
            }

            processedLookDiscounts.push({
              lookId: look._id,
              lookTitle: look.title,
              originalPrice,
              discountAmount
            })

            totalLookDiscount += discountAmount
          }
        } catch (err) {
          logger.error(`Error processing look ${lookItem.lookId}:`, err)
        }
      }
    }

    totalLookDiscount = Math.min(subtotal, clampMoney(totalLookDiscount))
    const codeDiscount = await calculateCodeDiscount({
      code: totals.promoCode,
      subtotal: Math.max(0, subtotal - totalLookDiscount),
      userId
    })

    if (codeDiscount.giftCard) {
      claimedGiftCard = await GiftCard.findOneAndUpdate(
        {
          _id: codeDiscount.giftCard._id,
          isUsed: false,
          status: { $in: ['Active', 'Sent'] }
        },
        {
          $set: {
            isUsed: true,
            status: 'Used',
            usedAt: new Date(),
            usedBy: userId
          }
        },
        { new: true }
      )

      if (!claimedGiftCard) {
        return res.status(409).json({
          success: false,
          message: 'Gift card allaqachon ishlatilgan'
        })
      }
    }

    const discountAmount = Math.min(subtotal, clampMoney(totalLookDiscount + codeDiscount.discountAmount))
    const orderTotals = {
      subtotal,
      deliveryFee,
      promoCode: codeDiscount.promoCode,
      discountAmount,
      total: clampMoney(subtotal - discountAmount + deliveryFee + (giftWrap?.cost || 0)),
      giftWrap
    }

    reservations = await reserveInventory(verifiedItems)

    const newOrder = new Order({
      customer,
      items: verifiedItems,
      totals: orderTotals,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      scheduledDelivery: delivery.value,
      idempotencyKey,
      user: userId || null,
      statusHistory: [{ status: 'Kutilmoqda' }],
      lookDiscounts: processedLookDiscounts,
      totalLookDiscount
    })

    await newOrder.save()
    orderSaved = true

    logger.info(`Order created: ${newOrder._id}`)

    if (userId) {
      await User.findByIdAndUpdate(userId, { cart: [] })
    }

    // Build telegram data with look info
    const telegramData = {
      customer,
      items: verifiedItems,
      totals: orderTotals,
      orderId: newOrder._id,
      lookDiscounts: processedLookDiscounts,
      totalLookDiscount
    }

    const telegramResult = await sendOrderToTelegram(telegramData)

    if (telegramResult.success) {
      res.status(201).json({
        success: true,
        message: 'Buyurtma muvaffaqiyatli yuborildi!',
        orderId: newOrder._id,
        total: newOrder.totals.total
      })
    } else {
      res.status(201).json({
        success: true,
        message: `Buyurtma qabul qilindi! (Telegram: ${telegramResult.error})`,
        orderId: newOrder._id,
        total: newOrder.totals.total
      })
    }
  } catch (error) {
    if (reservations.length > 0 && !orderSaved) {
      await releaseInventory(reservations).catch((revertError) => logger.error('Inventory revert error:', revertError))
    }
    if (claimedGiftCard?._id && !orderSaved) {
      await GiftCard.findByIdAndUpdate(claimedGiftCard._id, {
        $set: { isUsed: false, status: 'Active', usedAt: null, usedBy: null }
      }).catch((revertError) => logger.error('Gift card claim revert error:', revertError))
    }
    logger.error('Order creation error:', error)
    res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : 'Server xatosi. Qayta urining.',
      details: error.details || null
    })
  }
}

export const getUserOrders = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10, maxLimit: 50 })

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ user: req.user._id })
    ])

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    })
  } catch (error) {
    logger.error('Error fetching user orders:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}

export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentMethod } = req.query
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20, maxLimit: 100 })

    const query = {}
    if (status) query.status = status
    if (paymentMethod) query.paymentMethod = paymentMethod

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'username phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ])

    logger.info(`Admin fetched ${orders.length} orders`)

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    })
  } catch (error) {
    logger.error('Error fetching all orders:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['Kutilmoqda', 'Jarayonda', 'Yetkazilmoqda', 'Yetkazildi', 'Bekor qilindi']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri status'
      })
    }

    const order = await Order.findById(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Buyurtma topilmadi'
      })
    }

    const previousStatus = order.status
    order.status = status
    order.statusHistory = order.statusHistory || []
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user?._id || null
    })
    if (status === 'Yetkazildi' && previousStatus !== 'Yetkazildi') order.deliveredAt = new Date()
    await order.save()

    // Award points when order is delivered
    if (status === 'Yetkazildi' && previousStatus !== 'Yetkazildi' && order.user) {
      // 3 points per 10,000 sum spent
      const pointsToAward = Math.floor((order.totals.subtotal / 10000) * 3)
      if (pointsToAward > 0) {
        await pointsService.addPoints(order.user, pointsToAward, {
          source: 'purchase',
          description: `Buyurtma yetkazildi: ${order._id}`,
          referenceId: order._id,
          referenceModel: 'Order'
        }).catch(err => logger.error('Points error:', err))
      }
    }

    // Deduct points if order is cancelled after being delivered
    if (status === 'Bekor qilindi' && previousStatus === 'Yetkazildi' && order.user) {
      const pointsToDeduct = Math.floor((order.totals.subtotal / 10000) * 3)
      if (pointsToDeduct > 0) {
        await pointsService.deductPoints(order.user, pointsToDeduct, {
          source: 'purchase',
          description: `Buyurtma bekor qilindi (avval yetkazilgan edi): ${order._id}`,
          referenceId: order._id,
          referenceModel: 'Order'
        }).catch(err => logger.error('Points deduction error:', err))
      }
    }

    logger.info(`Order ${id} status changed to ${status}`)

    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    logger.error('Error updating order status:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params

    const order = await Order.findByIdAndDelete(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Buyurtma topilmadi'
      })
    }

    logger.info(`Order deleted: ${id}`)

    res.json({
      success: true,
      message: 'Buyurtma o\'chirildi'
    })
  } catch (error) {
    logger.error('Error deleting order:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params

    const order = await Order.findById(id).populate('user', 'username phone')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Buyurtma topilmadi'
      })
    }

    const isStaff = req.user?.role === 'admin' || req.user?.role === 'manager'
    const orderUserId = order.user?._id || order.user
    const isOwner = orderUserId && orderUserId.toString() === req.user?._id?.toString()

    if (!isStaff && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Bu buyurtmani ko\'rishga ruxsat yo\'q'
      })
    }

    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    logger.error('Error fetching order:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}
