import mongoose from 'mongoose'
import Product from '../models/product.model.js'
import Points from '../models/points.model.js'
import logger from '../utils/logger.js'
import jwt from 'jsonwebtoken'

let productsCache = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000

const clearProductsCache = () => {
  productsCache = null
  cacheTimestamp = 0
}

export const getProduct = async (req, res) => {
  try {
    const now = Date.now()
    const { page = 1, limit = 50, category, badge, sort = '-createdAt', search } = req.query

    if (productsCache && (now - cacheTimestamp) < CACHE_DURATION && page === 1 && !category && !badge && !search) {
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
    let userLevel = 'Bronze';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const pointsRecord = await Points.findOne({ user: decoded.id });
        if (pointsRecord) userLevel = pointsRecord.level;
      } catch (err) {
        // Token invalid, treat as guest
      }
    }

    const canSeeEarlyAccess = ['Gold', 'Diamond'].includes(userLevel);
    if (!canSeeEarlyAccess) {
      query.$or = [
        { earlyAccessUntil: null },
        { earlyAccessUntil: { $lte: new Date() } }
      ];
    }
    // -------------------------------------

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortOption = sort.startsWith('-') ? { [sort.slice(1)]: -1 } : { [sort]: 1 }

    const [products, total] = await Promise.all([
      Product.find(query)
        .select({
          name: 1,
          price: 1,
          originalPrice: 1,
          category: 1,
          badge: 1,
          rating: 1,
          numOfReviews: 1,
          colors: 1,
          sizes: 1,
          description: 1,
          stock: 1,
          createdAt: 1,
          earlyAccessTier: 1,
          earlyAccessUntil: 1,
          isNewCollection: 1,
          images: { $slice: 1 }
        })
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query)
    ])

    if (page === 1 && !category && !badge && !search) {
      productsCache = products
      cacheTimestamp = now
    }

    res.set('Cache-Control', 'public, max-age=60')
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: skip + products.length < total,
        hasPrevPage: parseInt(page) > 1
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

    res.set('Cache-Control', 'public, max-age=300')
    res.status(200).json({ success: true, data: product })
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

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: id }
    })
      .select({
        name: 1,
        price: 1,
        originalPrice: 1,
        category: 1,
        badge: 1,
        rating: 1,
        images: { $slice: 1 }
      })
      .limit(10)
      .lean()

    res.set('Cache-Control', 'public, max-age=300')
    res.status(200).json({ success: true, data: relatedProducts })
  } catch (error) {
    logger.error('Related product error:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}

export const postProduct = async (req, res) => {
  const product = req.body

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

    res.status(201).json({ success: true, data: newProduct })
  } catch (error) {
    logger.error('Error creating product:', error)
    res.status(500).json({ success: false, message: "Server xatosi: " + error.message })
  }
}

export const putProduct = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid Product ID' })
  }

  try {
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true }).lean()

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    clearProductsCache()

    logger.info(`Product updated: ${id}`)

    res.status(200).json({ success: true, data: updated })
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