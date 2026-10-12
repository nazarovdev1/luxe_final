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
  },
  attempts: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  // SHA-256 of the one-time reset token handed out after the SMS code is verified
  resetTokenHash: {
    type: String,
    default: null,
    index: true,
    sparse: true
  }
}, {
  timestamps: true
})

passwordResetSchema.index({ code: 1, phone: 1 })
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema)

export default PasswordReset