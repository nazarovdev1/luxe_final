import Post from '../models/post.model.js'
import User from '../models/user.model.js'
import pointsService from '../services/points.service.js'
import logger from '../utils/logger.js'
import mongoose from 'mongoose'

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { images, caption, taggedProducts } = req.body

    if (!images || images.length === 0) {
      return res.status(400).json({ success: false, message: 'Iltimos rasm yuklang' })
    }

    const validTaggedProducts = Array.isArray(taggedProducts)
      ? taggedProducts.filter((productId) => mongoose.Types.ObjectId.isValid(productId))
      : []

    const post = new Post({
      user: req.user._id,
      images,
      caption,
      taggedProducts: validTaggedProducts
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
    const query = { isActive: true }

    if (req.query.product) {
      if (!mongoose.Types.ObjectId.isValid(req.query.product)) {
        return res.json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, pages: 0 }
        })
      }
      query.taggedProducts = new mongoose.Types.ObjectId(req.query.product)
    }

    const posts = await Post.find(query)
      .populate('user', 'username profileImage photoUrl')
      .populate('taggedProducts', 'name price image images')
      .populate('commentCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Post.countDocuments(query)

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

    const isStaff = req.user?.role === 'admin' || req.user?.role === 'manager' || req.user?.isAdmin
    if (post.user.toString() !== req.user._id.toString() && !isStaff) {
      return res.status(403).json({ success: false, message: 'Ruxsat etilmagan' })
    }

    post.isActive = false
    await post.save()

    res.json({ success: true, message: 'Post o\'chirildi' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
