import Order from '../models/order.model.js'

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
