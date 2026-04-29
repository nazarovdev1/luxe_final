import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import Order from '../models/order.model.js'
import sustainabilityService from '../services/sustainability.service.js'
import logger from '../utils/logger.js'

const router = express.Router()

// @desc Get user's eco impact stats
// @route GET /api/sustainability/my-stats
// @access Private
router.get('/my-stats', protect, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      status: 'Yetkazildi'
    }).populate('items.product', 'name category materials')

    let totalItems = 0
    let totalEcoScore = 0
    let scoredItems = 0
    const categoryCount = {}

    for (const order of orders) {
      for (const item of order.items) {
        totalItems++
        
        if (item.product?.category) {
          categoryCount[item.product.category] = (categoryCount[item.product.category] || 0) + 1
        }

        const materials = item.product?.materials || []
        if (materials.length > 0) {
          totalEcoScore += sustainabilityService.calculateEcoScore(materials)
          scoredItems++
        }
      }
    }

    const avgEcoScore = scoredItems > 0 ? Math.round(totalEcoScore / scoredItems) : 5

    // Gamified metrics (1 kg clothing saved ≈ 3500 liters water, 10 kg CO2)
    const estimatedWaterSaved = Math.round(totalItems * 100)   // liters (approximate)
    const estimatedCO2Saved = Math.round(totalItems * 2.5)      // kg CO2
    const treesEquivalent = Math.max(0, Math.round(estimatedCO2Saved / 21)) // 1 tree ≈ 21 kg CO2/year

    const ecoRank =
      avgEcoScore >= 8 ? 'Eco Champion 🌿' :
      avgEcoScore >= 6 ? 'Yashil Xaridor 🌱' :
      avgEcoScore >= 4 ? 'Ongli Iste\'molchi ♻️' :
      'Boshlang\'ich 🌍'

    logger.info(`Eco stats fetched for user ${req.user._id}`)

    res.json({
      success: true,
      data: {
        totalOrders: orders.length,
        totalItems,
        avgEcoScore,
        ecoRank,
        estimatedWaterSaved,
        estimatedCO2Saved,
        treesEquivalent,
        topCategories: Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat, count]) => ({ category: cat, count }))
      }
    })
  } catch (error) {
    logger.error('Eco stats error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
