import mongoose from 'mongoose'

const livestreamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended'],
    default: 'scheduled'
  },
  videoUrl: {
    type: String,
    required: true // YouTube link or similar HLS source
  },
  featuredProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scheduledStartTime: {
    type: Date,
    required: true
  },
  actualStartTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  viewersCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

const Livestream = mongoose.model('Livestream', livestreamSchema)

export default Livestream
