import multer from 'multer'
import visualSearchService from '../services/visualSearch.service.js'
import logger from '../utils/logger.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Faqat rasm fayllari qabul qilinadi'), false)
    }
  }
})

export const searchByImage = [
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Rasm yuborilishi shart'
        })
      }

      const { limit = 12 } = req.query
      const result = await visualSearchService.findSimilarByColor(
        req.file.buffer,
        parseInt(limit)
      )

      if (!result.success) {
        return res.status(500).json(result)
      }

      res.json({
        success: true,
        queryPalette: result.queryPalette,
        data: result.results
      })
    } catch (error) {
      logger.error('Visual search error:', error)
      res.status(500).json({
        success: false,
        message: 'Visual search xatosi'
      })
    }
  }
]

export const findSimilar = async (req, res) => {
  try {
    const { id } = req.params
    const { limit = 10 } = req.query

    const result = await visualSearchService.findSimilarByProductId(id, parseInt(limit))

    if (!result.success) {
      return res.status(404).json(result)
    }

    res.json({
      success: true,
      data: result.results
    })
  } catch (error) {
    logger.error('Find similar error:', error)
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    })
  }
}

export const extractColors = [
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Rasm yuborilishi shart'
        })
      }

      const palette = await visualSearchService.extractColorPalette(req.file.buffer)

      res.json({
        success: true,
        palette
      })
    } catch (error) {
      logger.error('Color extraction error:', error)
      res.status(500).json({
        success: false,
        message: 'Rang ajratish xatosi'
      })
    }
  }
]

export const generateEmbeddings = async (req, res) => {
  try {
    const result = await visualSearchService.batchGenerateEmbeddings()
    res.json(result)
  } catch (error) {
    logger.error('Embedding generation error:', error)
    res.status(500).json({
      success: false,
      message: 'Embedding generatsiya xatosi'
    })
  }
}

export { upload }