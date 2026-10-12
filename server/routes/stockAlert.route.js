import express from 'express'
import { createStockAlert } from '../controllers/stockAlert.controller.js'
import { optionalProtect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/', optionalProtect, createStockAlert)

export default router
