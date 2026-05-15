import mongoose from 'mongoose'

const pointTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['earned', 'spent'],
    required: true
  },
  source: {
    type: String,
    enum: ['purchase', 'review', 'challenge', 'admin', 'checkout'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId, // Can be Order ID, Review ID, Challenge ID
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Order', 'Review', 'Challenge', 'Post']
  }
}, {
  timestamps: true
})

pointTransactionSchema.index({ user: 1 })
pointTransactionSchema.index({ source: 1 })
pointTransactionSchema.index({ createdAt: -1 })

const PointTransaction = mongoose.model('PointTransaction', pointTransactionSchema)

export default PointTransaction
