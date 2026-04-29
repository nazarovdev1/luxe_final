import express from 'express'
import {
  getReels,
  getReelById,
  createReel,
  updateReel,
  deleteReel,
  likeReel,
  shareReel,
  getReelComments,
  addReelComment,
  deleteReelComment
} from '../controllers/reel.controller.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

// TEST ROUTE - Visit http://localhost:3003/api/reels/test-api to check
router.get('/test-api', (req, res) => res.json({ success: true, message: 'Reels API is working and updated!' }))

// Unique route for comment deletion
router.delete('/manage-comment/:commentId', protect, deleteReelComment)

// Public routes
router.route('/')
  .get(getReels)
  .post(protect, admin, createReel)

router.route('/:id')
  .get(getReelById)
  .put(protect, admin, updateReel)
  .delete(protect, admin, deleteReel)

router.route('/:id/share')
  .post(shareReel)

router.route('/:id/comments')
  .get(getReelComments)

// Protected routes
router.route('/:id/like')
  .post(protect, likeReel)

router.route('/:id/comment')
  .post(protect, addReelComment)

export default router