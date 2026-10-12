import mongoose from 'mongoose'
import StockAlert from '../models/stockAlert.model.js'
import Product from '../models/product.model.js'
import logger from '../utils/logger.js'

export const MAX_ACTIVE_ALERTS_PER_PHONE = 10
const PHONE_PATTERN = /^\+998[0-9]{9}$/

const clean = (value, max = 40) => String(value ?? '').trim().slice(0, max)

// POST /api/stock-alerts  { productId, phone, size?, color? }
export const createStockAlert = async (req, res) => {
  try {
    const productId = clean(req.body.productId, 40)
    const phone = clean(req.body.phone, 20)
    const size = clean(req.body.size, 30)
    const color = clean(req.body.color, 60)

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Yaroqsiz mahsulot ID' })
    }
    if (!PHONE_PATTERN.test(phone)) {
      return res.status(400).json({ success: false, message: 'Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak' })
    }

    const product = await Product.findById(productId).select('name').lean()
    if (!product) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' })

    const existing = await StockAlert.findOne({ product: productId, phone, size, color, status: 'active' })
    if (existing) return res.json({ success: true, duplicate: true, message: 'Siz allaqachon kutayotganlar ro\'yxatidasiz' })

    const active = await StockAlert.countDocuments({ phone, status: 'active' })
    if (active >= MAX_ACTIVE_ALERTS_PER_PHONE) {
      return res.status(429).json({ success: false, message: 'Bu raqam uchun kutish ro\'yxati limiti to\'ldi' })
    }

    await StockAlert.create({ product: productId, phone, size, color, user: req.user?._id || null })
    return res.status(201).json({ success: true, message: 'Mahsulot sotuvga chiqqanda sizga xabar beramiz' })
  } catch (error) {
    logger.error('Create stock alert error:', error)
    return res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}
