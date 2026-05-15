import mongoose from 'mongoose';

const lookItemSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        default: 1
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
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
    // Discount fields
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
    // Status & visibility
    isActive: {
        type: Boolean,
        default: true
    },
    // URL-friendly slug
    slug: {
        type: String,
        unique: true,
        sparse: true
    },
    // Auto-calculated prices
    originalPrice: {
        type: Number,
        default: 0
    },
    discountedPrice: {
        type: Number,
        default: 0
    },
    // Tags for filtering
    tags: [{
        type: String,
        trim: true
    }],
    // Discount expiration
    expiresAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-generate slug from title before saving
lookSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    next();
});

// Instance method: calculate prices from products
lookSchema.methods.calculatePrices = async function() {
    await this.populate('products');
    const productPrices = this.products.map(p => {
        const price = typeof p.price === 'number' ? p.price : 0;
        return price;
    });
    this.originalPrice = productPrices.reduce((sum, price) => sum + price, 0);

    if (this.discountType === 'percentage') {
        const discountAmount = this.originalPrice * (this.discountValue / 100);
        this.discountedPrice = Math.max(0, this.originalPrice - discountAmount);
    } else {
        // fixed discount
        this.discountedPrice = Math.max(0, this.originalPrice - this.discountValue);
    }
    return {
        originalPrice: this.originalPrice,
        discountedPrice: this.discountedPrice,
        discountAmount: this.originalPrice - this.discountedPrice
    };
};

// Virtual: check if discount is expired
lookSchema.virtual('isExpired').get(function() {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

// Virtual: check if discount is currently active
lookSchema.virtual('hasActiveDiscount').get(function() {
    if (!this.isActive) return false;
    if (this.discountValue <= 0) return false;
    if (this.isExpired) return false;
    return true;
});

// Ensure virtuals are included in JSON output
lookSchema.set('toJSON', { virtuals: true });
lookSchema.set('toObject', { virtuals: true });

export default mongoose.model('Look', lookSchema);
