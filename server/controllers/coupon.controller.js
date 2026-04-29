import Coupon from '../models/coupon.model.js';
import logger from '../utils/logger.js';

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Admin
export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).populate('user', 'username phone');
        res.json({ success: true, data: coupons });
    } catch (error) {
        logger.error('Get coupons error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get user's coupons
// @route   GET /api/coupons/my-coupons
// @access  Private
export const getMyCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ 
            $or: [
                { user: req.user._id },
                { user: null }
            ],
            isActive: true,
            isUsed: false,
            $or: [
                { expiryDate: { $gt: new Date() } },
                { expiryDate: null }
            ]
        });
        res.json({ success: true, data: coupons });
    } catch (error) {
        logger.error('Get my coupons error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Admin
export const createCoupon = async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        const createdCoupon = await coupon.save();
        res.status(201).json({ success: true, data: createdCoupon });
    } catch (error) {
        logger.error('Create coupon error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Validate a coupon
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
    try {
        const { code, totalAmount } = req.body;
        const coupon = await Coupon.findOne({ 
            code: code.toUpperCase(),
            isActive: true,
            isUsed: false
        });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Kupon topilmadi yoki u allaqachon ishlatilgan' });
        }

        if (coupon.user && coupon.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Bu kupon sizga tegishli emas' });
        }

        if (coupon.expiryDate && coupon.expiryDate < new Date()) {
            return res.status(400).json({ success: false, message: 'Kupon muddati tugagan' });
        }

        if (totalAmount < coupon.minPurchase) {
            return res.status(400).json({ 
                success: false, 
                message: `Kupondan foydalanish uchun minimal buyurtma miqdori ${coupon.minPurchase.toLocaleString()} so'm bo'lishi kerak` 
            });
        }

        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (totalAmount * coupon.discountValue) / 100;
        } else {
            discount = coupon.discountValue;
        }

        res.json({ 
            success: true, 
            discount,
            couponId: coupon._id,
            code: coupon.code,
            type: coupon.discountType,
            value: coupon.discountValue
        });
    } catch (error) {
        logger.error('Validate coupon error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Admin
export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (coupon) {
            await coupon.deleteOne();
            res.json({ success: true, message: 'Kupon o\'chirildi' });
        } else {
            res.status(404).json({ success: false, message: 'Kupon topilmadi' });
        }
    } catch (error) {
        logger.error('Delete coupon error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
