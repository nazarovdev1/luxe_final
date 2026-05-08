import Blog from '../models/blog.model.js'
import { generateUniqueSlug, calculateReadTime, getBlogCategories, getRelatedBlogs } from '../services/blog.service.js'
import { blogCreateSchema, blogUpdateSchema } from '../validations/blog.validation.js'
import logger from '../utils/logger.js'

// @desc    Get all published blogs (public)
// @route   GET /api/blogs
// @access  Public
export const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 9
    const skip = (page - 1) * limit
    const category = req.query.category
    const search = req.query.search
    const featured = req.query.featured

    // Build filter
    const filter = { status: 'published' }
    if (category && category !== 'Barchasi') {
      filter.category = category
    }
    if (featured === 'true') {
      filter.featured = true
    }
    if (search) {
      filter.$text = { $search: search }
    }

    const blogs = await Blog.find(filter)
      .select('title slug excerpt coverImage category tags author readTime viewCount featured publishedAt createdAt')
      .populate('author', 'username profileImage')
      .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Blog.countDocuments(filter)

    res.json({
      success: true,
      data: blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    logger.error('Get all blogs error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get blog by slug (public, increments view count)
// @route   GET /api/blogs/:slug
// @access  Public
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('author', 'username profileImage')

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Maqola topilmadi' })
    }

    // Get related blogs
    const related = await getRelatedBlogs(blog._id, 3)

    res.json({
      success: true,
      data: blog,
      related
    })
  } catch (error) {
    logger.error('Get blog by slug error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get blog categories (public)
// @route   GET /api/blogs/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await getBlogCategories()
    res.json({ success: true, data: categories })
  } catch (error) {
    logger.error('Get blog categories error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get all blogs for admin (including drafts)
// @route   GET /api/blogs/admin/all
// @access  Admin
export const getAdminBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const status = req.query.status
    const category = req.query.category
    const search = req.query.search

    const filter = {}
    if (status) filter.status = status
    if (category) filter.category = category
    if (search) {
      filter.$text = { $search: search }
    }

    const blogs = await Blog.find(filter)
      .select('title slug excerpt coverImage category status featured viewCount readTime publishedAt createdAt')
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Blog.countDocuments(filter)

    res.json({
      success: true,
      data: blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    logger.error('Get admin blogs error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get blog by ID (admin)
// @route   GET /api/blogs/admin/:id
// @access  Admin
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'username profileImage')

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Maqola topilmadi' })
    }

    res.json({ success: true, data: blog })
  } catch (error) {
    logger.error('Get blog by ID error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Admin
export const createBlog = async (req, res) => {
  try {
    // Validate input
    const { error, value } = blogCreateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message })
    }

    const { title, excerpt, content, coverImage, images, category, tags, status, featured, seoTitle, seoDescription } = value

    // Generate slug from the Uzbek title (primary language)
    const slug = await generateUniqueSlug(title?.uz || title?.en || title?.ru || 'blog-post')

    // Calculate read time from all language content
    const allContent = [content?.uz, content?.ru, content?.en].filter(Boolean).join(' ')
    const readTime = calculateReadTime(allContent)

    const blog = new Blog({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      images,
      category,
      tags: tags || [],
      author: req.user?._id,
      status: status || 'draft',
      featured: featured || false,
      readTime,
      publishedAt: status === 'published' ? new Date() : null,
      seoTitle,
      seoDescription
    })

    const createdBlog = await blog.save()
    await createdBlog.populate('author', 'username profileImage')

    logger.info(`Blog created: ${slug} by user ${req.user?._id}`)
    res.status(201).json({ success: true, data: createdBlog })
  } catch (error) {
    logger.error('Create blog error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Update a blog post
// @route   PUT /api/blogs/:id
// @access  Admin
export const updateBlog = async (req, res) => {
  try {
    // Validate input
    const { error, value } = blogUpdateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message })
    }

    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Maqola topilmadi' })
    }

    const { title, excerpt, content, coverImage, images, category, tags, status, featured, seoTitle, seoDescription } = value

    // Update slug if title changed
    if (title?.uz && title.uz !== blog.title.uz) {
      blog.slug = await generateUniqueSlug(title.uz, blog._id)
    }

    // Recalculate read time if content changed
    if (content) {
      const allContent = [content.uz || blog.content.uz, content.ru || blog.content.ru, content.en || blog.content.en].filter(Boolean).join(' ')
      blog.readTime = calculateReadTime(allContent)
    }

    // Set publishedAt when publishing for the first time
    if (status === 'published' && blog.status !== 'published') {
      blog.publishedAt = new Date()
    }

    // Update fields
    if (title) blog.title = { ...blog.title, ...title }
    if (excerpt) blog.excerpt = { ...blog.excerpt, ...excerpt }
    if (content) blog.content = { ...blog.content, ...content }
    if (coverImage !== undefined) blog.coverImage = coverImage
    if (images) blog.images = images
    if (category) blog.category = category
    if (tags) blog.tags = tags
    if (status) blog.status = status
    if (featured !== undefined) blog.featured = featured
    if (seoTitle !== undefined) blog.seoTitle = seoTitle
    if (seoDescription !== undefined) blog.seoDescription = seoDescription

    const updatedBlog = await blog.save()
    await updatedBlog.populate('author', 'username profileImage')

    logger.info(`Blog updated: ${blog.slug} by user ${req.user?._id}`)
    res.json({ success: true, data: updatedBlog })
  } catch (error) {
    logger.error('Update blog error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Admin
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Maqola topilmadi' })
    }

    await blog.deleteOne()
    logger.info(`Blog deleted: ${blog.slug} by user ${req.user?._id}`)
    res.json({ success: true, message: 'Maqola muvaffaqiyatli o\'chirildi' })
  } catch (error) {
    logger.error('Delete blog error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Toggle featured status
// @route   PATCH /api/blogs/:id/feature
// @access  Admin
export const toggleFeatured = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Maqola topilmadi' })
    }

    blog.featured = !blog.featured
    await blog.save()

    logger.info(`Blog featured toggled: ${blog.slug} -> ${blog.featured} by user ${req.user?._id}`)
    res.json({ success: true, data: blog })
  } catch (error) {
    logger.error('Toggle featured error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
