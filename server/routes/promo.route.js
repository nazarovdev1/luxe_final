import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import {
    createPromo,
    getPromos,
    updatePromoStatus,
    deletePromo,
    validatePromo
} from '../controllers/promo.controller.js';

const router = express.Router();

// Public route for checking promo
router.post('/validate', validatePromo);

// Admin only routes
router.route('/')
    .post(protect, admin, createPromo)
    .get(protect, admin, getPromos);

router.route('/:id')
    .delete(protect, admin, deletePromo);

router.route('/:id/status')
    .put(protect, admin, updatePromoStatus);

export default router;
