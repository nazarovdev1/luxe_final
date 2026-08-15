import express from 'express'
import {
  createPriceAlert,
  unsubscribePriceAlert,
  checkPriceAlert,
} from '../controllers/priceAlert.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

// Optional auth: sets req.user if token provided, but doesn't block guests
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next)
  }
  next()
}

router.post('/', optionalAuth, createPriceAlert)
router.post('/unsubscribe', optionalAuth, unsubscribePriceAlert)
router.get('/check', optionalAuth, checkPriceAlert)

export default router
