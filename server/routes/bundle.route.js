import express from 'express';
const router = express.Router();
import { getAllBundles, getBundleById, createBundle, updateBundle, deleteBundle } from '../controllers/bundle.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

console.log('✅ Loaded bundle.route.js');

router.route('/')
    .get(getAllBundles)
    .post(protect, admin, createBundle);

router.route('/:id')
    .get(getBundleById)
    .put(protect, admin, updateBundle)
    .delete(protect, admin, deleteBundle);

export default router;
