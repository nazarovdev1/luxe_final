import Joi from 'joi'

const objectIdPattern = /^[0-9a-fA-F]{24}$/

export const validateObjectId = (value, helpers) => {
  if (!objectIdPattern.test(value)) {
    return helpers.error('any.invalid')
  }
  return value
}

export const schemas = {
  register: Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .required()
      .messages({
        'string.min': 'Username kamida 3 ta belgi bo\'lishi kerak',
        'string.max': 'Username 30 ta belgidan oshmasligi kerak',
        'string.pattern.base': 'Username faqat harf, raqam va _ belgidan iborat bo\'lishi kerak'
      }),
    phone: Joi.string()
      .pattern(/^\+998[0-9]{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak'
      }),
    password: Joi.string()
      .min(6)
      .max(100)
      .required()
      .messages({
        'string.min': 'Parol kamida 6 ta belgi bo\'lishi kerak',
        'string.max': 'Parol 100 ta belgidan oshmasligi kerak'
      })
  }),

  login: Joi.object({
    identifier: Joi.string().required(),
    password: Joi.string().required()
  }),

  product: Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().required(),
    price: Joi.number().min(0).required(),
    originalPrice: Joi.number().min(0),
    category: Joi.string().valid('Premium', 'Luxury', 'Corporate', 'Limited').required(),
    images: Joi.array().items(Joi.object({ url: Joi.string().required() })).min(1).required(),
    stock: Joi.number().integer().min(0).default(1),
    badge: Joi.string().valid('NEW', 'BESTSELLER', 'SALE', 'LIMITED'),
    colors: Joi.array().items(Joi.string()),
    sizes: Joi.array().items(Joi.string())
  }),

  order: Joi.object({
    customer: Joi.object({
      name: Joi.string().max(100).required(),
      phone: Joi.string().pattern(/^\+998[0-9]{9}$/).required(),
      address: Joi.string().max(500).required(),
      location: Joi.object({
        lat: Joi.number().min(-90).max(90),
        lng: Joi.number().min(-180).max(180)
      }),
      comments: Joi.string().max(500).allow('', null)
    }).required(),
    items: Joi.array().items(Joi.object({
      product: Joi.string().pattern(objectIdPattern).required(),
      name: Joi.string().required(),
      image: Joi.string().allow('', null),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required(),
      selectedColor: Joi.string().allow('', null),
      selectedSize: Joi.string().allow('', null)
    })).min(1).required(),
    totals: Joi.object({
      subtotal: Joi.number().min(0).required(),
      deliveryFee: Joi.number().min(0).required(),
      promoCode: Joi.string().allow('', null),
      discountAmount: Joi.number().min(0).default(0),
      total: Joi.number().min(0).required()
    }).required(),
    paymentMethod: Joi.string().valid('cash', 'click', 'payme').default('cash'),
    userId: Joi.string().pattern(objectIdPattern).allow(null)
  }),

  promo: Joi.object({
    code: Joi.string().uppercase().min(4).max(20).required(),
    discountPercentage: Joi.number().min(1).max(100).required(),
    isActive: Joi.boolean().default(true)
  }),

  review: Joi.object({
    product: Joi.string().pattern(objectIdPattern).required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().min(10).max(500).required()
  }),

  announcement: Joi.object({
    content: Joi.string().min(1).max(1000).required(),
    type: Joi.string().valid('info', 'warning', 'sale', 'new_arrival').default('info'),
    isActive: Joi.boolean().default(true),
    expiryDate: Joi.date()
  }),

  contact: Joi.object({
    name: Joi.string().max(100).required(),
    phone: Joi.string().pattern(/^\+998[0-9]{9}$/),
    email: Joi.string().email(),
    message: Joi.string().min(10).max(1000).required()
  }),

  passwordReset: Joi.object({
    phone: Joi.string().pattern(/^\+998[0-9]{9}$/).required()
  }),

  newPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).max(100).required()
  })
}

export const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName]
    if (!schema) {
      return res.status(500).json({ success: false, message: 'Validation schema not found' })
    }

    const { error, value } = schema.validate(req.body, { abortEarly: false })
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors 
      })
    }

    req.validatedBody = value
    next()
  }
}