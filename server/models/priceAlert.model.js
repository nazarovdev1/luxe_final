import mongoose from 'mongoose'

const priceAlertSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    targetPrice: {
      type: Number,
      required: true,
      index: true,
    },
    notifyMethod: {
      type: String,
      enum: ['telegram', 'sms', 'push'],
      default: 'telegram',
    },
    telegramChatId: {
      type: String,
      default: null,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'triggered', 'cancelled', 'expired'],
      default: 'active',
      index: true,
    },
    triggeredAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 kun
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for quick querying matching alerts when product price drops
priceAlertSchema.index({ productId: 1, status: 1, targetPrice: 1 })
priceAlertSchema.index({ phone: 1, productId: 1, status: 1 })

const PriceAlert = mongoose.model('PriceAlert', priceAlertSchema)

export default PriceAlert
