import pointsService from '../services/points.service.js'
import logger from '../utils/logger.js'
import { protect } from '../middleware/auth.middleware.js'

export const getPoints = async (req, res) => {
  try {
    const points = await pointsService.getOrCreatePoints(req.user._id)
    const vipBenefits = pointsService.getVIPBenefits(points.level)
    res.json({
      success: true,
      points: points,
      vipBenefits
    })
  } catch (error) {
    logger.error('Get points error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const addPoints = async (req, res) => {
  try {
    const { amount, reason } = req.body
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount required' })
    }
    const result = await pointsService.addPoints(req.user._id, amount, reason || 'Manual addition')
    res.json({
      success: true,
      message: `Added ${amount} points`,
      points: result.points,
      newLevel: result.newLevel
    })
  } catch (error) {
    logger.error('Add points error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const spendPoints = async (req, res) => {
  try {
    const { amount } = req.body
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount required' })
    }
    const result = await pointsService.spendPoints(req.user._id, amount)
    if (!result.success) {
      return res.status(400).json(result)
    }
    res.json({
      success: true,
      message: `Spent ${amount} points`,
      points: result.points
    })
  } catch (error) {
    logger.error('Spend points error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getVIPBenefits = async (req, res) => {
  try {
    const points = await pointsService.getOrCreatePoints(req.user._id)
    const vipBenefits = pointsService.getVIPBenefits(points.level)
    res.json({
      success: true,
      level: points.level,
      benefits: vipBenefits,
      totalEarned: points.totalEarned
    })
  } catch (error) {
    logger.error('Get VIP benefits error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await pointsService.getLeaderboard(10)
    res.json({
      success: true,
      leaderboard
    })
  } catch (error) {
    logger.error('Get leaderboard error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await pointsService.getTransactions(req.user._id)
    res.json({
      success: true,
      data: transactions
    })
  } catch (error) {
    logger.error('Get transactions error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}
export const getAllUserPoints = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const Points = (await import('../models/points.model.js')).default
    
    const [pointsRecords, total] = await Promise.all([
      Points.find()
        .populate('user', 'username phone profileImage')
        .sort({ totalEarned: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Points.countDocuments()
    ])

    res.json({
      success: true,
      data: pointsRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    })
  } catch (error) {
    logger.error('Get all user points error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const adminAdjustPoints = async (req, res) => {
  try {
    const { userId, amount, type, description } = req.body
    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: 'Foydalanuvchi va ball miqdori kerak' })
    }

    let result;
    if (type === 'add') {
      result = await pointsService.addPoints(userId, parseInt(amount), {
        source: 'admin',
        description: description || 'Admin tomonidan qo\'shildi'
      })
    } else {
      result = await pointsService.deductPoints(userId, parseInt(amount), {
        source: 'admin',
        description: description || 'Admin tomonidan olib tashlandi'
      })
    }

    res.json({
      success: true,
      message: 'Ballar muvaffaqiyatli o\'zgartirildi',
      points: result.points
    })
  } catch (error) {
    logger.error('Admin adjust points error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}
