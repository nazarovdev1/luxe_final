import { Server } from 'socket.io'
import logger from '../utils/logger.js'

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Should be restricted in production
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`)

    // Join a specific livestream room
    socket.on('join_stream', (streamId) => {
      socket.join(streamId)
      logger.info(`Client ${socket.id} joined stream ${streamId}`)
    })

    // Handle new chat messages
    socket.on('send_message', (data) => {
      // data: { streamId, user: { _id, username, profileImage }, text }
      io.to(data.streamId).emit('receive_message', data)
    })

    // Handle likes in livestream
    socket.on('send_like', (streamId) => {
      io.to(streamId).emit('receive_like')
    })

    // Handle message deletion in livestream
    socket.on('delete_message', (data) => {
      // data: { streamId, messageId }
      io.to(data.streamId).emit('message_deleted', data.messageId)
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
