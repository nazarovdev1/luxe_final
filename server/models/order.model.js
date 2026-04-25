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
        quantity: Number,
        price: Number,
        selectedColor: String,
        selectedSize: String
    }],
    totals: {
        subtotal: Number,
        deliveryFee: Number,
        promoCode: { type: String, default: null },
        discountAmount: { type: Number, default: 0 },
        total: Number
    },
    status: {
        type: String,
        enum: ['Kutilmoqda', 'Jarayonda', 'Yetkazilmoqda', 'Yetkazildi', 'Bekor qilindi'],
        default: 'Kutilmoqda'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'click', 'payme'],
        default: 'cash'
    }
}, {
    timestamps: true
})

const Order = mongoose.model('Order', orderSchema)

export default Order
