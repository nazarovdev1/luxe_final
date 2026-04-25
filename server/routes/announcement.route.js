import express from 'express';
import {
    createAnnouncement,
    getActiveAnnouncement,
    getAllAnnouncements,
    deleteAnnouncement,
    toggleStatus
} from '../controllers/announcement.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/active', getActiveAnnouncement);
router.get('/', protect, authorize('admin', 'manager'), getAllAnnouncements);
router.post('/', protect, authorize('admin', 'manager'), createAnnouncement);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteAnnouncement);
router.patch('/:id/toggle', protect, authorize('admin', 'manager'), toggleStatus);

export default router;