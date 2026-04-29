import express from 'express'
import {
  getLivestreams,
  getLivestreamById,
  createLivestream,
  updateLivestreamStatus,
  deleteLivestream
} from '../controllers/livestream.controller.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/')
  .get(getLivestreams)
  .post(protect, admin, createLivestream)

router.route('/:id')
  .get(getLivestreamById)
  .delete(protect, admin, deleteLivestream)

router.route('/:id/status')
  .put(protect, admin, updateLivestreamStatus)

export default router
