import mongoose from 'mongoose'
import Product from '../models/product.model.js'
import Points from '../models/points.model.js'
import logger from '../utils/logger.js'
import jwt from 'jsonwebtoken'
import { getPagination, getSort } from '../utils/pagination.js'

let productsCache = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000

const clearProductsCache = () => {
  productsCache = null
  cacheTimestamp = 0
}

const normalizeProductPayload = (payload = {}) => {
  const product = { ...payload }

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    product.variants = product.variants.map((variant) => ({
      ...variant,
      sku: String(variant.sku || '').trim(),
      size: String(variant.size || '').trim(),
      color: String(variant.color || '').trim(),
      stock: Math.max(0, Number.parseInt(variant.stock, 10) || 0),
      isActive: variant.isActive !== false
    }))
    const activeVariants = product.variants.filter((variant) => variant.isActive)
    product.stock = activeVariants.reduce((sum, variant) => sum + variant.stock, 0)
    product.sizes = [...new Set(activeVariants.map((variant) => variant.size).filter(Boolean))]
    product.colors = [...new Set(activeVariants.map((variant) => variant.color).filter(Boolean))]
  }

  if (product.ratings !== undefined && product.rating === undefined) {
    product.rating = product.ratings
  }

  if (product.badge === null) {
    product.badge = ''
  }

  if (product.earlyAccessUntil === '') {
    product.earlyAccessUntil = null
  }

  delete product.ratings
  return product
}

const normalizeProductResponse = (product = {}) => {
  if (!product) return product
  const normalized = { ...product }
  normalized.rating = normalized.rating ?? normalized.ratings ?? 0
  delete normalized.ratings
  return normalized
}

const getUserLevelFromAuth = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer')) return 'Bronze'

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const pointsRecord = await Points.findOne({ user: decoded.id }).select('level').lean()
    return pointsRecord?.level || 'Bronze'
  } catch {
    return 'Bronze'
  }
}

const canSeeEarlyAccessProduct = (product, userLevel) => {
  if (!product?.earlyAccessUntil) return true
  if (new Date(product.earlyAccessUntil).getTime() <= Date.now()) return true
  return ['Gold', 'Diamond'].includes(userLevel)
}

