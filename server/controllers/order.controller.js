import Order from '../models/order.model.js'
import Product from '../models/product.model.js'
import User from '../models/user.model.js'
import GiftCard from '../models/giftCard.model.js'
import Look from '../models/look.model.js'
import { sendOrderToTelegram } from '../services/telegram.service.js'
import pointsService from '../services/points.service.js'
import logger from '../utils/logger.js'

export const createOrder = async (req, res) => {
  try {
    const { customer, items, totals, paymentMethod, userId, lookItems, lookDiscounts } = req.body

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

    const orderTotals = totals || {
      subtotal: 0,
      deliveryFee: 0,
      total: 0
    }

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

    // Add look discount to totals
    if (totalLookDiscount > 0) {
      orderTotals.discountAmount = (orderTotals.discountAmount || 0) + totalLookDiscount
      orderTotals.total = orderTotals.subtotal - orderTotals.discountAmount + (orderTotals.deliveryFee || 0)
    }

    const newOrder = new Order({
      customer,
      items,
      totals: orderTotals,
      paymentMethod: paymentMethod || 'cash',
      user: userId || null,
      statusHistory: [{ status: 'Kutilmoqda' }],
      lookDiscounts: processedLookDiscounts,
      totalLookDiscount
    })

    await newOrder.save()

    // Handle Gift Card redemption
    if (orderTotals.promoCode) {
      const giftCard = await GiftCard.findOne({ code: orderTotals.promoCode.toUpperCase() })
      if (giftCard && !giftCard.isUsed) {
        giftCard.isUsed = true
        giftCard.usedAt = new Date()
        giftCard.usedBy = userId || null
        await giftCard.save()
        logger.info(`Gift card ${giftCard.code} marked as used for order ${newOrder._id}`)
      }
    }

    logger.info(`Order created: ${newOrder._id}`)

    if (userId) {
      await User.findByIdAndUpdate(userId, { cart: [] })
    }

    // Build telegram data with look info
    const telegramData = {
      customer,
      items,
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
    logger.error('Order creation error:', error)
    res.status(500).json({
      success: false,
      message: 'Server xatosi. Qayta urining.'
    })
  }
}

export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments({ user: req.user._id })
    ])

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
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
    const { page = 1, limit = 20, status, paymentMethod } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const query = {}
    if (status) query.status = status
    if (paymentMethod) query.paymentMethod = paymentMethod

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'username phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query)
    ])

    logger.info(`Admin fetched ${orders.length} orders`)

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
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
