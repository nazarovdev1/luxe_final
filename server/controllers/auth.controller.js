import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'

// Generate JWT
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
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
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body

        // Find user by phone OR username
        const user = await User.findOne({
            $or: [{ phone: identifier }, { username: identifier }]
        })

        if (user && (await user.matchPassword(password))) {
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
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
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
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @desc    Update user cart
// @route   PUT /api/auth/cart
// @access  Private
export const updateCart = async (req, res) => {
    try {
        const { cart } = req.body
        console.log('🛒 Update Cart Request Body:', req.body);
        console.log('👤 User ID:', req.user._id);

        const user = await User.findById(req.user._id)

        if (user) {
            user.cart = cart
            const updatedUser = await user.save()

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
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 })

        res.json({
            success: true,
            data: users
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @desc    Get user favorites
// @route   GET /api/auth/favorites
// @access  Private
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
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @desc    Add product to favorites
// @route   POST /api/auth/favorites/:productId
// @access  Private
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

        // Check if already in favorites
        if (!user.savedProducts.includes(productId)) {
            user.savedProducts.push(productId)
            await user.save()
        }

        res.json({
            success: true,
            favorites: user.savedProducts
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @desc    Remove product from favorites
// @route   DELETE /api/auth/favorites/:productId
// @access  Private
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

        res.json({
            success: true,
            favorites: user.savedProducts
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @desc    Save FCM token for push notifications
// @route   POST /api/auth/fcm-token
// @access  Private
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
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
