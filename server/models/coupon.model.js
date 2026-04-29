import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null means global
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    minPurchase: {
        type: Number,
        default: 0
    },
    expiryDate: {
        type: Date
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
