import express from 'express'
import { 
  getPoints, 
  addPoints, 
  spendPoints, 
  getVIPBenefits, 
  getLeaderboard, 
  getMyTransactions,
  getAllUserPoints,
  adminAdjustPoints
} from '../controllers/points.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', protect, getPoints)
router.post('/add', protect, addPoints)
router.post('/spend', protect, spendPoints)
router.get('/vip-benefits', protect, getVIPBenefits)
router.get('/leaderboard', protect, getLeaderboard)
router.get('/transactions', protect, getMyTransactions)

// Admin routes
router.get('/admin/all', protect, getAllUserPoints)
router.post('/admin/adjust', protect, adminAdjustPoints)

export default router