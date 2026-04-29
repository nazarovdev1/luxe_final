import Post from '../models/post.model.js'
import User from '../models/user.model.js'
import pointsService from '../services/points.service.js'
import logger from '../utils/logger.js'

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { images, caption, taggedProducts } = req.body

    if (!images || images.length === 0) {
      return res.status(400).json({ success: false, message: 'Iltimos rasm yuklang' })
    }

    const post = new Post({
      user: req.user._id,
      images,
      caption,
      taggedProducts
    })

    const createdPost = await post.save()

    // Award +30 points for creating a post (max 1 per day logic can be added later)
    try {
      await pointsService.addPoints(req.user._id, 30, {
        source: 'challenge',
        description: 'Style Feed post yaratildi',
        referenceId: createdPost._id,
        referenceModel: 'Post'
      })
    } catch (error) {
      logger.error('Error awarding points for post:', error)
    }

    res.status(201).json({ success: true, data: createdPost })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Get all posts (Feed)
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const posts = await Post.find({ isActive: true })
      .populate('user', 'username profileImage')
      .populate('taggedProducts', 'name price image images')
      .populate('commentCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Post.countDocuments({ isActive: true })

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Toggle Like on Post
// @route   PUT /api/posts/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post topilmadi' })
    }

    const isLiked = post.likes.includes(req.user._id)

    if (isLiked) {
      post.likes.pull(req.user._id)
    } else {
      post.likes.push(req.user._id)
    }

    await post.save()

    res.json({ success: true, isLiked: !isLiked, likesCount: post.likes.length })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post topilmadi' })
    }

    // Only owner or admin can delete
    if (post.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Ruxsat etilmagan' })
    }

    post.isActive = false
    await post.save()

    res.json({ success: true, message: 'Post o\'chirildi' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
