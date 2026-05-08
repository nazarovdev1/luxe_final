import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import logger from '../utils/logger.js'
import pointsService from '../services/points.service.js'
import { verifyTelegramAuth } from '../utils/telegramAuth.js'
import crypto from 'crypto'

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

export const registerUser = async (req, res) => {
  try {
    const { username, phone, password } = req.body

    const userExists = await User.findOne({ phone })

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan'
      })
    }

    const usernameExists = await User.findOne({ username })

    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Bu foydalanuvchi nomi band'
      })
    }

    const user = await User.create({
      username,
      phone,
      password
    })

    if (user) {
      logger.info(`New user registered: ${user._id}`)
      
      // Award signup bonus: 30 points
      await pointsService.addPoints(user._id, 30, {
        source: 'admin',
        description: 'Ro\'yxatdan o\'tganingiz uchun tabrik bonus ballari!'
      }).catch(err => logger.error('Signup points error:', err))

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          phone: user.phone,
          role: user.role,
          isAdmin: user.isAdmin || user.role === 'admin' || user.role === 'manager',
          cart: user.cart,
          token: generateToken(user._id)
        }
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Foydalanuvchi ma\'lumotlari noto\'g\'ri'
      })
    }
  } catch (error) {
    logger.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body

    const user = await User.findOne({
      $or: [{ phone: identifier }, { username: identifier }]
    })

    if (user && (await user.matchPassword(password))) {
      logger.info(`User login: ${user._id}`)
      res.json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          phone: user.phone,
          role: user.role,
          isAdmin: user.isAdmin || user.role === 'admin' || user.role === 'manager',
          cart: user.cart,
          token: generateToken(user._id)
        }
      })
    } else {
      res.status(401).json({
        success: false,
        message: 'Login yoki parol noto\'g\'ri'
      })
    }
  } catch (error) {
    logger.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const telegramLogin = async (req, res) => {
  try {
    const authData = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      logger.error('TELEGRAM_BOT_TOKEN is not defined');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    // 1. Verify hash
    const isAuthentic = verifyTelegramAuth(authData, botToken);
    if (!isAuthentic) {
      return res.status(401).json({ success: false, message: 'Telegram authentication failed' });
    }

    // 2. Check for recent auth (within 24h)
    const authDate = parseInt(authData.auth_date);
    if (Math.floor(Date.now() / 1000) - authDate > 86400) {
      return res.status(401).json({ success: false, message: 'Authentication expired' });
    }

    // 3. Find or create user
    let user = await User.findOne({ telegramId: authData.id.toString() });

    if (!user) {
      const baseUsername = authData.username || `user_${authData.id}`;
      let finalUsername = baseUsername;
      
      // Ensure unique username
      let usernameExists = await User.findOne({ username: finalUsername });
      let counter = 1;
      while (usernameExists) {
        finalUsername = `${baseUsername}_${counter}`;
        usernameExists = await User.findOne({ username: finalUsername });
        counter++;
      }

      user = await User.create({
        username: finalUsername,
        telegramId: authData.id.toString(),
        telegramUsername: authData.username || null,
        photoUrl: authData.photo_url || null,
        phone: `tg_${authData.id}`, // Placeholder
        password: crypto.randomBytes(16).toString('hex')
      });

      // Bonus points
      await pointsService.addPoints(user._id, 30, {
        source: 'admin',
        description: 'Telegram orqali ro\'yxatdan o\'tganingiz uchun bonus!'
      }).catch(err => logger.error('TG Signup points error:', err));
      
      logger.info(`New user via Telegram: ${user._id}`);
    } else {
      // Update info
      user.telegramUsername = authData.username || user.telegramUsername;
      user.photoUrl = authData.photo_url || user.photoUrl;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        role: user.role,
        isAdmin: user.isAdmin || user.role === 'admin' || user.role === 'manager',
        cart: user.cart,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    logger.error('Telegram login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (user) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          phone: user.phone,
          role: user.role,
          isAdmin: user.isAdmin || user.role === 'admin' || user.role === 'manager',
          cart: user.cart,
          savedProducts: user.savedProducts
        }
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      })
    }
  } catch (error) {
    logger.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const updateCart = async (req, res) => {
  try {
    const { cart } = req.body

    const user = await User.findById(req.user._id)

    if (user) {
      user.cart = cart
      const updatedUser = await user.save()

      logger.info(`Cart updated for user ${user._id}`)

      res.json({
        success: true,
        data: updatedUser.cart
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      })
    }
  } catch (error) {
    logger.error('Update cart error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [users, total] = await Promise.all([
      User.find({}).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments()
    ])

    logger.info(`Admin fetched ${users.length} users`)

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    })
  } catch (error) {
    logger.error('Get all users error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (user) {
      res.json({
        success: true,
        favorites: user.savedProducts || []
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      })
    }
  } catch (error) {
    logger.error('Get favorites error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const addFavorite = async (req, res) => {
  try {
    const { productId } = req.params
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      })
    }

    if (!user.savedProducts.includes(productId)) {
      user.savedProducts.push(productId)
      await user.save()
      logger.info(`Added to favorites: user ${user._id}, product ${productId}`)
    }

    res.json({
      success: true,
      favorites: user.savedProducts
    })
  } catch (error) {
    logger.error('Add favorite error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      })
    }

    user.savedProducts = user.savedProducts.filter(id => id !== productId)
    await user.save()

    logger.info(`Removed from favorites: user ${user._id}, product ${productId}`)

    res.json({
      success: true,
      favorites: user.savedProducts
    })
  } catch (error) {
    logger.error('Remove favorite error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const saveFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      })
    }

    user.fcmToken = fcmToken
    await user.save()

    res.json({
      success: true,
      message: 'FCM token saqlandi'
    })
  } catch (error) {
    logger.error('Save FCM token error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}