import mongoose from 'mongoose';

const bundleSchema = new mongoose.Schema({
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
        default: ''
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }],
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        default: 0,
        min: 0
    },
    originalPrice: {
        type: Number,
        default: 0
    },
    discountedPrice: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

bundleSchema.methods.calculatePrices = async function () {
    await this.populate('products');
    this.originalPrice = this.products.reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : 0), 0);

    if (this.discountType === 'percentage' && this.discountValue > 0) {
        this.discountedPrice = Math.max(0, this.originalPrice - (this.originalPrice * this.discountValue / 100));
    } else if (this.discountType === 'fixed' && this.discountValue > 0) {
        this.discountedPrice = Math.max(0, this.originalPrice - this.discountValue);
    } else {
        this.discountedPrice = this.originalPrice;
    }

    return {
        originalPrice: this.originalPrice,
        discountedPrice: this.discountedPrice,
        discountAmount: this.originalPrice - this.discountedPrice
    };
};

export default mongoose.model('Bundle', bundleSchema);
