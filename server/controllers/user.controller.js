import Order from '../models/order.model.js'
import User from '../models/user.model.js'

// EN: Get orders by phone number
// UZ: Telefon raqam orqali buyurtmalarni olish
export const getOrdersByPhone = async (req, res) => {
    try {
        const { phone } = req.params

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Telefon raqam kiritilmadi'
            })
        }

        // Clean phone number format if needed (remove spaces, etc)
        // For now, we assume exact match or contains
        // Using regex to match phone number loosely
        const normalizedPhone = phone.replace(/\s+/g, '')

        // Security Check: Only Admin or Owner can see these orders
        if (!req.user.isAdmin && req.user.phone !== normalizedPhone) {
            return res.status(403).json({
                success: false,
                message: 'Ruxsat berilmadi. Faqat o\'z buyurtmalaringizni ko\'ra olasiz.'
            })
        }

        // Escape special regex characters like + ( ) [ ] etc
        const escapedPhone = normalizedPhone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

        const orders = await Order.find({
            'customer.phone': { $regex: escapedPhone, $options: 'i' }
        }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            data: orders
        })
    } catch (error) {
        console.error('Error fetching user orders:', error)
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        })
    }
}

// @desc    Follow a user
// @route   PUT /api/users/:id/follow
// @access  Private
export const followUser = async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ success: false, message: 'O\'zingizni kuzata olmaysiz' })
        }

        const userToFollow = await User.findById(req.params.id)
        const currentUser = await User.findById(req.user._id)

        if (!userToFollow) {
            return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' })
        }

        if (!userToFollow.followers.includes(req.user._id)) {
            await userToFollow.updateOne({ $push: { followers: req.user._id } })
            await currentUser.updateOne({ $push: { following: req.params.id } })
            res.json({ success: true, message: 'Foydalanuvchi kuzatilmoqda' })
        } else {
            res.status(400).json({ success: false, message: 'Siz bu foydalanuvchini allaqachon kuzatayapsiz' })
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @desc    Unfollow a user
// @route   PUT /api/users/:id/unfollow
// @access  Private
export const unfollowUser = async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ success: false, message: 'O\'zingizni kuzatishni bekor qila olmaysiz' })
        }

        const userToUnfollow = await User.findById(req.params.id)
        const currentUser = await User.findById(req.user._id)

        if (!userToUnfollow) {
            return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' })
        }

        if (userToUnfollow.followers.includes(req.user._id)) {
            await userToUnfollow.updateOne({ $pull: { followers: req.user._id } })
            await currentUser.updateOne({ $pull: { following: req.params.id } })
            res.json({ success: true, message: 'Kuzatish bekor qilindi' })
        } else {
            res.status(400).json({ success: false, message: 'Siz bu foydalanuvchini kuzatmayapsiz' })
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
