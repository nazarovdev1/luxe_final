import express from 'express'
import {
  createStylePoll,
  deleteStylePoll,
  getActiveStylePolls,
  getAdminStylePolls,
  updateStylePoll,
  voteStylePoll
} from '../controllers/stylePoll.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', getActiveStylePolls)
router.get('/admin', protect, authorize('admin', 'manager'), getAdminStylePolls)
router.post('/', protect, authorize('admin', 'manager'), createStylePoll)
router.put('/:id', protect, authorize('admin', 'manager'), updateStylePoll)
router.delete('/:id', protect, authorize('admin', 'manager'), deleteStylePoll)
router.post('/:id/vote', voteStylePoll)

export default router
