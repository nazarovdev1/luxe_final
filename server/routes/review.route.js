import express from 'express'
import {
    getReviews,
    createReview,
    deleteReview,
} from '../controllers/review.controller.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/:productId', getReviews)
router.post('/', protect, createReview)
router.delete('/:id', protect, admin, deleteReview)

export default router
