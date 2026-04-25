import mongoose from 'mongoose';

const lookItemSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        default: 1
    }
});

const lookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    heroImage: {
        type: String,
        required: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    items: [lookItemSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Look', lookSchema);
