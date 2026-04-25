import express from 'express'
import { handleContactForm } from '../controllers/contact.controller.js'
import rateLimit from 'express-rate-limit'

const router = express.Router()

// Stricter rate limit for contact form
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per hour
    message: 'Too many messages sent from this IP, please try again after an hour'
})

router.post('/', contactLimiter, handleContactForm)

export default router
