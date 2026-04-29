import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import logger from '../utils/logger.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
export const getAdminStats = async (req, res) => {
    try {
        const totalSales = await Order.aggregate([
            { $match: { status: { $ne: 'Bekor qilindi' } } },
            { $group: { _id: null, total: { $sum: '$totals.total' } } }
        ]);

        const ordersCount = await Order.countDocuments();
        const usersCount = await User.countDocuments();
        const productsCount = await Product.countDocuments();

        // Recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'username');

        // Sales by month (simplified)
        const salesByMonth = await Order.aggregate([
            { $match: { status: { $ne: 'Bekor qilindi' } } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    total: { $sum: '$totals.total' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalRevenue: totalSales[0]?.total || 0,
                ordersCount,
                usersCount,
                productsCount,
                recentOrders,
                salesByMonth
            }
        });
    } catch (error) {
        logger.error('Admin stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
