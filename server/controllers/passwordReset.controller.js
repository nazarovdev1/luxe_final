import User from '../models/user.model.js'
import PasswordReset from '../models/passwordReset.model.js'
import smsService from '../services/sms.service.js'
import logger from '../utils/logger.js'

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const requestPasswordReset = async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone || !phone.match(/^\+998[0-9]{9}$/)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak' 
      })
    }

    const user = await User.findOne({ phone })
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bu telefon raqam bilan foydalanuvchi topilmadi' 
      })
    }

    await PasswordReset.deleteMany({ phone, used: false })

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await PasswordReset.create({
      user: user._id,
      phone,
      code,
      expiresAt
    })

    const smsResult = await smsService.sendSMS(phone, `Luxe: Parolni tiklash kodi - ${code}. Kod 15 daqiqa davomida amal qiladi.`)

    if (!smsResult.success) {
      logger.warn(`SMS failed for password reset, code will be logged: ${code}`)
      return res.status(500).json({
        success: false,
        message: 'SMS yuborishda xatolik. Iltimos, keyinroq urinib ko\'ring.'
      })
    }

    logger.info(`Password reset code sent to ${phone}`)

    res.json({
      success: true,
      message: 'Tasdiqlash kodi yuborildi',
      expiresIn: 900
    })
  } catch (error) {
    logger.error('Password reset request error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server xatosi' 
    })
  }
}

export const verifyResetCode = async (req, res) => {
  try {
    const { phone, code } = req.body

    if (!phone || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Telefon va kod talab qilinadi' 
      })
    }

    const resetRecord = await PasswordReset.findOne({ 
      phone, 
      code, 
      used: false,
      expiresAt: { $gt: new Date() }
    })

    if (!resetRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kod noto\'g\'ri yoki muddati o\'tgan' 
      })
    }

    res.json({
      success: true,
      message: 'Kod tasdiqlandi',
      resetToken: resetRecord._id
    })
  } catch (error) {
    logger.error('Verify reset code error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server xatosi' 
    })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body

    if (!resetToken || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token va parol talab qilinadi' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Parol kamida 6 ta belgi bo\'lishi kerak' 
      })
    }

    const resetRecord = await PasswordReset.findById(resetToken)
    
    if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sesion muddati o\'tgan. Qayta urinib ko\'ring.' 
      })
    }

    const user = await User.findById(resetRecord.user)
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Foydalanuvchi topilmadi' 
      })
    }

    user.password = password
    await user.save()

    resetRecord.used = true
    await resetRecord.save()

    logger.info(`Password reset completed for user ${user._id}`)

    res.json({
      success: true,
      message: 'Parol muvaffaqiyatli o\'zgartirildi'
    })
  } catch (error) {
    logger.error('Reset password error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server xatosi' 
    })
  }
}