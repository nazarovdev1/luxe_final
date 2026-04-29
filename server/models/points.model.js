import mongoose from 'mongoose'

const pointsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Diamond'],
    default: 'Bronze'
  }
}, {
  timestamps: true
})

// Index for quick lookups
pointsSchema.index({ user: 1 }, { unique: true })
pointsSchema.index({ level: 1 })

const Points = mongoose.model('Points', pointsSchema)

export default Points