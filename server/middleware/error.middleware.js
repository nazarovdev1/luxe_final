import logger from '../utils/logger.js'

export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} topilmadi`
  })
}

export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err)

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation xatosi',
      errors: Object.values(err.errors).map(e => e.message)
    })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Noto\'g\'ri ID format'
    })
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `${field} allaqachon mavjud`
    })
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format'
    })
  }

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Server xatosi yuz berdi'
      : err.message
  })
}