import mongoose from 'mongoose'

const passwordResetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

passwordResetSchema.index({ code: 1, phone: 1 })
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema)

export default PasswordReset