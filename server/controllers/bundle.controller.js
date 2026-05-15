import Bundle from '../models/bundle.model.js';
import Product from '../models/product.model.js';

const calculatePricesFromProducts = async (productIds, discountType, discountValue) => {
    const products = await Product.find({ _id: { $in: productIds } });
    const originalPrice = products.reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : 0), 0);

    let discountedPrice = originalPrice;
    if (discountType === 'percentage' && discountValue > 0) {
        discountedPrice = Math.max(0, originalPrice - (originalPrice * discountValue / 100));
    } else if (discountType === 'fixed' && discountValue > 0) {
        discountedPrice = Math.max(0, originalPrice - discountValue);
    }

    return { originalPrice, discountedPrice, discountAmount: originalPrice - discountedPrice };
};

// Helper: extract a guaranteed string image URL from a field that could be a string or char-indexed object
const ensureStringImage = (img) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    
    if (typeof img === 'object') {
        const keys = Object.keys(img).filter(k => !isNaN(k)).sort((a, b) => Number(a) - Number(b));
        if (keys.length > 4) {
            const reconstructed = keys.map(k => img[k]).join('');
            if (reconstructed.startsWith('http')) return reconstructed;
        }
    }
    return '';
};

// Helper: extract a guaranteed string image URL from a product document
const extractProductImage = (product) => {
    if (!product) return '';

    if (Array.isArray(product.images) && product.images.length > 0) {
        const first = product.images[0];
        if (first && typeof first === 'object' && typeof first.url === 'string' && first.url) {
            return first.url;
        }
        const strFromFirst = ensureStringImage(first);
        if (strFromFirst) return strFromFirst;
    }

    return ensureStringImage(product.image);
};

// Helper: transform a populated product into a clean plain object
const transformProduct = (p) => {
    const plain = p.toObject ? p.toObject() : { ...p };
    return {
        ...plain,
        id: plain._id?.toString() || plain.id,
        image: extractProductImage(plain),
        price: Number(plain.price) || 0,
    };
};

export const getAllBundles = async (req, res) => {
    try {
        const bundles = await Bundle.find().populate('products').sort({ createdAt: -1 });

        const transformed = bundles.map(bundle => {
            const b = bundle.toObject ? bundle.toObject() : { ...bundle };
            return {
                ...b,
                heroImage: ensureStringImage(b.heroImage),
                products: (b.products || []).map(transformProduct)
            };
        });

        res.json({ success: true, data: transformed });
    } catch (error) {
        console.error('Get bundles error:', error);
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

export const getBundleById = async (req, res) => {
    try {
        const { id } = req.params;
        let bundle;
        
        // Check if ID is a valid ObjectId
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            bundle = await Bundle.findById(id).populate('products');
        } else {
            // Try to find by title/slug (case-insensitive)
            const titleRegex = new RegExp(`^${id.replace(/-/g, ' ')}$`, 'i');
            bundle = await Bundle.findOne({ title: titleRegex }).populate('products');
        }

        if (!bundle) return res.status(404).json({ success: false, message: 'Toplam topilmadi' });

        const b = bundle.toObject ? bundle.toObject() : { ...bundle };
        const transformed = {
            ...b,
            heroImage: ensureStringImage(b.heroImage),
            products: (b.products || []).map(transformProduct)
        };

        res.json({ success: true, data: transformed });
    } catch (error) {
        console.error('Get bundle error:', error);
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

export const createBundle = async (req, res) => {
    try {
        const { title, description, heroImage, products, discountType, discountValue, isActive } = req.body;

        if (!title || !products || products.length === 0) {
            return res.status(400).json({ success: false, message: 'Nom va mahsulotlar majburiy' });
        }

        const prices = await calculatePricesFromProducts(products, discountType || 'percentage', discountValue || 0);

        const bundle = await Bundle.create({
            title,
            description: description || '',
            heroImage: heroImage || '',
            products,
            discountType: discountType || 'percentage',
            discountValue: discountValue || 0,
            originalPrice: prices.originalPrice,
            discountedPrice: prices.discountedPrice,
            isActive: isActive !== undefined ? isActive : true
        });

        const populated = await Bundle.findById(bundle._id).populate('products');
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        console.error('Create bundle error:', error);
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

export const updateBundle = async (req, res) => {
    try {
        const { title, description, heroImage, products, discountType, discountValue, isActive } = req.body;
        const bundle = await Bundle.findById(req.params.id);
        if (!bundle) return res.status(404).json({ success: false, message: 'Toplam topilmadi' });

        if (title !== undefined) bundle.title = title;
        if (description !== undefined) bundle.description = description;
        if (heroImage !== undefined) bundle.heroImage = heroImage;
        if (products !== undefined) bundle.products = products;
        if (discountType !== undefined) bundle.discountType = discountType;
        if (discountValue !== undefined) bundle.discountValue = discountValue;
        if (isActive !== undefined) bundle.isActive = isActive;

        const prices = await calculatePricesFromProducts(bundle.products, bundle.discountType, bundle.discountValue);
        bundle.originalPrice = prices.originalPrice;
        bundle.discountedPrice = prices.discountedPrice;

        await bundle.save();
        const populated = await Bundle.findById(bundle._id).populate('products');
        res.json({ success: true, data: populated });
    } catch (error) {
        console.error('Update bundle error:', error);
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};

export const deleteBundle = async (req, res) => {
    try {
        const bundle = await Bundle.findByIdAndDelete(req.params.id);
        if (!bundle) return res.status(404).json({ success: false, message: 'Toplam topilmadi' });
        res.json({ success: true, message: "Toplam o'chirildi" });
    } catch (error) {
        console.error('Delete bundle error:', error);
        res.status(500).json({ success: false, message: 'Server xatosi' });
    }
};
