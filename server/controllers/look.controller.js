import Look from '../models/look.model.js';
import Product from '../models/product.model.js';

// Helper: calculate prices from product IDs
const calculatePricesFromProducts = async (productIds, discountType, discountValue) => {
    const products = await Product.find({ _id: { $in: productIds } });
    const originalPrice = products.reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : 0), 0);

    let discountedPrice = originalPrice;
    if (discountType === 'percentage' && discountValue > 0) {
        const discountAmount = originalPrice * (discountValue / 100);
        discountedPrice = Math.max(0, originalPrice - discountAmount);
    } else if (discountType === 'fixed' && discountValue > 0) {
        discountedPrice = Math.max(0, originalPrice - discountValue);
    }

    return {
        originalPrice,
        discountedPrice,
        discountAmount: originalPrice - discountedPrice
    };
};

// Helper: check stock for look products
const checkStock = async (productIds) => {
    const products = await Product.find({ _id: { $in: productIds } });
    return products.map(p => ({
        _id: p._id,
        name: p.name,
        stock: p.stock ?? p.count ?? 0,
        outOfStock: (p.stock ?? p.count ?? 0) <= 0
    }));
};

// Get all active looks (public)
export const getAllLooks = async (req, res) => {
    try {
        const looks = await Look.find()
            .sort({ createdAt: -1 })
            .populate('products');

        // Transform looks to include image URL from images array
        const transformProducts = (products) =>
            products?.map((p) => ({
                ...p.toObject ? p.toObject() : p,
                image: p.image || p.images?.[0]?.url || '/placeholder.jpg'
            })) || [];

        // Add stock info and check expiration
        const looksWithMeta = looks.map(look => {
            const obj = look.toObject();
            obj.isExpired = look.isExpired;
            obj.hasActiveDiscount = look.hasActiveDiscount;

            // Check product stock
            if (obj.products && obj.products.length > 0) {
                obj.products = obj.products.map(p => ({
                    ...p,
                    image: p.image || p.images?.[0]?.url || '/placeholder.jpg',
                    outOfStock: (p.stock ?? p.count ?? 0) <= 0
                }));
            }

            return obj;
        });

        res.status(200).json({
            success: true,
            data: looksWithMeta
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get single look by ID (public)
export const getLookById = async (req, res) => {
    try {
        const look = await Look.findById(req.params.id).populate('products');

        if (!look) {
            return res.status(404).json({
                success: false,
                message: 'Look topilmadi'
            });
        }

        const obj = look.toObject();
        obj.isExpired = look.isExpired;
        obj.hasActiveDiscount = look.hasActiveDiscount;

        // Add stock info
        if (obj.products && obj.products.length > 0) {
            obj.products = obj.products.map(p => ({
                ...p,
                image: p.image || p.images?.[0]?.url || '/placeholder.jpg',
                outOfStock: (p.stock ?? p.count ?? 0) <= 0
            }));
        }

        res.status(200).json({
            success: true,
            data: obj
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Calculate look price (public)
export const calculateLookPrice = async (req, res) => {
    try {
        const look = await Look.findById(req.params.id).populate('products');

        if (!look) {
            return res.status(404).json({
                success: false,
                message: 'Look topilmadi'
            });
        }

        const prices = await calculatePricesFromProducts(
            look.products.map(p => p._id),
            look.discountType,
            look.discountValue
        );

        const stockInfo = await checkStock(look.products.map(p => p._id));

        res.status(200).json({
            success: true,
            data: {
                lookId: look._id,
                title: look.title,
                originalPrice: prices.originalPrice,
                discountedPrice: prices.discountedPrice,
                discountAmount: prices.discountAmount,
                discountType: look.discountType,
                discountValue: look.discountValue,
                isExpired: look.isExpired,
                hasActiveDiscount: look.hasActiveDiscount,
                stockInfo
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Create new look (admin)
export const createLook = async (req, res) => {
    try {
        const { title, description, heroImage, products, items, discountType, discountValue, tags, expiresAt, isActive } = req.body;

        const look = new Look({
            title,
            description,
            heroImage,
            products: products || [],
            items: items || [],
            discountType: discountType || 'percentage',
            discountValue: discountValue || 0,
            tags: tags || [],
            expiresAt: expiresAt || null,
            isActive: isActive !== undefined ? isActive : true
        });

        // Calculate prices from products
        if (products && products.length > 0) {
            const prices = await calculatePricesFromProducts(products, look.discountType, look.discountValue);
            look.originalPrice = prices.originalPrice;
            look.discountedPrice = prices.discountedPrice;
        }

        await look.save();
        await look.populate('products');

        // Transform products to include image URL for client
        if (look.products && look.products.length > 0) {
            look.products = look.products.map(p => ({
                ...(p.toObject ? p.toObject() : p),
                image: p.image || p.images?.[0]?.url || '/placeholder.jpg'
            }));
        }

        res.status(201).json({
            success: true,
            data: look
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid data',
            error: error.message
        });
    }
};

// Update look (admin)
export const updateLook = async (req, res) => {
    try {
        const { title, description, heroImage, products, items, discountType, discountValue, tags, expiresAt, isActive } = req.body;

        const look = await Look.findById(req.params.id);
        if (!look) {
            return res.status(404).json({
                success: false,
                message: 'Look topilmadi'
            });
        }

        // Update fields
        if (title !== undefined) look.title = title;
        if (description !== undefined) look.description = description;
        if (heroImage !== undefined) look.heroImage = heroImage;
        if (products !== undefined) look.products = products;
        if (items !== undefined) look.items = items;
        if (discountType !== undefined) look.discountType = discountType;
        if (discountValue !== undefined) look.discountValue = discountValue;
        if (tags !== undefined) look.tags = tags;
        if (expiresAt !== undefined) look.expiresAt = expiresAt;
        if (isActive !== undefined) look.isActive = isActive;

        // Recalculate prices
        const productIds = look.products.map(p => p._id || p);
        if (productIds.length > 0) {
            const prices = await calculatePricesFromProducts(productIds, look.discountType, look.discountValue);
            look.originalPrice = prices.originalPrice;
            look.discountedPrice = prices.discountedPrice;
        } else {
            look.originalPrice = 0;
            look.discountedPrice = 0;
        }

        await look.save();
        await look.populate('products');

        // Transform products to include image URL for client
        if (look.products && look.products.length > 0) {
            look.products = look.products.map(p => ({
                ...(p.toObject ? p.toObject() : p),
                image: p.image || p.images?.[0]?.url || '/placeholder.jpg'
            }));
        }

        res.status(200).json({
            success: true,
            data: look
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid data',
            error: error.message
        });
    }
};

// Delete look (admin)
export const deleteLook = async (req, res) => {
    try {
        const look = await Look.findByIdAndDelete(req.params.id);
        if (!look) {
            return res.status(404).json({
                success: false,
                message: 'Look topilmadi'
            });
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Toggle look active status (admin)
export const toggleLookActive = async (req, res) => {
    try {
        const look = await Look.findById(req.params.id);
        if (!look) {
            return res.status(404).json({
                success: false,
                message: 'Look topilmadi'
            });
        }

look.isActive = !look.isActive;
         await look.save();
         await look.populate('products');

         // Transform products to include image URL for client
         if (look.products && look.products.length > 0) {
             look.products = look.products.map(p => ({
                 ...(p.toObject ? p.toObject() : p),
                 image: p.image || p.images?.[0]?.url || '/placeholder.jpg'
             }));
         }

         res.status(200).json({
            success: true,
            data: look,
            message: look.isActive ? 'Look faollashtirildi' : 'Look nofaollashtirildi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Check stock for look products (public)
export const getLookStock = async (req, res) => {
    try {
        const look = await Look.findById(req.params.id);
        if (!look) {
            return res.status(404).json({
                success: false,
                message: 'Look topilmadi'
            });
        }

        const productIds = look.products.map(p => p._id || p);
        const stockInfo = await checkStock(productIds);

        res.status(200).json({
            success: true,
            data: stockInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export default {
    getAllLooks,
    getLookById,
    calculateLookPrice,
    createLook,
    updateLook,
    deleteLook,
    toggleLookActive,
    getLookStock
};
