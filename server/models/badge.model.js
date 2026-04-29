import mongoose from 'mongoose'

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String, // URL or icon name from lucide-react
    required: true
  },
  criteria: {
    type: String,
    enum: ['purchase_amount', 'number_of_orders', 'reviews_written', 'days_streak', 'social_shares', 'referral_count'],
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  reward: {
    type: {
      points: Number,
      discountPercentage: Number,
      freeShipping: Boolean,
      earlyAccess: Boolean
    },
    default: {
      points: 0,
      discountPercentage: 0,
      freeShipping: false,
      earlyAccess: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

badgeSchema.index({ criteria: 1 })
badgeSchema.index({ isActive: 1 })

const Badge = mongoose.model('Badge', badgeSchema)

export default Badge