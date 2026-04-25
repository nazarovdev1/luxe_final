import express from 'express'
import { registerUser, loginUser, getAllUsers, updateCart, getFavorites, addFavorite, removeFavorite, saveFcmToken, getProfile } from '../controllers/auth.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.put('/cart', protect, updateCart)

router.get('/profile', protect, getProfile)

// EN: GET - Get all users (Admin only)
// UZ: Barcha foydalanuvchilarni olish (Admin uchun)
router.get('/users', protect, authorize('admin'), getAllUsers)

// Favorites / Saved Products
router.get('/favorites', protect, getFavorites)
router.post('/favorites/:productId', protect, addFavorite)
router.delete('/favorites/:productId', protect, removeFavorite)

// FCM Token for Push Notifications
router.post('/fcm-token', protect, saveFcmToken)

export default router

