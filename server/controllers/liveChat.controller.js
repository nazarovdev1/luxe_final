import LiveChatMessage from '../models/liveChat.model.js'
import { getIO } from '../services/socket.service.js'

// @desc    Get messages for a livestream
// @route   GET /api/live-chat/:streamId
// @access  Public
export const getMessages = async (req, res) => {
  try {
    const messages = await LiveChatMessage.find({ streamId: req.params.streamId })
      .populate('user', 'username profileImage')
      .sort({ createdAt: 1 })
      .limit(100)

    res.json({ success: true, data: messages })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Add a message to livestream chat
// @route   POST /api/live-chat/:streamId
// @access  Private
export const addMessage = async (req, res) => {
  try {
    const { text } = req.body
    const { streamId } = req.params

    if (!text) {
      return res.status(400).json({ success: false, message: 'Xabar bo\'sh bo\'lishi mumkin emas' })
    }

    const message = new LiveChatMessage({
      streamId,
      user: req.user._id,
      text
    })

    const savedMessage = await message.save()
    await savedMessage.populate('user', 'username profileImage')

    res.status(201).json({ success: true, data: savedMessage })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Delete a message from livestream chat
// @route   DELETE /api/live-chat/:id
// @access  Private (Admin)
export const deleteMessage = async (req, res) => {
  try {
    const message = await LiveChatMessage.findById(req.params.id)

    if (!message) {
      return res.status(404).json({ success: false, message: 'Xabar topilmadi' })
    }

    // Only admin can delete live chat messages for now, or the author
    const isStaff = req.user.role === 'admin' || req.user.role === 'manager' || req.user.isAdmin
    if (message.user.toString() !== req.user._id.toString() && !isStaff) {
      return res.status(403).json({ success: false, message: 'Ruxsat etilmagan' })
    }

    await message.deleteOne()

    try {
      getIO().to(String(message.streamId)).emit('message_deleted', String(message._id))
    } catch {
      // Socket.io may be unavailable in tests or one-off scripts.
    }

    res.json({ success: true, message: 'Xabar o\'chirildi' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
