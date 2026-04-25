// Test Telegram message formatting
import axios from 'axios'

function formatOrderMessage(orderData) {
	const { customer, items, totals } = orderData

	let message = `🛍️ <b>Yangi buyurtma!</b>\n\n`

	// EN: Customer information
	// UZ: Xaridor ma'lumotlari
	message += `👤 <b>Xaridor:</b>\n`
	message += `Ism: ${customer.name}\n`
	message += `Telefon: ${customer.phone}\n`
	message += `Manzil: ${customer.address}\n`
	if (customer.comments) {
		message += `Izoh: ${customer.comments}\n`
	}
	message += `\n`

	// EN: Order items
	// UZ: Zakas mahsulotlari
	message += `🛒 <b>Buyurtma mazmuni:</b>\n`
	items.forEach((item, index) => {
		const price =
			typeof item.price === 'string'
				? parseFloat(item.price.replace('$', ''))
				: item.price

		// EN: Product name with category
		// UZ: Mahsulot nomi va kategoriyasi
		message += `${index + 1}. ${item.name}`
		if (item.category) {
			message += ` (${item.category})`
		}
		message += `\n`

		// EN: Product badge and rating
		// UZ: Mahsulot belgisi va reytingi
		if (item.badge) {
			message += `   🏷️ ${item.badge}`
		}
		if (item.rating) {
			message += ` • ★${item.rating}`
		}
		if (item.badge || item.rating) {
			message += `\n`
		}

		// EN: Product description
		// UZ: Mahsulot tavsifi
		if (item.description) {
			message += `   📝 ${item.description}\n`
		}

		message += `   🔢 Soni: ${item.quantity} dona\n`
		message += `   💵 Narxi: $${price.toFixed(2)} har biri\n`

		// EN: Selected color and size
		// UZ: Tanlangan rang va o'lcham
		if (item.selectedColor) {
			message += `   🎨 Rang: ${item.selectedColor}\n`
		}
		if (item.selectedSize) {
			message += `   📏 O'lcham: ${item.selectedSize}\n`
		}
		message += `\n`
	})

	// EN: Order totals
	// UZ: Zakas umumiy narxi
	message += `💰 <b>To'lov ma'lumotlari:</b>\n`
	message += `Mahsulotlar jami: $${totals.subtotal.toFixed(2)}\n`
	message += `Yetkazib berish: $${totals.deliveryFee.toFixed(2)}\n`
	message += `Umumiy: $${totals.total.toFixed(2)}\n\n`

	// EN: Order time
	// UZ: Zakas vaqti
	message += `🕐 Zakas vaqti: ${new Date().toLocaleString('uz-UZ')}\n`
	message += `🏪 Do'kon: Luxury Fashion Store`

	return message
}

const orderData = {
	customer: {
		name: 'Sunnatillo Raimov',
		phone: '+998338992402',
		address: 'angren\n5/3-4a',
		comments: 'test'
	},
	items: [{
		name: 'Test Product',
		category: 'Clothing',
		quantity: 1,
		price: 20,
		selectedColor: 'Black',
		selectedSize: 'M',
		description: 'A test description',
		badge: 'New',
		rating: 4.5
	}],
	totals: { subtotal: 30000000, deliveryFee: 0, total: 30000000 }
}

const message = formatOrderMessage(orderData)
console.log(message)

const TELEGRAM_BOT_TOKEN = '7926089075:AAFf-XyNcGPmccNqUnHysQU7jxm8YeKT4js'
const TELEGRAM_CHAT_ID = '701571129'
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

async function sendTest() {
	try {
		const response = await axios.post(TELEGRAM_API_URL, {
			chat_id: TELEGRAM_CHAT_ID,
			text: message,
			parse_mode: 'HTML',
		}, {
			headers: {
				'Content-Type': 'application/json',
			}
		})

		if (response.data.ok) {
			console.log('Sent successfully')
		} else {
			console.error('Telegram API error:', response.data)
		}
	} catch (error) {
		console.error('Error:', error.response?.data || error.message)
	}
}

sendTest()
