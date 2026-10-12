import mongoose from 'mongoose'

const stockAlertSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  // Empty size/color means "any variant of this product".
  size: { type: String, trim: true, default: '' },
  color: { type: String, trim: true, default: '' },
  phone: { type: String, trim: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  telegramId: { type: String, default: null },
  status: { type: String, enum: ['active', 'notified', 'cancelled'], default: 'active', index: true },
  notifiedAt: { type: Date, default: null },
  notifiedVia: { type: [String], default: [] }
}, { timestamps: true })

stockAlertSchema.index({ product: 1, status: 1 })
stockAlertSchema.index({ phone: 1, status: 1 })

const StockAlert = mongoose.model('StockAlert', stockAlertSchema)

export default StockAlert
