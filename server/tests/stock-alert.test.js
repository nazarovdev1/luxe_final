import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import StockAlert from '../models/stockAlert.model.js'
import Product from '../models/product.model.js'
import smsService from '../services/sms.service.js'
import { alertMatches, findRestocked, notifyBackInStock } from '../services/stockAlert.service.js'
import { MAX_ACTIVE_ALERTS_PER_PHONE, createStockAlert } from '../controllers/stockAlert.controller.js'

const serverRoot = path.resolve(import.meta.dirname, '..')
const source = async (relativePath) => readFile(path.join(serverRoot, relativePath), 'utf8')

const createRes = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this },
  json(payload) { this.body = payload; return this }
})

test('findRestocked detects products and variants that became available', () => {
  assert.deepEqual(findRestocked({ stock: 0 }, { stock: 4 }), { any: true, variants: [] })
  assert.equal(findRestocked({ stock: 2 }, { stock: 5 }).any, false)
  assert.equal(findRestocked({ stock: 0 }, { stock: 0 }).any, false)

  const before = { variants: [{ size: 'M', color: 'Qora', stock: 0 }, { size: 'L', color: 'Qora', stock: 3 }] }
  const after = { variants: [{ size: 'M', color: 'Qora', stock: 2 }, { size: 'L', color: 'Qora', stock: 1 }] }
  assert.deepEqual(findRestocked(before, after), { any: false, variants: [{ size: 'M', color: 'Qora' }] })

  const inactive = { variants: [{ size: 'M', color: 'Qora', stock: 5, isActive: false }] }
  assert.deepEqual(findRestocked(before, inactive).variants, [])
})

test('alerts match by size/color, and empty fields mean any variant', () => {
  const restocked = { any: false, variants: [{ size: 'M', color: 'Qora' }] }
  assert.equal(alertMatches({ size: 'M', color: '' }, restocked), true)
  assert.equal(alertMatches({ size: '', color: '' }, restocked), true)
  assert.equal(alertMatches({ size: 'L', color: '' }, restocked), false)
  assert.equal(alertMatches({ size: 'M', color: 'Oq' }, restocked), false)
  assert.equal(alertMatches({ size: 'L', color: 'Oq' }, { any: true, variants: [] }), true)
})

test('stock alert endpoint validates input and caps waiting entries per phone', async () => {
  const originals = { findById: Product.findById, findOne: StockAlert.findOne, count: StockAlert.countDocuments, create: StockAlert.create }
  const created = []
  Product.findById = () => ({ select: () => ({ lean: async () => ({ name: 'Kostyum' }) }) })
  StockAlert.findOne = async () => null
  StockAlert.countDocuments = async () => 0
  StockAlert.create = async (doc) => { created.push(doc); return doc }
  try {
    const badPhone = createRes()
    await createStockAlert({ body: { productId: '64b7f0f2c2a4a1a1a1a1a1a1', phone: '901234567' } }, badPhone)
    assert.equal(badPhone.statusCode, 400)

    const badId = createRes()
    await createStockAlert({ body: { productId: 'nope', phone: '+998901234567' } }, badId)
    assert.equal(badId.statusCode, 400)

    const ok = createRes()
    await createStockAlert({ body: { productId: '64b7f0f2c2a4a1a1a1a1a1a1', phone: '+998901234567', size: 'M' } }, ok)
    assert.equal(ok.statusCode, 201)
    assert.equal(created.length, 1)
    assert.equal(created[0].size, 'M')

    StockAlert.countDocuments = async () => MAX_ACTIVE_ALERTS_PER_PHONE
    const capped = createRes()
    await createStockAlert({ body: { productId: '64b7f0f2c2a4a1a1a1a1a1a1', phone: '+998901234567' } }, capped)
    assert.equal(capped.statusCode, 429)
    assert.equal(created.length, 1)
  } finally {
    Product.findById = originals.findById
    StockAlert.findOne = originals.findOne
    StockAlert.countDocuments = originals.count
    StockAlert.create = originals.create
  }
})

test('back-in-stock marks matching alerts notified and texts customers when SMS is configured', async () => {
  const originals = { find: StockAlert.find, updateOne: StockAlert.updateOne, send: smsService.sendSMS, key: smsService.smsApiKey }
  const updates = []
  const texts = []
  StockAlert.find = () => ({ lean: async () => ([
    { _id: 'a1', phone: '+998901111111', size: 'M', color: '' },
    { _id: 'a2', phone: '+998902222222', size: 'L', color: '' }
  ]) })
  StockAlert.updateOne = async (filter, update) => { updates.push({ filter, update }) }
  smsService.smsApiKey = 'test-key'
  smsService.sendSMS = async (phone, text) => { texts.push({ phone, text }); return { success: true } }
  try {
    const before = { variants: [{ size: 'M', color: 'Qora', stock: 0 }, { size: 'L', color: 'Qora', stock: 0 }] }
    const after = { _id: 'p1', name: 'Kostyum', variants: [{ size: 'M', color: 'Qora', stock: 3 }, { size: 'L', color: 'Qora', stock: 0 }] }
    const result = await notifyBackInStock(before, after)

    assert.equal(result.notified, 1)
    assert.equal(texts.length, 1)
    assert.equal(texts[0].phone, '+998901111111')
    assert.match(texts[0].text, /\/product\/p1/)
    assert.equal(updates.length, 1)
    assert.equal(updates[0].filter._id, 'a1')
    assert.equal(updates[0].update.$set.status, 'notified')

    const nothing = await notifyBackInStock({ stock: 3 }, { _id: 'p2', name: 'X', stock: 5 })
    assert.equal(nothing.notified, 0)
  } finally {
    StockAlert.find = originals.find
    StockAlert.updateOne = originals.updateOne
    smsService.sendSMS = originals.send
    smsService.smsApiKey = originals.key
  }
})

test('product updates trigger back-in-stock checks and the route is mounted', async () => {
  const controller = await source('controllers/product.controller.js')
  assert.match(controller, /notifyBackInStock\(existing,\s*updated\)/)
  assert.match(controller, /select\('name price images stock variants'\)/)

  const server = await source('server.js')
  assert.match(server, /app\.use\('\/api\/stock-alerts',\s*stockAlertRoutes\)/)
})
