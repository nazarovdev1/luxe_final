import crypto from 'node:crypto'
import User from '../models/user.model.js'
import PasswordReset from '../models/passwordReset.model.js'
import smsService from '../services/sms.service.js'
import logger from '../utils/logger.js'

export const RESET_CODE_TTL_MS = 15 * 60 * 1000
export const MAX_CODE_ATTEMPTS = 5

const PHONE_PATTERN = /^\+998[0-9]{9}$/

export const generateCode = () => String(crypto.randomInt(100000, 1000000))
export const generateResetToken = () => crypto.randomBytes(32).toString('hex')
export const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex')

const safeEqual = (a, b) => {
  const left = Buffer.from(String(a))
  const right = Buffer.from(String(b))
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export const requestPasswordReset = async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone || !PHONE_PATTERN.test(phone)) {
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
    const record = await PasswordReset.create({
      user: user._id,
      phone,
      code,
      expiresAt: new Date(Date.now() + RESET_CODE_TTL_MS)
    })

    const smsResult = await smsService.sendSMS(phone, `Luxe: Parolni tiklash kodi - ${code}. Kod 15 daqiqa davomida amal qiladi.`)

    if (!smsResult.success) {
      await PasswordReset.deleteOne({ _id: record._id })
      logger.error(`Password reset SMS failed for user ${user._id}: ${smsResult.error}`)
      return res.status(503).json({
        success: false,
        message: 'SMS yuborishda xatolik. Iltimos, keyinroq urinib ko\'ring.'
      })
    }

    logger.info(`Password reset code sent for user ${user._id}`)

    res.json({
      success: true,
      message: 'Tasdiqlash kodi yuborildi',
      expiresIn: RESET_CODE_TTL_MS / 1000
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

    if (!phone || !code || typeof phone !== 'string' || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Telefon va kod talab qilinadi'
      })
    }

    const record = await PasswordReset.findOne({
      phone,
      used: false,
      expiresAt: { $gt: new Date() }
    })

    if (!record || record.attempts >= MAX_CODE_ATTEMPTS) {
      return res.status(400).json({
        success: false,
        message: 'Kod noto\'g\'ri yoki muddati o\'tgan'
      })
    }

    if (!safeEqual(record.code, code.trim())) {
      record.attempts += 1
      await record.save()
      return res.status(400).json({
        success: false,
        message: 'Kod noto\'g\'ri yoki muddati o\'tgan'
      })
    }

    const resetToken = generateResetToken()
    record.verified = true
    record.resetTokenHash = hashToken(resetToken)
    await record.save()

    res.json({
      success: true,
      message: 'Kod tasdiqlandi',
      resetToken
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
    const resetToken = req.body.resetToken || req.body.token
    const { password } = req.body

    if (!resetToken || !password || typeof resetToken !== 'string' || typeof password !== 'string') {
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

    const resetRecord = await PasswordReset.findOne({
      resetTokenHash: hashToken(resetToken),
      verified: true,
      used: false,
      expiresAt: { $gt: new Date() }
    })

    if (!resetRecord) {
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
    resetRecord.resetTokenHash = null
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
