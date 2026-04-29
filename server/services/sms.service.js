import axios from 'axios'
import logger from '../utils/logger.js'

class SMSService {
  constructor() {
    this.clickSmsLogin = process.env.CLICK_SMS_LOGIN
    this.clickSmsPassword = process.env.CLICK_SMS_PASSWORD
    this.smsApiUrl = process.env.SMS_API_URL || 'https://sms.sender.uz/api'
    this.smsApiKey = process.env.SMS_API_KEY
  }

  async sendSMS(phone, message) {
    try {
      if (this.smsApiKey) {
        return await this.sendViaApi(phone, message)
      } else if (this.clickSmsLogin) {
        return await this.sendViaClick(phone, message)
      } else {
        logger.warn(`SMS not configured. Would send to ${phone}: ${message}`)
        return { success: true, simulated: true }
      }
    } catch (error) {
      logger.error('SMS send error:', error)
      return { success: false, error: error.message }
    }
  }

  async sendViaApi(phone, message) {
    try {
      const response = await axios.post(
        `${this.smsApiUrl}/send`,
        {
          phone: this.formatPhone(phone),
          text: message,
          from: 'LUXE'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.smsApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )

      logger.info(`SMS sent to ${phone}`)
      return { success: true, messageId: response.data.id }
    } catch (error) {
      logger.error('SMS API error:', error)
      return { success: false, error: error.message }
    }
  }

  async sendViaClick(phone, message) {
    try {
      const response = await axios.post(
        'https://api.click.uz/api/v1/sms/send',
        {
          login: this.clickSmsLogin,
          password: this.clickSmsPassword,
          phone: this.formatPhone(phone),
          text: message
        },
        {
          timeout: 10000
        }
      )

      logger.info(`SMS sent via CLICK to ${phone}`)
      return { success: true }
    } catch (error) {
      logger.error('CLICK SMS error:', error)
      return { success: false, error: error.message }
    }
  }

  formatPhone(phone) {
    return phone.replace(/[^0-9+]/g, '')
  }

  async verifyPhone(phone) {
    try {
      const formatted = this.formatPhone(phone)
      return /^\+998[0-9]{9}$/.test(formatted)
    } catch {
      return false
    }
  }

  async getBalance() {
    try {
      if (this.smsApiKey) {
        const response = await axios.get(
          `${this.smsApiUrl}/balance`,
          {
            headers: { 'Authorization': `Bearer ${this.smsApiKey}` },
            timeout: 5000
          }
        )
        return { success: true, balance: response.data.balance }
      }
      return { success: false, error: 'No SMS API configured' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

export default new SMSService()