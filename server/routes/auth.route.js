import express from 'express'
import { registerUser, loginUser, getAllUsers, updateCart, getFavorites, addFavorite, removeFavorite, saveFcmToken, getProfile } from '../controllers/auth.controller.js'
import { requestPasswordReset, verifyResetCode, resetPassword } from '../controllers/passwordReset.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'

const router = express.Router()

router.post('/register', validate('register'), registerUser)
router.post('/login', validate('login'), loginUser)
router.put('/cart', protect, updateCart)
router.get('/profile', protect, getProfile)

router.post('/password/reset', validate('passwordReset'), requestPasswordReset)
router.post('/password/verify', verifyResetCode)
router.post('/password/new', validate('newPassword'), resetPassword)

router.get('/users', protect, authorize('admin'), getAllUsers)

router.get('/favorites', protect, getFavorites)
router.post('/favorites/:productId', protect, addFavorite)
router.delete('/favorites/:productId', protect, removeFavorite)

router.post('/fcm-token', protect, saveFcmToken)

export default router