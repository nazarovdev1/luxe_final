import express from 'express';
import {
    createGiftCard,
    validateGiftCard,
    getGiftCards,
    getMyGiftCards,
    transferGiftCard,
    updateGiftCardStatus,
    deleteGiftCard
} from '../controllers/giftCard.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route for validating gift cards
router.post('/validate', validateGiftCard);

// User and Admin routes
router.get('/my', protect, getMyGiftCards);
router.put('/:id/transfer', protect, transferGiftCard);
router.post('/', protect, createGiftCard);

// Admin only routes
router.route('/')
    .get(protect, admin, getGiftCards);

router.route('/:id/status')
    .put(protect, admin, updateGiftCardStatus);

router.route('/:id')
    .delete(protect, admin, deleteGiftCard);

export default router;