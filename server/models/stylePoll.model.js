import mongoose from 'mongoose'

const stylePollOptionSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  votes: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: true })

const stylePollVoteSchema = new mongoose.Schema({
  option: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  voterKey: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true })

const stylePollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 220
  },
  category: {
    type: String,
    trim: true,
    default: 'Community',
    maxlength: 80
  },
  options: {
    type: [stylePollOptionSchema],
    validate: {
      validator: (options) => Array.isArray(options) && options.length >= 2,
      message: 'Kamida 2 ta variant kerak'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  votes: [stylePollVoteSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

stylePollSchema.virtual('totalVotes').get(function () {
  return this.options.reduce((sum, option) => sum + (option.votes || 0), 0)
})

stylePollSchema.index({ isActive: 1, createdAt: -1 })
stylePollSchema.index({ expiresAt: 1 })
stylePollSchema.index({ _id: 1, 'votes.voterKey': 1 })

const StylePoll = mongoose.model('StylePoll', stylePollSchema)

export default StylePoll
