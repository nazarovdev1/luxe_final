// Telegram Bot Service
// EN: Service to send messages to Telegram bot
// UZ: Telegram bot'ga xabar yuborish uchun service

import axios from 'axios'

// EN: Replace these with your actual bot token and chat ID
// UZ: O'rniga o'z bot tokeningiz va chat IDni qo'ying
// EN: Send order message to Telegram
// UZ: Zakas xabarini Telegram'ga yuborish
async function sendOrderToTelegram(orderData) {
	try {
		// moved inside to ensure env vars are loaded
		const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8504200030:AAG...' // Context from log
		const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1816138407' // Updated from log
		const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

		// EN: Format the order message
		// UZ: Zakas xabarini formatlash
		const message = formatOrderMessage(orderData)

		// EN: Send to Telegram API using axios
		// UZ: Telegram API'ga axios bilan yuborish
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
			return { success: true }
		} else {
			console.error('Telegram API error:', response.data)
			return { success: false, error: response.data.description }
		}
	} catch (error) {
		console.error('Error sending to Telegram:', error.response?.data || error.message)
		return { success: false, error: error.message }
	}
}

// EN: Format order data into a readable message
// UZ: Zakas ma'lumotlarini o'qishga qulay xabarga aylantirish
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
	message += `Mahsulotlar jami: $${(totals?.subtotal || 0).toFixed(2)}\n`
	message += `Yetkazib berish: $${(totals?.deliveryFee || 0).toFixed(2)}\n`
	message += `Umumiy: $${(totals?.total || 0).toFixed(2)}\n\n`

	// EN: Order time
	// UZ: Zakas vaqti
	message += `🕐 Zakas vaqti: ${new Date().toLocaleString('uz-UZ')}\n`
	message += `🏪 Do'kon: Luxury Fashion Store`

	return message
}

async function sendContactMessage(name, phone, message) {
	try {
		const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8504200030:AAG...'
		const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1816138407'
		const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

		const timestamp = new Date().toLocaleString('uz-UZ', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})

		const text = `
🔔 <b>Yangi xabar LUXE Fashion dan!</b>

👤 <b>Ism:</b> ${name}
📱 <b>Telefon:</b> ${phone}
💬 <b>Xabar:</b> ${message}

⏰ <b>Vaqt:</b> ${timestamp}
📍 <b>Sayt:</b> luxefashion.uz

<i>Vaqtli javob berib qolamiz!</i>
`.trim()

		const response = await axios.post(TELEGRAM_API_URL, {
			chat_id: TELEGRAM_CHAT_ID,
			text: text,
			parse_mode: 'HTML',
			disable_web_page_preview: true
		})

		if (response.data.ok) {
			return { success: true }
		} else {
			return { success: false, error: response.data.description }
		}
	} catch (error) {
		console.error('Error sending contact to Telegram:', error.message)
		return { success: false, error: error.message }
	}
}

export { sendOrderToTelegram, sendContactMessage }
