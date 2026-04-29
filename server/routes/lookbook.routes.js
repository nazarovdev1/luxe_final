import express from 'express';
import {
    createLookbook,
    getUserLookbooks,
    getPurchasedWardrobe
} from '../controllers/lookbook.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All lookbook routes require authentication

router.route('/')
    .get(getUserLookbooks)
    .post(createLookbook);

router.get('/wardrobe', getPurchasedWardrobe);

export default router;
