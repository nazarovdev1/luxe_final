import Promo from '../models/promo.model.js';

// @desc    Create a new promo code
// @route   POST /api/promos
// @access  Private/Admin
export const createPromo = async (req, res) => {
    try {
        const { code, discountPercentage } = req.body;

        const promoExists = await Promo.findOne({ code: code.toUpperCase() });
        if (promoExists) {
            return res.status(400).json({ success: false, message: 'Bu promokod allaqachon mavjud' });
        }

        const promo = await Promo.create({
            code: code.toUpperCase(),
            discountPercentage
        });

        res.status(201).json({ success: true, data: promo });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all promo codes
// @route   GET /api/promos
// @access  Private/Admin
export const getPromos = async (req, res) => {
    try {
        const promos = await Promo.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: promos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update promo code status (activate/deactivate)
// @route   PUT /api/promos/:id/status
// @access  Private/Admin
export const updatePromoStatus = async (req, res) => {
    try {
        const promo = await Promo.findById(req.params.id);
        if (!promo) {
            return res.status(404).json({ success: false, message: 'Promokod topilmadi' });
        }

        promo.isActive = req.body.isActive;
        await promo.save();

        res.json({ success: true, data: promo });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a promo code
// @route   DELETE /api/promos/:id
// @access  Private/Admin
export const deletePromo = async (req, res) => {
    try {
        const promo = await Promo.findById(req.params.id);
        if (!promo) {
            return res.status(404).json({ success: false, message: 'Promokod topilmadi' });
        }

        await Promo.deleteOne({ _id: promo._id });
        res.json({ success: true, message: 'Promokod o\'chirildi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Validate a promo code
// @route   POST /api/promos/validate
// @access  Public
export const validatePromo = async (req, res) => {
    try {
        console.log('🏷️ Validate promo request received:', { code: req.body?.code, headers: req.headers?.authorization ? '***token present***' : 'no token' });
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: 'Promokodni kiriting' });
        }

        const promo = await Promo.findOne({ code: code.toUpperCase() });

        if (!promo) {
            return res.status(404).json({ success: false, message: 'Bunday promokod mavjud emas' });
        }

        if (!promo.isActive) {
            return res.status(400).json({ success: false, message: 'Bu promokod muddati tugagan yoki faol emas' });
        }

        res.json({
            success: true,
            discountPercentage: promo.discountPercentage,
            code: promo.code
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
