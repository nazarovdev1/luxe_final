import mongoose from 'mongoose';

const giftCardSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    purchasedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    designId: {
        type: String,
        default: 'classic'
    },
    status: {
        type: String,
        enum: ['Active', 'Used', 'Expired', 'Sent'],
        default: 'Active'
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    usedAt: {
        type: Date,
        default: null
    },
    recipientName: {
        type: String,
        default: ''
    },
    recipientPhone: {
        type: String,
        default: ''
    },
    senderName: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const GiftCard = mongoose.model('GiftCard', giftCardSchema);

export default GiftCard;