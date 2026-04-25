import express from 'express'
import {
	deleteProduct,
	getProduct,
	getRelatedProducts,
	getSingleProduct,
	postProduct,
	putProduct,
} from '../controllers/prouduct.controller.js'

import { protect, authorize } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', getProduct)
router.get('/:id', getSingleProduct)
router.get('/:id/related', getRelatedProducts)
router.post('/', protect, authorize('admin', 'manager'), postProduct)
router.put('/:id', protect, authorize('admin', 'manager'), putProduct)
router.delete('/:id', protect, authorize('admin', 'manager'), deleteProduct)

export default router
