import express from 'express'
import {
  addComment,
  getComments,
  deleteComment
} from '../controllers/comment.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/:postId')
  .get(getComments)
  .post(protect, addComment)

router.route('/:id')
  .delete(protect, deleteComment)

export default router
