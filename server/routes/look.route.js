import express from 'express';
const router = express.Router();
import lookController from '../controllers/look.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

console.log('✅ Loaded look.route.js');

// Public routes
router.route('/')
    .get(lookController.getAllLooks)
    .post(protect, admin, lookController.createLook);

router.route('/:id')
    .get(lookController.getLookById)
    .put(protect, admin, lookController.updateLook)
    .delete(protect, admin, lookController.deleteLook);

router.route('/:id/price')
    .get(lookController.calculateLookPrice);

router.route('/:id/stock')
    .get(lookController.getLookStock);

router.route('/:id/toggle')
    .patch(protect, admin, lookController.toggleLookActive);

export default router;
