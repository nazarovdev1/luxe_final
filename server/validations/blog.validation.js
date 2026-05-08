import Joi from 'joi'

const blogCreateSchema = Joi.object({
  title: Joi.object({
    uz: Joi.string().min(3).max(200).required().messages({
      'string.min': 'Sarlavha (uz) kamida 3 ta belgidan iborat bo\'lishi kerak',
      'string.max': 'Sarlavha (uz) 200 ta belgidan oshmasligi kerak',
      'any.required': 'Sarlavha (uz) majburiy maydon'
    }),
    ru: Joi.string().min(3).max(200).allow('', null),
    en: Joi.string().min(3).max(200).allow('', null)
  }).required(),
  excerpt: Joi.object({
    uz: Joi.string().max(500).allow('', null),
    ru: Joi.string().max(500).allow('', null),
    en: Joi.string().max(500).allow('', null)
  }),
  content: Joi.object({
    uz: Joi.string().min(50).allow('', null).messages({
      'string.min': 'Kontent (uz) kamida 50 ta belgidan iborat bo\'lishi kerak'
    }),
    ru: Joi.string().min(50).allow('', null),
    en: Joi.string().min(50).allow('', null)
  }),
  coverImage: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Rasm URL manzil bo\'lishi kerak'
  }),
  images: Joi.array().items(Joi.string().uri()).max(20),
  category: Joi.string().valid('Trendlar', 'Maslahatlar', 'Kombinatsiyalar', 'Parvarish', 'Aksessuarlar').required().messages({
    'any.only': 'Kategoriya noto\'g\'ri tanlangan',
    'any.required': 'Kategoriya majburiy maydon'
  }),
  tags: Joi.array().items(Joi.string().max(50)).max(15),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
  featured: Joi.boolean().default(false),
  seoTitle: Joi.string().max(200).allow('', null),
  seoDescription: Joi.string().max(500).allow('', null)
})

const blogUpdateSchema = Joi.object({
  title: Joi.object({
    uz: Joi.string().min(3).max(200),
    ru: Joi.string().min(3).max(200).allow('', null),
    en: Joi.string().min(3).max(200).allow('', null)
  }),
  excerpt: Joi.object({
    uz: Joi.string().max(500).allow('', null),
    ru: Joi.string().max(500).allow('', null),
    en: Joi.string().max(500).allow('', null)
  }),
  content: Joi.object({
    uz: Joi.string().min(50).allow('', null),
    ru: Joi.string().min(50).allow('', null),
    en: Joi.string().min(50).allow('', null)
  }),
  coverImage: Joi.string().uri().allow('', null),
  images: Joi.array().items(Joi.string().uri()).max(20),
  category: Joi.string().valid('Trendlar', 'Maslahatlar', 'Kombinatsiyalar', 'Parvarish', 'Aksessuarlar'),
  tags: Joi.array().items(Joi.string().max(50)).max(15),
  status: Joi.string().valid('draft', 'published', 'archived'),
  featured: Joi.boolean(),
  seoTitle: Joi.string().max(200).allow('', null),
  seoDescription: Joi.string().max(500).allow('', null)
})

export { blogCreateSchema, blogUpdateSchema }
