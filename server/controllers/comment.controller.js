import Comment from '../models/comment.model.js'
import Post from '../models/post.model.js'

// @desc    Add comment to a post
// @route   POST /api/comments/:postId
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ success: false, message: 'Izoh bo\'sh bo\'lishi mumkin emas' })
    }

    const post = await Post.findById(req.params.postId)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post topilmadi' })
    }

    const comment = new Comment({
      post: req.params.postId,
      user: req.user._id,
      text
    })

    const createdComment = await comment.save()
    
    // Populate user info before returning
    await createdComment.populate('user', 'username profileImage')

    res.status(201).json({ success: true, data: createdComment })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
// @access  Public
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'username profileImage')
      .sort({ createdAt: 1 })

    res.json({ success: true, data: comments })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Izoh topilmadi' })
    }

    if (comment.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Ruxsat etilmagan' })
    }

    await comment.deleteOne()

    res.json({ success: true, message: 'Izoh o\'chirildi' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
