import Badge from '../models/badge.model.js'
import UserBadge from '../models/userBadge.model.js'

// @desc    Get all badges
// @route   GET /api/badges
// @access  Public/Private
export const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({})
    res.json({ success: true, data: badges })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get active badges
// @route   GET /api/badges/active
// @access  Public/Private
export const getActiveBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ isActive: true })
    res.json({ success: true, data: badges })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Create a badge
// @route   POST /api/badges
// @access  Admin
export const createBadge = async (req, res) => {
  try {
    const badge = new Badge(req.body)
    const createdBadge = await badge.save()
    res.status(201).json({ success: true, data: createdBadge })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Update a badge
// @route   PUT /api/badges/:id
// @access  Admin
export const updateBadge = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id)

    if (badge) {
      Object.assign(badge, req.body)
      const updatedBadge = await badge.save()
      res.json({ success: true, data: updatedBadge })
    } else {
      res.status(404).json({ success: false, message: 'Badge not found' })
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Delete a badge
// @route   DELETE /api/badges/:id
// @access  Admin
export const deleteBadge = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id)

    if (badge) {
      await badge.deleteOne()
      res.json({ success: true, message: 'Badge removed' })
    } else {
      res.status(404).json({ success: false, message: 'Badge not found' })
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Get user's earned badges
// @route   GET /api/badges/my-badges
// @access  Private
export const getMyBadges = async (req, res) => {
  try {
    const userBadges = await UserBadge.find({ user: req.user._id }).populate('badge')
    res.json({ success: true, data: userBadges })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
