import assert from 'node:assert/strict'
import test from 'node:test'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import PriceAlert from '../models/priceAlert.model.js'
import { checkAndTriggerPriceAlerts } from '../services/priceAlert.service.js'

const serverRoot = path.resolve(import.meta.dirname, '..')
const source = async (relativePath) => readFile(path.join(serverRoot, relativePath), 'utf8')

test('PriceAlert model schema has all required fields and indexes', () => {
  const schema = PriceAlert.schema
  assert.ok(schema.paths.productId, 'productId must exist in schema')
  assert.ok(schema.paths.targetPrice, 'targetPrice must exist in schema')
  assert.ok(schema.paths.notifyMethod, 'notifyMethod must exist in schema')
  assert.ok(schema.paths.status, 'status must exist in schema')
  assert.ok(schema.paths.expiresAt, 'expiresAt must exist in schema')

  const indexes = schema.indexes()
  const hasCompoundIndex = indexes.some(
    ([idx]) => idx.productId === 1 && idx.status === 1 && idx.targetPrice === 1
  )
  assert.ok(hasCompoundIndex, 'Compound index on (productId, status, targetPrice) must exist')
})

test('checkAndTriggerPriceAlerts returns 0 triggered if newPrice >= oldPrice', async () => {
  const dummyProduct = { _id: '507f1f77bcf86cd799439011', name: 'Test Coat' }
  const result = await checkAndTriggerPriceAlerts(dummyProduct, 1000000, 1000000)
  assert.equal(result.triggeredCount, 0, 'Should not trigger if price is unchanged')

  const higherPriceResult = await checkAndTriggerPriceAlerts(dummyProduct, 1000000, 1200000)
  assert.equal(higherPriceResult.triggeredCount, 0, 'Should not trigger if price increased')
})

test('server.js registers /api/price-alerts route', async () => {
  const serverCode = await source('server.js')
  assert.match(serverCode, /import priceAlertRoutes from '\.\/routes\/priceAlert\.route\.js'/)
  assert.match(serverCode, /app\.use\('\/api\/price-alerts',\s*priceAlertRoutes\)/)
})

test('product.controller triggers checkAndTriggerPriceAlerts on price reduction', async () => {
  const productCtrlCode = await source('controllers/product.controller.js')
  assert.match(productCtrlCode, /checkAndTriggerPriceAlerts\(/)
  assert.match(productCtrlCode, /newPrice\s*<\s*oldPrice/)
})
