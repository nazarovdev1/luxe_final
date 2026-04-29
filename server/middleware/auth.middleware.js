import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import logger from '../utils/logger.js'

export const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.id).select('-password')

      if (!req.user) {
        logger.warn(`Auth failed: user ${decoded.id} not found`)
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        })
      }

      return next()
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.warn('Auth failed: token expired')
        return res.status(401).json({
          success: false,
          message: 'Session muddati tugagan. Iltimos, qayta kiring.'
        })
      }
      if (error.name === 'JsonWebTokenError') {
        logger.warn(`Auth failed: invalid token - ${error.message}`)
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token failed'
        })
      }
      logger.error('Auth error:', error)
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      })
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn(`Authorization failed for user ${req.user?._id}: required roles ${roles}, got ${req.user?.role}`)
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this route`
      })
    }
    next()
  }
}

export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
    next()
  } else {
    logger.warn(`Admin access denied for user ${req.user?._id}`)
    res.status(401).json({
      success: false,
      message: 'Not authorized as an admin'
    })
  }
}