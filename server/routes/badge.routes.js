import express from 'express'
import {
  getAllBadges,
  getActiveBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  getMyBadges
} from '../controllers/badge.controller.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/')
  .get(getAllBadges)
  .post(protect, admin, createBadge)

router.get('/active', getActiveBadges)
router.get('/my-badges', protect, getMyBadges)

router.route('/:id')
  .put(protect, admin, updateBadge)
  .delete(protect, admin, deleteBadge)

export default router
