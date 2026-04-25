import express from 'express';
const router = express.Router();
import lookController from '../controllers/look.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

console.log('✅ Loaded look.route.js');

router.route('/')
    .get(lookController.getAllLooks)
    .post(protect, admin, lookController.createLook);

router.route('/:id')
    .delete(protect, admin, lookController.deleteLook);

export default router;
