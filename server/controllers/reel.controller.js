import Reel from '../models/reel.model.js'
import ReelComment from '../models/reelComment.model.js'
import Product from '../models/product.model.js'
import logger from '../utils/logger.js'

// Helper function to convert video URL to embed URL
const getEmbedUrl = (url) => {
  if (!url) return null

  // YouTube (including Shorts)
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&mute=1&playsinline=1&controls=1&rel=0`
  }

  // Vimeo
  const vimeoRegex = /vimeo\.com\/(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&title=0&byline=0&portrait=0`
  }

  // Already embed URL
  if (url.includes('embed') || url.includes('player.vimeo.com')) {
    return url
  }

  return url
}

// Helper function to detect video type
const detectVideoType = (url) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube'
  }
  if (url.includes('vimeo.com')) {
    return 'vimeo'
  }
  return 'direct' // Default to direct MP4/WebM for ImageKit
}

// @desc    Get all reels
// @route   GET /api/reels
// @access  Public
export const getReels = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, active = true } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const query = {}
    if (category) query.category = category
    if (active === 'true') query.isActive = true

    const [reels, total] = await Promise.all([
      Reel.find(query)
        .populate('taggedProducts', 'name price images category')
        .populate('user', 'username profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Reel.countDocuments(query)
    ])

    res.json({
      success: true,
      data: reels,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    })
  } catch (error) {
    logger.error('Error fetching reels:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}

// @desc    Get single reel
// @route   GET /api/reels/:id
// @access  Public
export const getReelById = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)
      .populate('taggedProducts', 'name price images category description')
      .populate('user', 'username profileImage')

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel topilmadi' })
    }

    // Increment views
    reel.views += 1
    await reel.save()

    res.json({ success: true, data: reel })
  } catch (error) {
    logger.error('Error fetching reel:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}

// @desc    Create a reel
// @route   POST /api/reels
// @access  Admin
export const createReel = async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, duration, category, taggedProducts } = req.body

    if (!title || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Title va video URL kiritilishi shart'
      })
    }

    const videoType = detectVideoType(videoUrl)
    const embedUrl = getEmbedUrl(videoUrl)

    const reel = new Reel({
      title,
      description,
      videoUrl,
      videoType,
      thumbnailUrl,
      duration,
      category,
      taggedProducts: taggedProducts || [],
      user: req.user?._id || null
    })

    const createdReel = await reel.save()
    await createdReel.populate('taggedProducts', 'name price images category')

    logger.info(`Reel created: ${createdReel._id}`)

    res.status(201).json({ success: true, data: createdReel })
  } catch (error) {
    logger.error('Error creating reel:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Update a reel
// @route   PUT /api/reels/:id
// @access  Admin
export const updateReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel topilmadi' })
    }

    const { title, description, videoUrl, thumbnailUrl, duration, category, taggedProducts, isActive } = req.body

    if (title) reel.title = title
    if (description !== undefined) reel.description = description
    if (videoUrl) {
      reel.videoUrl = videoUrl
      reel.videoType = detectVideoType(videoUrl)
    }
    if (thumbnailUrl) reel.thumbnailUrl = thumbnailUrl
    if (duration !== undefined) reel.duration = duration
    if (category) reel.category = category
    if (taggedProducts !== undefined) reel.taggedProducts = taggedProducts
    if (isActive !== undefined) reel.isActive = isActive

    const updatedReel = await reel.save()
    await updatedReel.populate('taggedProducts', 'name price images category')

    logger.info(`Reel updated: ${reel._id}`)

    res.json({ success: true, data: updatedReel })
  } catch (error) {
    logger.error('Error updating reel:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Delete a reel
// @route   DELETE /api/reels/:id
// @access  Admin
export const deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel topilmadi' })
    }

    // Delete all comments for this reel
    await ReelComment.deleteMany({ reel: req.params.id })

    await Reel.findByIdAndDelete(req.params.id)

    logger.info(`Reel deleted: ${req.params.id}`)

    res.json({ success: true, message: 'Reel o\'chirildi' })
  } catch (error) {
    logger.error('Error deleting reel:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Like/unlike a reel
// @route   POST /api/reels/:id/like
// @access  Private
export const likeReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel topilmadi' })
    }

    const userId = req.user._id
    const likeIndex = reel.likes.indexOf(userId)

    if (likeIndex === -1) {
      // Like
      reel.likes.push(userId)
    } else {
      // Unlike
      reel.likes.splice(likeIndex, 1)
    }

    await reel.save()

    res.json({
      success: true,
      data: {
        liked: likeIndex === -1,
        likesCount: reel.likes.length
      }
    })
  } catch (error) {
    logger.error('Error liking reel:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}

// @desc    Share a reel
// @route   POST /api/reels/:id/share
// @access  Public
export const shareReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel topilmadi' })
    }

    reel.shares += 1
    await reel.save()

    res.json({
      success: true,
      data: {
        sharesCount: reel.shares,
        shareUrl: `${process.env.CLIENT_URL || 'https://luxx.uz'}/reels/${req.params.id}`
      }
    })
  } catch (error) {
    logger.error('Error sharing reel:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}

// @desc    Get reel comments
// @route   GET /api/reels/:id/comments
// @access  Public
export const getReelComments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [comments, total] = await Promise.all([
      ReelComment.find({ reel: req.params.id, parentComment: null })
        .populate('user', 'username profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ReelComment.countDocuments({ reel: req.params.id, parentComment: null })
    ])

    res.json({
      success: true,
      data: comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    })
  } catch (error) {
    logger.error('Error fetching reel comments:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}

// @desc    Add comment to reel
// @route   POST /api/reels/:id/comment
// @access  Private
export const addReelComment = async (req, res) => {
  try {
    const { text, parentComment } = req.body

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Izoh kiritilishi shart' })
    }

    const comment = new ReelComment({
      reel: req.params.id,
      user: req.user._id,
      text: text.trim(),
      parentComment: parentComment || null
    })

    await comment.save()
    await comment.populate('user', 'username profileImage')

    res.status(201).json({ success: true, data: comment })
  } catch (error) {
    logger.error('Error adding reel comment:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}

// @desc    Delete reel comment
// @route   DELETE /api/reels/comments/:commentId
// @access  Private
export const deleteReelComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const comment = await ReelComment.findById(commentId)

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Izoh topilmadi' })
    }

    // Only owner or admin can delete
    if (comment.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Ruxsat etilmagan' })
    }

    await ReelComment.findByIdAndDelete(commentId)
    res.json({ success: true, message: 'O\'chirildi' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}