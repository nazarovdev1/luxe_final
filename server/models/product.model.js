import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema({
    sku: { type: String, trim: true },
    size: { type: String, trim: true, default: '' },
    color: { type: String, trim: true, default: '' },
    stock: { type: Number, min: 0, required: true, default: 0 },
    isActive: { type: Boolean, default: true }
}, { _id: true })

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please enter product description']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        maxlength: [10, 'Product price cannot exceed 10 characters'],
        default: 0.0
    },
    originalPrice: {
        type: Number,
        default: null,
        min: [0, 'Original price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        trim: true
    },
    images: [{
        url: {
            type: String,
            required: true
        }
    }],
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        default: 1
    },
    rating: {
        type: Number,
        default: 0
    },
    badge: {
        type: String,
        enum: ['NEW', 'BESTSELLER', 'SALE', 'LIMITED', ''],
        default: ''
    },
    colors: [{
        type: String,
        trim: true
    }],
    sizes: [{
        type: String,
        trim: true
    }],
    variants: { type: [variantSchema], default: [] },
    measurements: {
        unit: { type: String, enum: ['cm', 'in'], default: 'cm' },
        bust: Number,
        waist: Number,
        hips: Number,
        length: Number,
        sleeve: Number
    },
    garmentMeasurements: {
        unit: { type: String, enum: ['cm', 'in'], default: 'cm' },
        bust: Number,
        waist: Number,
        hips: Number,
        length: Number,
        sleeve: Number
    },
    sizeGuide: [{
        size: { type: String, trim: true },
        bust: Number,
        waist: Number,
        hips: Number,
        length: Number
    }],
    modelInfo: {
        height: Number,
        bust: Number,
        waist: Number,
        hips: Number,
        wearingSize: { type: String, trim: true, default: '' }
    },
    fit: {
        type: { type: String, enum: ['small', 'true-to-size', 'large'], default: 'true-to-size' },
        note: { type: String, trim: true, maxlength: 500, default: '' }
    },
    fitType: {
        type: String,
        enum: ['small', 'true-to-size', 'large'],
        default: 'true-to-size'
    },
    sizeConversions: {
        US: { type: String, default: '' },
        EU: { type: String, default: '' },
        UK: { type: String, default: '' },
        RU: { type: String, default: '' }
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false
    },
    colorPalette: [{
        r: Number,
        g: Number,
        b: Number,
        hex: String,
        name: String,
        percentage: Number
    }],
    colorVector: [Number],
    structureVector: [Number],
    // Phase 8: Sustainability Fields
    ecoScore: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
    materials: [{
        type: String // e.g. "Organic Cotton", "Recycled Polyester"
    }],
    carbonFootprint: {
        type: Number // in kg CO2
    },
    // VIP & Early Access Fields
    earlyAccessTier: {
        type: String,
        enum: ['none', 'Gold', 'Diamond'],
        default: 'none'
    },
    earlyAccessUntil: {
        type: Date,
        default: null
    },
    isNewCollection: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

productSchema.pre('save', function (next) {
    if (this.measurements && (!this.garmentMeasurements || !this.garmentMeasurements.bust)) {
        this.garmentMeasurements = this.measurements;
    }
    if (this.fit && this.fit.type && !this.fitType) {
        this.fitType = this.fit.type;
    }
    next();
})

productSchema.virtual('ratings')
    .get(function () {
        return this.rating
    })
    .set(function (value) {
        this.rating = value
    })

productSchema.index({ name: 'text', description: 'text', category: 1 })
productSchema.index({ category: 1, createdAt: -1 })
productSchema.index({ badge: 1, createdAt: -1 })
productSchema.index({ earlyAccessUntil: 1, createdAt: -1 })
productSchema.index({ price: 1 })
productSchema.index({ rating: -1 })
productSchema.index({ colorVector: 1 })
productSchema.index({ 'variants.sku': 1 }, { sparse: true })

const Product = mongoose.model('Product', productSchema)
export default Product
