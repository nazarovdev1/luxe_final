import express from 'express'
import {
  createStylePoll,
  deleteStylePoll,
  getActiveStylePolls,
  getAdminStylePolls,
  updateStylePoll,
  voteStylePoll
} from '../controllers/stylePoll.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', getActiveStylePolls)
router.get('/admin', protect, getAdminStylePolls)
router.post('/', protect, createStylePoll)
router.put('/:id', protect, updateStylePoll)
router.delete('/:id', protect, deleteStylePoll)
router.post('/:id/vote', voteStylePoll)

export default router
