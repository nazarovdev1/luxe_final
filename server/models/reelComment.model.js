import mongoose from 'mongoose'

const reelCommentSchema = new mongoose.Schema({
  reel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reel',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReelComment',
    default: null
  }
}, {
  timestamps: true
})

reelCommentSchema.index({ reel: 1, createdAt: -1 })
reelCommentSchema.index({ user: 1 })

const ReelComment = mongoose.model('ReelComment', reelCommentSchema)

export default ReelComment