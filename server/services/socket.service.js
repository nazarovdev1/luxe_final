import { Server } from 'socket.io'
import logger from '../utils/logger.js'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import LiveChatMessage from '../models/liveChat.model.js'

let io;

const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    return (process.env.CORS_ORIGINS || 'https://luxx.uz,https://www.luxx.uz')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  }

  return ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3003', 'http://127.0.0.1:3003']
}

const isStaff = (user) => user && (user.role === 'admin' || user.role === 'manager' || user.isAdmin)

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ['GET', 'POST']
    }
  })

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '')
    if (!token) return next()

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.user = await User.findById(decoded.id).select('-password').lean()
      return next()
    } catch (error) {
      logger.warn(`Socket auth failed: ${error.message}`)
      return next(new Error('Unauthorized socket token'))
    }
  })

  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`)

    // Join a specific livestream room
    socket.on('join_stream', (streamId) => {
      const safeStreamId = String(streamId || '').trim()
      if (!safeStreamId) return
      socket.join(safeStreamId)
      logger.info(`Client ${socket.id} joined stream ${safeStreamId}`)
    })

    // Handle new chat messages
    socket.on('send_message', async (data = {}) => {
      if (!socket.user) {
        socket.emit('socket_error', { message: 'Chat uchun tizimga kiring' })
        return
      }

      // data: { streamId, user: { _id, username, profileImage }, text }
      const message = await LiveChatMessage.findById(data._id || data.id).lean()
      if (!message || String(message.user) !== String(socket.user._id) || String(message.streamId) !== String(data.streamId)) {
        socket.emit('socket_error', { message: 'Xabar tasdiqlanmadi' })
        return
      }

      io.to(String(data.streamId)).emit('receive_message', data)
    })

    // Handle likes in livestream
    socket.on('send_like', (streamId) => {
      io.to(streamId).emit('receive_like')
    })

    // Handle message deletion in livestream
    socket.on('delete_message', async (data = {}) => {
      if (!socket.user) {
        socket.emit('socket_error', { message: 'Ruxsat etilmagan' })
        return
      }

      // data: { streamId, messageId }
      const messageId = data.messageId || data.id
      const message = await LiveChatMessage.findById(messageId).lean()
      const isOwner = message && String(message.user) === String(socket.user._id)
      if (!message || (!isOwner && !isStaff(socket.user)) || String(message.streamId) !== String(data.streamId)) {
        socket.emit('socket_error', { message: 'Ruxsat etilmagan' })
        return
      }

      io.to(String(data.streamId)).emit('message_deleted', messageId)
    })

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!')
  }
  return io
}
