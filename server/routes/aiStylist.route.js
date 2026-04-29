import express from 'express'
import { chatWithStylist, generateOutfit, getStyleAdvice } from '../controllers/aiStylist.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/chat', protect, chatWithStylist)
router.post('/outfit', protect, generateOutfit)
router.post('/advice', protect, getStyleAdvice)

export default router