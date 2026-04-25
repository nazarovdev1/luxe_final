// Order Routes
// EN: Routes for order management
// UZ: Zakas boshqaruv uchun routerlar

import express from 'express'
import { createOrder, getUserOrders, getAllOrders, updateOrderStatus, deleteOrder } from '../controllers/order.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { getOrdersByPhone } from '../controllers/user.controller.js'

const router = express.Router()

// EN: POST - Create new order and send to Telegram
// UZ: POST - Yangi zakas yaratish va Telegram'ga yuborish
router.post('/', createOrder)

// EN: GET - Get logged in user's orders
// UZ: Tizimga kirgan foydalanuvchi buyurtmalarini olish
router.get('/my-orders', protect, getUserOrders)

// EN: GET - Get all orders (Admin only)
// UZ: Barcha buyurtmalarni olish (Admin uchun)
router.get('/all', protect, authorize('admin', 'manager'), getAllOrders)

// EN: GET - Test Telegram connection
// UZ: Telegram ulanishini sinov
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

// EN: GET - Get user orders by phone (Protected)
// UZ: Foydalanuvchi buyurtmalarini telefon orqali olish (Himoyalangan)
router.get('/user/:phone', protect, getOrdersByPhone)

// EN: PATCH - Update order status (Admin only)
// UZ: Buyurtma statusini o'zgartirish (Admin uchun)
router.patch('/:id/status', protect, authorize('admin', 'manager'), updateOrderStatus)

// EN: DELETE - Delete order (Admin only)
// UZ: Buyurtmani o'chirish (Admin uchun)
router.delete('/:id', protect, authorize('admin', 'manager'), deleteOrder)

export default router
