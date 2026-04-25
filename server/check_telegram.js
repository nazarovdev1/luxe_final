import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const checkTelegram = async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    console.log('--- Telegram Config Check ---')
    console.log(`Bot Token: ${token ? token.substring(0, 10) + '...' : 'NOT SET (using default codes?)'}`)
    console.log(`Chat ID: ${chatId ? chatId : 'NOT SET '}`)

    const actualToken = token || '7926089075:AAFf-XyNcGPmccNqUnHysQU7jxm8YeKT4js'
    const actualChatId = chatId || '701571129'

    console.log(`\nUsing:`)
    console.log(`Token: ${actualToken.substring(0, 10)}...`)
    console.log(`ChatID: ${actualChatId}`)

    console.log('\n--- Sending Test Message ---')
    try {
        const url = `https://api.telegram.org/bot${actualToken}/sendMessage`
        const response = await axios.post(url, {
            chat_id: actualChatId,
            text: '🔔 Test message from LUXE Server Debugger',
        })

        if (response.data.ok) {
            console.log('✅ Message sent successfully!')
            console.log('Response:', response.data.result.chat)
        } else {
            console.log('❌ Telegram API Error:', response.data)
        }
    } catch (error) {
        console.error('❌ Request Error:', error.response ? error.response.data : error.message)
    }
}

checkTelegram()
