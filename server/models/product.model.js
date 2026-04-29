import mongoose from 'mongoose'

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
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        enum: {
            values: ['Premium', 'Luxury', 'Corporate', 'Limited'],
            message: 'Please select correct category'
        }
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
    ratings: {
        type: Number,
        default: 0
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

productSchema.index({ name: 'text', description: 'text', category: 1 })
productSchema.index({ colorVector: 1 })

const Product = mongoose.model('Product', productSchema)
export default Product