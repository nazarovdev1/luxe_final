import mongoose from 'mongoose'

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['spending', 'orders', 'reviews', 'social', 'streak'],
    required: true
  },
  criteria: {
    type: {
      action: String, // e.g., 'purchase', 'review', 'share'
      target: Number, // e.g., spend 500000, write 5 reviews
      period: { // optional, for time-bound challenges
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'total']
      }
    }
  },
  reward: {
    type: {
      points: Number,
      badge: String, // badge ID or name
      discountCode: String // optional
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  submissions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    votes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isClosed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

challengeSchema.index({ isActive: 1 })
challengeSchema.index({ type: 1 })

const Challenge = mongoose.model('Challenge', challengeSchema)

export default Challenge