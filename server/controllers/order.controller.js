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
  if (ids.length !== items.length || ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    const error = new Error('Buyurtmada noto\'g\'ri mahsulot ID mavjud')
    error.status = 400
    throw error
  }

  const products = await Product.find({ _id: { $in: ids } })
    .select('name price images stock')
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

    if (typeof product.stock === 'number' && product.stock < quantity) {
      const error = new Error(`${product.name} uchun yetarli zaxira yo'q`)
      error.status = 400
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
      lookDiscount: clampMoney(item.lookDiscount)
    }
  })
}

export const createOrder = async (req, res) => {
  let claimedGiftCard = null
  let orderSaved = false
  try {
    const { customer, items, totals = {}, paymentMethod, lookItems, lookDiscounts } = req.body
    const userId = req.user?._id || null

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
    const deliveryFee = clampMoney(totals.deliveryFee)

    // Process look discounts
    let processedLookDiscounts = []
    let totalLookDiscount = 0

    if (lookItems && lookItems.length > 0) {
      for (const lookItem of lookItems) {
        try {
          const look = await Look.findById(lookItem.lookId).populate('products')
          if (look && look.hasActiveDiscount) {
            const originalPrice = lookItem.originalPrice || look.originalPrice || 0
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

    // Also accept pre-calculated lookDiscounts from frontend
    if (lookDiscounts && lookDiscounts.length > 0 && processedLookDiscounts.length === 0) {
      processedLookDiscounts = lookDiscounts
      totalLookDiscount = lookDiscounts.reduce((sum, ld) => sum + (ld.discountAmount || 0), 0)
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
      total: clampMoney(subtotal - discountAmount + deliveryFee)
    }

    const newOrder = new Order({
      customer,
      items: verifiedItems,
      totals: orderTotals,
      paymentMethod: paymentMethod || 'cash',
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
        orderId: newOrder._id
      })
    } else {
      res.status(201).json({
        success: true,
        message: `Buyurtma qabul qilindi! (Telegram: ${telegramResult.error})`,
        orderId: newOrder._id
      })
    }
  } catch (error) {
    if (claimedGiftCard?._id && !orderSaved) {
      await GiftCard.findByIdAndUpdate(claimedGiftCard._id, {
        $set: { isUsed: false, status: 'Active', usedAt: null, usedBy: null }
      }).catch((revertError) => logger.error('Gift card claim revert error:', revertError))
    }
    logger.error('Order creation error:', error)
    res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : 'Server xatosi. Qayta urining.'
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
