import express from 'express';
import { 
    getAllCoupons, 
    getMyCoupons, 
    createCoupon, 
    validateCoupon, 
    deleteCoupon 
} from '../controllers/coupon.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
    .get(protect, admin, getAllCoupons)
    .post(protect, admin, createCoupon);

router.get('/my-coupons', protect, getMyCoupons);
router.post('/validate', protect, validateCoupon);

router.delete('/:id', protect, admin, deleteCoupon);

export default router;
