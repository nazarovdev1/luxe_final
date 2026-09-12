import express from 'express'
import {
  deleteProduct,
  getProduct,
  getRelatedProducts,
  getSingleProduct,
  postProduct,
  putProduct
} from '../controllers/product.controller.js'
import { protect, authorize, optionalProtect } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'

const router = express.Router()

router.get('/', optionalProtect, getProduct)
router.get('/:id', optionalProtect, getSingleProduct)
router.get('/:id/related', optionalProtect, getRelatedProducts)

router.post('/', protect, authorize('admin', 'manager'), validate('product'), postProduct)
router.put('/:id', protect, authorize('admin', 'manager'), validate('product'), putProduct)
router.delete('/:id', protect, authorize('admin', 'manager'), deleteProduct)

export default router
