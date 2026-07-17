import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        location: {
            lat: Number,
            lng: Number
        },
        comments: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        image: String,
        quantity: { type: Number, required: true },
        price: Number,
        selectedColor: String,
        selectedSize: String,
        variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
        // Look-related fields
        lookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Look', default: null },
        lookTitle: { type: String, default: null },
        lookDiscount: { type: Number, default: 0 }
    }],
    totals: {
        subtotal: Number,
        deliveryFee: Number,
        promoCode: { type: String, default: null },
        discountAmount: { type: Number, default: 0 },
        total: Number,
        giftWrap: {
            type: { type: String, enum: ['classic', 'premium', 'minimal'] },
            cost: { type: Number, default: 0 },
            message: { type: String, default: '' }
        }
    },
    // Look discount tracking
    lookDiscounts: [{
        lookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Look' },
        lookTitle: String,
        originalPrice: Number,
        discountAmount: Number
    }],
    totalLookDiscount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Kutilmoqda', 'Jarayonda', 'Yetkazilmoqda', 'Yetkazildi', 'Bekor qilindi'],
        default: 'Kutilmoqda'
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['Kutilmoqda', 'Jarayonda', 'Yetkazilmoqda', 'Yetkazildi', 'Bekor qilindi'],
            required: true
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    }],
    paymentMethod: {
        type: String,
        enum: ['cash_on_delivery'],
        default: 'cash_on_delivery'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    payment: {
        providerTransactionId: { type: String, default: null },
        paidAt: { type: Date, default: null },
        failureReason: { type: String, default: null }
    },
    scheduledDelivery: {
        date: Date,
        timeSlot: { type: String, enum: ['morning', 'afternoon', 'evening', 'late_evening', 'express'] },
        isExpress: { type: Boolean, default: false }
    },
    deliveredAt: { type: Date, default: null },
    idempotencyKey: { type: String, trim: true, default: null }
}, {
    timestamps: true
})

orderSchema.index({ 'customer.phone': 1 })
orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ status: 1 })
orderSchema.index({ createdAt: -1 })
orderSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true })

const Order = mongoose.model('Order', orderSchema)

export default Order
