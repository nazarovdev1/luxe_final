import express from 'express'
import {
  deleteProduct,
  getProduct,
  getRelatedProducts,
  getSingleProduct,
  postProduct,
  putProduct
} from '../controllers/prouduct.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'

const router = express.Router()

router.get('/', getProduct)
router.get('/:id', getSingleProduct)
router.get('/:id/related', getRelatedProducts)

router.post('/', protect, authorize('admin', 'manager'), validate('product'), postProduct)
router.put('/:id', protect, authorize('admin', 'manager'), validate('product'), putProduct)
router.delete('/:id', protect, authorize('admin', 'manager'), deleteProduct)

export default router