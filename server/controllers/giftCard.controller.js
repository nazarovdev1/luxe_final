import GiftCard from '../models/giftCard.model.js';
import User from '../models/user.model.js';
import logger from '../utils/logger.js';

// @desc    Create a gift card (after purchase)
// @route   POST /api/gift-cards
// @access  Public (can be called by anyone who purchased)
export const createGiftCard = async (req, res) => {
    try {
        const { code, amount, recipientName, recipientPhone, senderName, message, designId } = req.body;

        if (!code || !amount) {
            return res.status(400).json({ success: false, message: 'Kod va summa majburiy' });
        }

        if (amount < 50000) {
            return res.status(400).json({ success: false, message: 'Minimal summa 50,000 so\'m' });
        }

        const giftCardExists = await GiftCard.findOne({ code: code.toUpperCase() });
        if (giftCardExists) {
            return res.status(400).json({ success: false, message: 'Bu kod allaqachon yaratilgan' });
        }

        const giftCard = await GiftCard.create({
            code: code.toUpperCase(),
            amount,
            purchasedBy: req.user ? req.user._id : null,
            designId: designId || 'classic',
            recipientName: recipientName || '',
            recipientPhone: recipientPhone || '',
            senderName: senderName || '',
            message: message || ''
        });

        res.status(201).json({ success: true, data: giftCard });
    } catch (error) {
        logger.error('Create gift card error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user's purchased gift cards
// @route   GET /api/gift-cards/my
// @access  Private
export const getMyGiftCards = async (req, res) => {
    try {
        const giftCards = await GiftCard.find({ purchasedBy: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: giftCards });
    } catch (error) {
        logger.error('Get my gift cards error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Transfer gift card to another user
// @route   PUT /api/gift-cards/:id/transfer
// @access  Private
export const transferGiftCard = async (req, res) => {
    try {
        const { recipientPhone } = req.body;
        if (!recipientPhone) {
            return res.status(400).json({ success: false, message: 'Qabul qiluvchi telefon raqami majburiy' });
        }

        // Normalize phone for searching
        const cleanPhone = recipientPhone.replace(/\D/g, '');
        const phoneVariants = [
            cleanPhone,
            `+${cleanPhone}`,
            cleanPhone.startsWith('998') ? cleanPhone.substring(3) : cleanPhone,
            !cleanPhone.startsWith('998') ? `998${cleanPhone}` : cleanPhone
        ];

        const giftCard = await GiftCard.findById(req.params.id);
        if (!giftCard) {
            return res.status(404).json({ success: false, message: 'Sovg\'a kartasi topilmadi' });
        }

        if (giftCard.purchasedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Sizda bu kartani o\'tkazish huquqi yo\'q' });
        }

        if (giftCard.isUsed) {
            return res.status(400).json({ success: false, message: 'Ishlatilgan kartani o\'tkazib bo\'lmaydi' });
        }

        const recipient = await User.findOne({ 
            phone: { $in: [...new Set(phoneVariants.flatMap(p => [p, p.startsWith('+') ? p : `+${p}`]))] } 
        });

        if (!recipient) {
            return res.status(404).json({ success: false, message: 'Ushbu telefon raqamli foydalanuvchi topilmadi' });
        }

        if (recipient._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'O\'zingizga o\'tkaza olmaysiz' });
        }

        giftCard.purchasedBy = recipient._id;
        giftCard.status = 'Sent';
        // Also update recipient phone for record keeping
        giftCard.recipientPhone = recipient.phone;
        await giftCard.save();

        res.json({ success: true, message: 'Karta muvaffaqiyatli o\'tkazildi' });
    } catch (error) {
        logger.error('Transfer gift card error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Validate a gift card code at checkout
// @route   POST /api/gift-cards/validate
// @access  Public
export const validateGiftCard = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: 'Kodni kiriting' });
        }

        const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

        if (!giftCard) {
            return res.status(404).json({ success: false, message: 'Bunday promokod mavjud emas' });
        }

        if (giftCard.isUsed) {
            return res.status(400).json({ success: false, message: 'Bu kod allaqachon ishlatilgan' });
        }

        res.json({
            success: true,
            code: giftCard.code,
            amount: giftCard.amount,
            type: 'giftcard'
        });
    } catch (error) {
        logger.error('Validate gift card error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all gift cards (Admin)
// @route   GET /api/gift-cards
// @access  Admin
export const getGiftCards = async (req, res) => {
    try {
        const giftCards = await GiftCard.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: giftCards });
    } catch (error) {
        logger.error('Get gift cards error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update gift card status
// @route   PUT /api/gift-cards/:id/status
// @access  Admin
export const updateGiftCardStatus = async (req, res) => {
    try {
        const { isUsed } = req.body;
        const giftCard = await GiftCard.findById(req.params.id);

        if (!giftCard) {
            return res.status(404).json({ success: false, message: 'Gift card topilmadi' });
        }

        giftCard.isUsed = isUsed;
        if (isUsed) {
            giftCard.usedAt = new Date();
        }

        await giftCard.save();

        res.json({ success: true, data: giftCard });
    } catch (error) {
        logger.error('Update gift card status error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a gift card
// @route   DELETE /api/gift-cards/:id
// @access  Admin
export const deleteGiftCard = async (req, res) => {
    try {
        const giftCard = await GiftCard.findById(req.params.id);

        if (!giftCard) {
            return res.status(404).json({ success: false, message: 'Gift card topilmadi' });
        }

        await GiftCard.deleteOne({ _id: giftCard._id });
        res.json({ success: true, message: 'Gift card o\'chirildi' });
    } catch (error) {
        logger.error('Delete gift card error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};