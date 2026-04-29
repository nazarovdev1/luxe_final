import mongoose from 'mongoose';

const lookbookItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    x: {
        type: Number,
        default: 0
    },
    y: {
        type: Number,
        default: 0
    },
    scale: {
        type: Number,
        default: 1
    },
    rotation: {
        type: Number,
        default: 0
    },
    zIndex: {
        type: Number,
        default: 1
    }
});

const lookbookSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    items: [lookbookItemSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('Lookbook', lookbookSchema);
