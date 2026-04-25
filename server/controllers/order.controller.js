// Order Controller
// EN: Handles order creation and Telegram integration
// UZ: Zakas yaratish va Telegram integratsiyasini boshqaradi

import { sendOrderToTelegram } from '../services/telegram.service.js'
import Order from '../models/order.model.js'
import User from '../models/user.model.js'
// import { sendOrderStatusNotification } from '../utils/firebase.js'

// EN: Process new order
// UZ: Yangi zakasni qayta ishlash
export const createOrder = async (req, res) => {
	try {
		const { customer, items, totals, paymentMethod, userId } = req.body

		// EN: Validate order data
		// UZ: Zakas ma'lumotlarini tekshirish
		if (!customer || !items) {
			return res.status(400).json({
				success: false,
				message: 'Zakas ma\'lumotlari to\'liq emas',
			})
		}

		if (!customer.name || !customer.phone || !customer.address) {
			return res.status(400).json({
				success: false,
				message: 'Xaridor ma\'lumotlari to\'liq emas',
			})
		}

		if (items.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Savat bo\'sh',
			})
		}

		// EN: Send order to Telegram
		// UZ: Zakasni Telegram'ga yuborish
		// Construct totals if missing (backward compatibility)
		const orderTotals = totals || {
			subtotal: 0,
			deliveryFee: 0,
			total: 0
		}

		// EN: Save to Database
		// UZ: Bazaga saqlash
		const newOrder = new Order({
			customer,
			items,
			totals: orderTotals,
			paymentMethod: paymentMethod || 'cash',
			user: userId || null
		})
		await newOrder.save()


		console.log('✅ Order saved to database:', newOrder._id)

		// Clear user cart if userId exists
		if (userId) {
			console.log('🧹 Clearing cart for user:', userId)
			await User.findByIdAndUpdate(userId, { cart: [] })
		}

		// TELEGRAM ENABLED
		console.log('Sending order to Telegram...', { customer, items: items.length, totals: orderTotals })
		const telegramResult = await sendOrderToTelegram({
			customer,
			items,
			totals: orderTotals,
			orderId: newOrder._id // Send ID to Telegram if needed
		})

		if (telegramResult.success) {
			console.log('Telegram order sent successfully')
			// EN: Success response
			// UZ: Muvaffaqiyat javobi
			res.status(201).json({
				success: true,
				message: 'Buyurtma muvaffaqiyatli yuborildi!',
			})
		} else {
			console.error('Telegram error:', telegramResult.error)

			// EN: Telegram failed but order is still valid
			// UZ: Telegram ishlamayotgan bo'lsa ham zakas saqlanadi
			res.status(201).json({
				success: true,
				message: `Buyurtma qabul qilindi! (Telegram: ${telegramResult.error})`,
			})
		}
	} catch (error) {
		console.error('Order creation error:', error)
		res.status(500).json({
			success: false,
			message: 'Server xatosi. Qayta urining.',
		})
	}
}

// EN: Get logged in user's orders
// UZ: Tizimga kirgan foydalanuvchi buyurtmalarini olish
export const getUserOrders = async (req, res) => {
	try {
		const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
		res.json({
			success: true,
			data: orders
		})
	} catch (error) {
		console.error('Error fetching user orders:', error)
		res.status(500).json({
			success: false,
			message: 'Server xatosi'
		})
	}
}

// EN: Get all orders (Admin only)
// UZ: Barcha buyurtmalarni olish (Admin uchun)
export const getAllOrders = async (req, res) => {
	try {
		console.log('=== GET ALL ORDERS REQUEST ===')
		console.log('Auth header:', req.headers.authorization ? 'Present' : 'Missing')
		console.log('User:', req.user ? req.user.username : 'No user')

		const orders = await Order.find()
			.populate('user', 'username phone')
			.sort({ createdAt: -1 })

		console.log('✅ Found orders:', orders.length)

		res.json({
			success: true,
			data: orders
		})
	} catch (error) {
		console.error('❌ Error fetching all orders:', error)
		res.status(500).json({
			success: false,
			message: 'Server xatosi'
		})
	}
}

// EN: Update order status (Admin only)
// UZ: Buyurtma statusini o'zgartirish (Admin uchun)
export const updateOrderStatus = async (req, res) => {
	try {
		const { id } = req.params
		const { status } = req.body

		// Validate status
		const validStatuses = ['Kutilmoqda', 'Jarayonda', 'Yetkazilmoqda', 'Yetkazildi', 'Bekor qilindi']
		if (!validStatuses.includes(status)) {
			return res.status(400).json({
				success: false,
				message: 'Noto\'g\'ri status'
			})
		}

		const order = await Order.findByIdAndUpdate(
			id,
			{ status },
			{ new: true }
		).populate('user', 'fcmToken')

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Buyurtma topilmadi'
			})
		}

		// FIREBASE DISABLED
		// Send push notification if user has FCM token
		// if (order.user?.fcmToken) {
		// 	console.log('📱 Sending push notification to user...')
		// 	const pushResult = await sendOrderStatusNotification(
		// 		order.user.fcmToken,
		// 		order._id.toString(),
		// 		status
		// 	)
		// 	if (pushResult.success) {
		// 		console.log('✅ Push notification sent successfully')
		// 	} else {
		// 		console.log('⚠️ Push notification failed:', pushResult.error)
		// 	}
		// } else {
		// 	console.log('ℹ️ No FCM token for this order user')
		// }

		res.json({
			success: true,
			data: order
		})
	} catch (error) {
		console.error('Error updating order status:', error)
		res.status(500).json({
			success: false,
			message: 'Server xatosi'
		})
	}
}

// EN: Delete order (Admin only)
// UZ: Buyurtmani o'chirish (Admin uchun)
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

		console.log('✅ Order deleted:', id)

		res.json({
			success: true,
			message: 'Buyurtma o\'chirildi'
		})
	} catch (error) {
		console.error('Error deleting order:', error)
		res.status(500).json({
			success: false,
			message: 'Server xatosi'
		})
	}
}