export const getProduct = async (req, res) => {
  try {
    const now = Date.now()
    const { category, badge, sort = '-createdAt', search } = req.query
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 50, maxLimit: 100 })
    const sortOption = getSort(sort, {
      createdAt: 'createdAt',
      price: 'price',
      rating: 'rating',
      name: 'name'
    }, { createdAt: -1 })

    const hasAuthHeader = Boolean(req.headers.authorization)
    const canUsePublicCache = page === 1 && !category && !badge && !search && !hasAuthHeader

    if (productsCache && (now - cacheTimestamp) < CACHE_DURATION && canUsePublicCache) {
      res.set('Cache-Control', 'public, max-age=60')
      return res.status(200).json({ success: true, data: productsCache, cached: true })
    }

    const query = {}
    if (category) query.category = category
    if (badge) query.badge = badge
    if (search) {
      query.$text = { $search: search }
    }

    // --- Tier-based Early Access Logic ---
    const authHeader = req.headers.authorization;
    const userLevel = await getUserLevelFromAuth(authHeader)

    const canSeeEarlyAccess = ['Gold', 'Diamond'].includes(userLevel);
    if (!canSeeEarlyAccess) {
      query.$or = [
        { earlyAccessUntil: null },
        { earlyAccessUntil: { $lte: new Date() } }
      ];
    }
    // -------------------------------------

    const [products, total] = await Promise.all([
      Product.find(query)
        .select({
          name: 1,
          price: 1,
          originalPrice: 1,
          category: 1,
          badge: 1,
          rating: 1,
          ratings: 1,
          numOfReviews: 1,
          colors: 1,
          sizes: 1,
          description: 1,
          stock: 1,
          variants: 1,
          fit: 1,
          fitType: 1,
          modelInfo: 1,
          garmentMeasurements: 1,
          sizeConversions: 1,
          createdAt: 1,
          earlyAccessTier: 1,
          earlyAccessUntil: 1,
          isNewCollection: 1,
          images: { $slice: 1 }
        })
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ])

    const normalizedProducts = products.map(normalizeProductResponse)

    if (canUsePublicCache) {
      productsCache = normalizedProducts
      cacheTimestamp = now
    }

    res.set('Cache-Control', hasAuthHeader ? 'private, no-store' : 'public, max-age=60')
    res.status(200).json({
      success: true,
      data: normalizedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: skip + normalizedProducts.length < total,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    logger.error('Error fetching products:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

export const getSingleProduct = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid Product ID' })
  }

    try {
    const product = await Product.findById(id).lean()

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const userLevel = await getUserLevelFromAuth(req.headers.authorization)
    if (!canSeeEarlyAccessProduct(product, userLevel)) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    res.set('Cache-Control', 'public, max-age=300')
    res.status(200).json({ success: true, data: normalizeProductResponse(product) })
  } catch (error) {
    logger.error('Error fetching single product:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

export const getRelatedProducts = async (req, res) => {
  const { id } = req.params

  try {
    const product = await Product.findById(id).lean()

    if (!product) {
      return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' })
    }

    const userLevel = await getUserLevelFromAuth(req.headers.authorization)
    const canSeeEarlyAccess = ['Gold', 'Diamond'].includes(userLevel)
    const visibilityQuery = canSeeEarlyAccess
      ? {}
      : {
          $or: [
            { earlyAccessUntil: null },
            { earlyAccessUntil: { $lte: new Date() } }
          ]
        }

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: id },
      ...visibilityQuery
    })
      .select({
        name: 1,
        price: 1,
        originalPrice: 1,
        category: 1,
        badge: 1,
        rating: 1,
        ratings: 1,
        images: { $slice: 1 }
      })
      .limit(10)
      .lean()

    res.set('Cache-Control', 'public, max-age=300')
    res.status(200).json({ success: true, data: relatedProducts.map(normalizeProductResponse) })
  } catch (error) {
    logger.error('Related product error:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}

export const postProduct = async (req, res) => {
  const product = normalizeProductPayload(req.validatedBody || req.body)

  if (!product.name || !product.price || !product.category || !product.images || product.images.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Majburiy maydonlar to'liq emas"
    })
  }

  try {
    const newProduct = new Product(product)
    await newProduct.save()

    clearProductsCache()

    logger.info(`Product created: ${newProduct._id}`)

    res.status(201).json({ success: true, data: normalizeProductResponse(newProduct.toObject()) })
  } catch (error) {
    logger.error('Error creating product:', error)
    res.status(500).json({ success: false, message: "Server xatosi: " + error.message })
  }
}

export const putProduct = async (req, res) => {
  const { id } = req.params
  const product = normalizeProductPayload(req.validatedBody || req.body)

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid Product ID' })
  }

  try {
    const existing = await Product.findById(id).select('name price images').lean()
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const oldPrice = Number(existing.price || 0)
    const updated = await Product.findByIdAndUpdate(id, product, { new: true, runValidators: true }).lean()

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    clearProductsCache()

    logger.info(`Product updated: ${id}`)

    const newPrice = Number(updated.price || 0)
    if (oldPrice > 0 && newPrice > 0 && newPrice < oldPrice) {
      import('../services/priceAlert.service.js')
        .then(({ checkAndTriggerPriceAlerts }) => {
          checkAndTriggerPriceAlerts(updated, oldPrice, newPrice)
        })
        .catch((err) => logger.error('Error importing priceAlert.service:', err))
    }

    res.status(200).json({ success: true, data: normalizeProductResponse(updated) })
  } catch (error) {
    logger.error('Error updating product:', error)
    res.status(500).json({ success: false, message: 'Yangilashda xato' })
  }
}

export const deleteProduct = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid Product ID' })
  }

  try {
    const deleted = await Product.findByIdAndDelete(id)

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    clearProductsCache()

    logger.info(`Product deleted: ${id}`)

    res.status(200).json({ success: true, message: 'Product deleted' })
  } catch (error) {
    logger.error('Error deleting product:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}
