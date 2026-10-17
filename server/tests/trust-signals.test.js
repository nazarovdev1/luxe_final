import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import Review from '../models/review.model.js'
import Product from '../models/product.model.js'
import { normalizeProductPayload } from '../controllers/product.controller.js'
import { recalculateProductRating } from '../controllers/review.controller.js'
import { schemas } from '../middleware/validate.middleware.js'

const serverRoot = path.resolve(import.meta.dirname, '..')
const source = async (relativePath) => readFile(path.join(serverRoot, relativePath), 'utf8')

const baseProduct = {
  name: 'Palto',
  description: 'Jun palto',
  price: 2500000,
  category: 'Palto plash',
  images: [{ url: 'https://ik.imagekit.io/luxx/p.jpg' }]
}

test('admin product payloads cannot set rating or review count', () => {
  const normalized = normalizeProductPayload({ ...baseProduct, rating: 5, ratings: 4.9, numOfReviews: 120 })
  assert.equal('rating' in normalized, false)
  assert.equal('ratings' in normalized, false)
  assert.equal('numOfReviews' in normalized, false)
})

test('product validation no longer injects a default rating and accepts a sale end date', () => {
  const { value, error } = schemas.product.validate({ ...baseProduct, saleEndsAt: '2026-12-31T23:59:59.000Z' }, { allowUnknown: true })
  assert.equal(error, undefined)
  assert.equal('rating' in value, false)
  assert.ok(value.saleEndsAt instanceof Date)
})

test('product facts (brand, authenticity, fabric, origin, video) are accepted and stored', () => {
  const facts = {
    brand: 'Max Mara',
    authenticity: { isOriginal: true, note: 'Italiya, hujjat bilan' },
    fabricComposition: '100% jun',
    careInstructions: 'Faqat kimyoviy tozalash',
    origin: 'Italiya',
    videoUrl: 'https://ik.imagekit.io/luxx/palto.mp4'
  }
  const { error, value } = schemas.product.validate({ ...baseProduct, ...facts }, { allowUnknown: true })
  assert.equal(error, undefined)
  const doc = new Product(value)
  assert.equal(doc.brand, 'Max Mara')
  assert.equal(doc.authenticity.isOriginal, true)
  assert.equal(doc.fabricComposition, '100% jun')
  assert.equal(doc.origin, 'Italiya')

  const insecureVideo = schemas.product.validate({ ...baseProduct, videoUrl: 'http://example.com/v.mp4' }, { allowUnknown: true })
  assert.ok(insecureVideo.error)
})

test('rating and review count are recalculated from stored reviews', async () => {
  const originals = { find: Review.find, update: Product.findByIdAndUpdate }
  const updates = []
  let stored = [{ rating: 5 }, { rating: 4 }, { rating: 4 }]
  Review.find = () => ({ select: () => ({ lean: async () => stored }) })
  Product.findByIdAndUpdate = async (id, update) => { updates.push({ id, update }) }
  try {
    assert.deepEqual(await recalculateProductRating('p1'), { rating: 4.3, numOfReviews: 3 })
    assert.deepEqual(updates[0], { id: 'p1', update: { rating: 4.3, numOfReviews: 3 } })

    stored = []
    assert.deepEqual(await recalculateProductRating('p1'), { rating: 0, numOfReviews: 0 })
  } finally {
    Review.find = originals.find
    Product.findByIdAndUpdate = originals.update
  }
})

test('one review per customer per product and no default eco score', async () => {
  assert.ok(Review.schema.indexes().some(([fields, options]) => fields.product === 1 && fields.user === 1 && options.unique))
  assert.equal(Product.schema.path('ecoScore').defaultValue, null)
  assert.equal(Product.schema.path('saleEndsAt').instance, 'Date')

  const listing = await source('controllers/product.controller.js')
  assert.match(listing, /saleEndsAt:\s*1/)
})
