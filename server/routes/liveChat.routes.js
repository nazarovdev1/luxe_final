import express from 'express'
import { getMessages, addMessage, deleteMessage } from '../controllers/liveChat.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/:streamId')
  .get(getMessages)
  .post(protect, addMessage)

router.route('/:id')
  .delete(protect, deleteMessage)

export default router
