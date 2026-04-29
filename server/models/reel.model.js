import mongoose from 'mongoose'

const reelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter reel title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'Please enter video URL (YouTube/Vimeo)']
  },
  videoType: {
    type: String,
    enum: ['youtube', 'vimeo', 'direct'],
    default: 'direct'
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['new-arrivals', 'collection', 'style-guide', 'behind-scenes'],
    default: 'new-arrivals'
  },
  taggedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  shares: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

reelSchema.index({ createdAt: -1 })
reelSchema.index({ category: 1 })
reelSchema.index({ isActive: 1 })

const Reel = mongoose.model('Reel', reelSchema)

export default Reel