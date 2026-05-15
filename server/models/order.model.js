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
        total: Number
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
        enum: ['cash', 'click', 'payme'],
        default: 'cash'
    }
}, {
    timestamps: true
})

orderSchema.index({ 'customer.phone': 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ createdAt: -1 })

const Order = mongoose.model('Order', orderSchema)

export default Order
