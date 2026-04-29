import express from 'express'
import { createOrder, getUserOrders, getAllOrders, updateOrderStatus, deleteOrder, getOrderById } from '../controllers/order.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { getOrdersByPhone } from '../controllers/user.controller.js'

const router = express.Router()

router.post('/', validate('order'), createOrder)
router.get('/my-orders', protect, getUserOrders)
router.get('/all', protect, authorize('admin', 'manager'), getAllOrders)
router.get('/user/:phone', protect, getOrdersByPhone)
router.get('/:id', getOrderById)

router.get('/test-telegram', async (req, res) => {
  try {
    const { sendOrderToTelegram } = await import('../services/telegram.service.js')

    const testResult = await sendOrderToTelegram({
      customer: { name: 'Test User', phone: '+998901234567', address: 'Test Address', comments: 'Test Order' },
      items: [{ name: 'Test Product', quantity: 1, price: 100 }],
      totals: { subtotal: 100, deliveryFee: 5, total: 105 }
    })

    if (testResult.success) {
      res.json({ success: true, message: 'Telegram test successful! Check your bot.' })
    } else {
      res.json({
        success: false,
        message: `Telegram test failed: ${testResult.error}`,
        token: process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Not set',
        chatId: process.env.TELEGRAM_CHAT_ID ? 'Set' : 'Not set'
      })
    }
  } catch (error) {
    res.json({ success: false, message: `Error: ${error.message}` })
  }
})

router.patch('/:id/status', protect, authorize('admin', 'manager'), updateOrderStatus)
router.delete('/:id', protect, authorize('admin', 'manager'), deleteOrder)

export default router