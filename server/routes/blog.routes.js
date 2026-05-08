import express from 'express'
import {
  getAllBlogs,
  getBlogBySlug,
  getCategories,
  getAdminBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleFeatured
} from '../controllers/blog.controller.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes — specific paths before dynamic :slug
router.get('/categories', getCategories)
router.get('/', getAllBlogs)

// Admin routes (protected) — must be before /:slug to avoid "admin" matching as slug
router.get('/admin/all', protect, admin, getAdminBlogs)
router.get('/admin/:id', protect, admin, getBlogById)
router.post('/', protect, admin, createBlog)
router.put('/:id', protect, admin, updateBlog)
router.delete('/:id', protect, admin, deleteBlog)
router.patch('/:id/feature', protect, admin, toggleFeatured)

// Public dynamic route — must be last
router.get('/:slug', getBlogBySlug)

export default router
