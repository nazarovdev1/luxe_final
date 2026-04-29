import Lookbook from '../models/lookbook.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import logger from '../utils/logger.js';

// @desc    Create new lookbook
// @route   POST /api/lookbooks
// @access  Private
export const createLookbook = async (req, res) => {
    try {
        const { name, items } = req.body;

        if (!name || !items || !Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                message: 'Iltimos, lookbook nomi va elementlarini kiriting'
            });
        }

        const lookbook = await Lookbook.create({
            user: req.user._id,
            name,
            items
        });

        res.status(201).json({
            success: true,
            data: lookbook
        });
    } catch (error) {
        logger.error('Create Lookbook Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lookbookni saqlashda xatolik yuz berdi'
        });
    }
};

// @desc    Get user lookbooks
// @route   GET /api/lookbooks
// @access  Private
export const getUserLookbooks = async (req, res) => {
    try {
        const lookbooks = await Lookbook.find({ user: req.user._id })
            .populate('items.product')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: lookbooks
        });
    } catch (error) {
        logger.error('Get User Lookbooks Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lookbooklarni olishda xatolik yuz berdi'
        });
    }
};

// @desc    Get purchased wardrobe items
// @route   GET /api/lookbooks/wardrobe
// @access  Private
export const getPurchasedWardrobe = async (req, res) => {
    try {
        // Find all delivered orders for the user
        const orders = await Order.find({
            user: req.user._id,
            status: 'Yetkazildi'
        }).populate('items.product');

        // Extract unique products
        const productMap = new Map();
        
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.product && !productMap.has(item.product._id.toString())) {
                    productMap.set(item.product._id.toString(), item.product);
                }
            });
        });

        const wardrobeItems = Array.from(productMap.values());

        res.status(200).json({
            success: true,
            data: wardrobeItems
        });
    } catch (error) {
        logger.error('Get Purchased Wardrobe Error:', error);
        res.status(500).json({
            success: false,
            message: 'Sotib olingan kiyimlarni olishda xatolik yuz berdi'
        });
    }
};
