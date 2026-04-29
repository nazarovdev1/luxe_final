import mongoose from 'mongoose'

const liveChatSchema = new mongoose.Schema({
  streamId: {
    type: String,
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

const LiveChatMessage = mongoose.model('LiveChatMessage', liveChatSchema)

export default LiveChatMessage
