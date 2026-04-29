import express from 'express'
import { searchByImage, findSimilar, extractColors, generateEmbeddings } from '../controllers/visualSearch.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/search', searchByImage)
router.post('/colors', extractColors)
router.get('/similar/:id', findSimilar)
router.post('/generate-embeddings', protect, authorize('admin'), generateEmbeddings)

export default router