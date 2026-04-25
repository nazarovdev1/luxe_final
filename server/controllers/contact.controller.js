import { sendContactMessage } from '../services/telegram.service.js'

export const handleContactForm = async (req, res) => {
    try {
        const { name, phone, message } = req.body

        if (!name || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: 'Barcha maydonlarni to\'ldiring'
            })
        }

        const result = await sendContactMessage(name, phone, message)

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Xabar muvaffaqiyatli yuborildi'
            })
        } else {
            res.status(500).json({
                success: false,
                message: 'Xabarni yuborishda xatolik yuz berdi'
            })
        }
    } catch (error) {
        console.error('Contact form error:', error)
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        })
    }
}
