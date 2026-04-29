import express from 'express'
import {
  createPost,
  getPosts,
  toggleLike,
  deletePost
} from '../controllers/post.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/')
  .get(getPosts)
  .post(protect, createPost)

router.route('/:id/like')
  .put(protect, toggleLike)

router.route('/:id')
  .delete(protect, deletePost)

export default router
