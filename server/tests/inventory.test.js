import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import {
  buildReservation,
  isStockTracked,
  needsReservation,
  withoutInventoryFlags,
} from '../utils/inventory.js'

const serverRoot = path.resolve(import.meta.dirname, '..')
const source = async (relativePath) => readFile(path.join(serverRoot, relativePath), 'utf8')

test('only a real number counts as tracked stock', () => {
  assert.equal(isStockTracked(5), true)
  assert.equal(isStockTracked(0), true)
  assert.equal(isStockTracked(undefined), false)
  assert.equal(isStockTracked(null), false)
  assert.equal(isStockTracked('5'), false)
  assert.equal(isStockTracked(Number.NaN), false)
})

test('products without a stock number are sold without a limit and never reserved', () => {
  // Production catalogue entries have no `stock` field. Reserving them rejected every order.
  assert.equal(needsReservation({ stockTracked: false }), false)
  assert.equal(needsReservation({}), false)
  assert.equal(needsReservation({ stockTracked: true }), true)
})

test('counted stock is still protected by a conditional update', () => {
  const plain = buildReservation({ product: 'p1', quantity: 2, variantId: null })
  assert.deepEqual(plain.query, { _id: 'p1', stock: { $gte: 2 }, 'variants.0': { $exists: false } })
  assert.deepEqual(plain.update, { $inc: { stock: -2 } })

  const variant = buildReservation({ product: 'p1', quantity: 1, variantId: 'v1' })
  assert.equal(variant.query.variants.$elemMatch._id, 'v1')
  assert.deepEqual(variant.query.variants.$elemMatch.stock, { $gte: 1 })
  assert.deepEqual(variant.update, { $inc: { 'variants.$[variant].stock': -1, stock: -1 } })
  assert.equal(variant.options.arrayFilters[0]['variant._id'], 'v1')
})

test('the bookkeeping flag is not stored on the order', () => {
  const [item] = withoutInventoryFlags([{ product: 'p1', quantity: 1, stockTracked: true }])
  assert.deepEqual(item, { product: 'p1', quantity: 1 })
})

test('order creation skips untracked items and strips the flag before saving', async () => {
  const controller = await source('controllers/order.controller.js')
  assert.match(controller, /if \(!needsReservation\(item\)\) continue/)
  assert.match(controller, /stockTracked: isStockTracked\(availableStock\)/)
  assert.match(controller, /items: withoutInventoryFlags\(verifiedItems\)/)
})
