import aiStylistService from '../services/aiStylist.service.js'
import logger from '../utils/logger.js'

export const chatWithStylist = async (req, res) => {
  try {
    const { message, history = [] } = req.body

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Xabar yuborilishi shart'
      })
    }

    const response = await aiStylistService.getChatResponse(message, { history })

    res.json({
      success: true,
      response
    })
  } catch (error) {
    logger.error('AI stylist chat error:', error)
    res.status(500).json({
      success: false,
      message: 'AI stylizt xizmati hozircha mavjud emas. Iltimos, keyinroq urinib ko\'ring.'
    })
  }
}

export const generateOutfit = async (req, res) => {
  try {
    const { occasion, preferences, budget } = req.body

    const response = await aiStylistService.generateOutfit(occasion, preferences, budget)

    res.json({
      success: true,
      outfit: response
    })
  } catch (error) {
    logger.error('Outfit generation error:', error)
    res.status(500).json({
      success: false,
      message: 'Kiyim tayyorlash xizmati hozircha mavjud emas'
    })
  }
}

export const getStyleAdvice = async (req, res) => {
  try {
    const { query } = req.body

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'So\'rov yuborilishi shart'
      })
    }

    const response = await aiStylistService.getStyleAdvice(query)

    res.json({
      success: true,
      advice: response
    })
  } catch (error) {
    logger.error('Style advice error:', error)
    res.status(500).json({
      success: false,
      message: 'Stil tavsifi xizmati hozircha mavjud emas'
    })
  }
}