import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import bcrypt from 'bcryptjs'
import { hashPasswordIfModified } from '../models/user.model.js'
import PasswordReset from '../models/passwordReset.model.js'
import User from '../models/user.model.js'
import smsService from '../services/sms.service.js'
import { createOriginChecker, getAllowedOrigins } from '../config/cors.js'
import { schemas } from '../middleware/validate.middleware.js'
import { toTelegramPayload } from '../services/orderNotifier.js'
import {
  MAX_CODE_ATTEMPTS,
  generateCode,
  hashToken,
  requestPasswordReset,
  resetPassword,
  verifyResetCode
} from '../controllers/passwordReset.controller.js'

const serverRoot = path.resolve(import.meta.dirname, '..')
const source = async (relativePath) => readFile(path.join(serverRoot, relativePath), 'utf8')

const createRes = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this },
  json(payload) { this.body = payload; return this }
})

test('password hook does not re-hash an unchanged password and hashes a changed one', async () => {
  const hashed = await bcrypt.hash('Secret123', 4)
  const untouched = { password: hashed, isModified: () => false }
  await hashPasswordIfModified(untouched)
  assert.equal(untouched.password, hashed, 'an unmodified password must keep its existing hash')
  assert.equal(await bcrypt.compare('Secret123', untouched.password), true)

  const changed = { password: 'NewSecret456', isModified: (field) => field === 'password' }
  await hashPasswordIfModified(changed)
  assert.notEqual(changed.password, 'NewSecret456')
  assert.equal(await bcrypt.compare('NewSecret456', changed.password), true)
})

test('production CORS accepts only exact configured origins', () => {
  const env = { NODE_ENV: 'production', CORS_ORIGINS: 'https://staging.luxx.uz/, https://admin.luxx.uz' }
  const check = createOriginChecker(env)
  const verdict = (origin) => {
    let result
    check(origin, (error, allowed) => { result = { error: error?.message, allowed } })
    return result
  }

  assert.equal(verdict('https://luxx.uz').allowed, true)
  assert.equal(verdict('https://staging.luxx.uz').allowed, true)
  assert.equal(verdict(undefined).allowed, true)
  assert.equal(verdict('https://evil-shop.vercel.app').error, 'Not allowed by CORS')
  assert.equal(verdict('https://luxx.uz.evil.com').error, 'Not allowed by CORS')
  assert.ok(getAllowedOrigins(env).includes('https://admin.luxx.uz'))
})

test('server wires the strict CORS checker and no wildcard hosting suffix', async () => {
  const server = await source('server.js')
  assert.match(server, /createOriginChecker\(\)/)
  assert.doesNotMatch(server, /endsWith\(['"]\.vercel\.app['"]\)/)
  assert.match(server, /app\.use\('\/api\/auth\/password',\s*passwordLimiter\)/)
  assert.match(server, /app\.use\('\/api\/orders',\s*orderLimiter\)/)
})

test('SMS service never reports a fake success in production', async () => {
  const previous = { env: process.env.NODE_ENV, key: process.env.SMS_API_KEY, click: process.env.CLICK_SMS_LOGIN }
  try {
    process.env.NODE_ENV = 'production'
    smsService.smsApiKey = undefined
    smsService.clickSmsLogin = undefined
    const result = await smsService.sendSMS('+998901234567', 'test')
    assert.equal(result.success, false)
    assert.equal(result.simulated, undefined)

    process.env.NODE_ENV = 'development'
    const dev = await smsService.sendSMS('+998901234567', 'test')
    assert.equal(dev.success, true)
    assert.equal(dev.simulated, true)
  } finally {
    process.env.NODE_ENV = previous.env
    smsService.smsApiKey = previous.key
    smsService.clickSmsLogin = previous.click
  }
})

test('password reset codes are 6 digits and tokens are hashed deterministically', () => {
  for (let i = 0; i < 50; i += 1) assert.match(generateCode(), /^[1-9]\d{5}$/)
  assert.equal(hashToken('abc'), hashToken('abc'))
  assert.notEqual(hashToken('abc'), hashToken('abd'))
  assert.equal(hashToken('abc').length, 64)
})

test('password reset: wrong codes are counted and lock the record', async () => {
  const original = PasswordReset.findOne
  const record = { code: '123456', attempts: 0, used: false, saved: 0, async save() { this.saved += 1 } }
  PasswordReset.findOne = async () => record
  try {
    for (let i = 0; i < MAX_CODE_ATTEMPTS; i += 1) {
      const res = createRes()
      await verifyResetCode({ body: { phone: '+998901234567', code: '000000' } }, res)
      assert.equal(res.statusCode, 400)
    }
    assert.equal(record.attempts, MAX_CODE_ATTEMPTS)

    const locked = createRes()
    await verifyResetCode({ body: { phone: '+998901234567', code: '123456' } }, locked)
    assert.equal(locked.statusCode, 400, 'the correct code must be rejected after too many attempts')
    assert.equal(locked.body.success, false)
  } finally {
    PasswordReset.findOne = original
  }
})

test('password reset: a verified code yields an unguessable token, never the record id', async () => {
  const original = PasswordReset.findOne
  const record = { _id: '64b7f0f2c2a4a1a1a1a1a1a1', code: '654321', attempts: 0, used: false, async save() {} }
  PasswordReset.findOne = async () => record
  try {
    const res = createRes()
    await verifyResetCode({ body: { phone: '+998901234567', code: '654321' } }, res)
    assert.equal(res.statusCode, 200)
    assert.match(res.body.resetToken, /^[0-9a-f]{64}$/)
    assert.notEqual(res.body.resetToken, String(record._id))
    assert.equal(record.verified, true)
    assert.equal(record.resetTokenHash, hashToken(res.body.resetToken))
  } finally {
    PasswordReset.findOne = original
  }
})

test('password reset: guessing a record id cannot change a password', async () => {
  const originalFind = PasswordReset.findOne
  const originalUser = User.findById
  let userLookedUp = false
  const stored = { resetTokenHash: hashToken('real-token'), verified: true }
  PasswordReset.findOne = async (query) => (query.resetTokenHash === stored.resetTokenHash && query.verified === true ? stored : null)
  User.findById = async () => { userLookedUp = true; return null }
  try {
    const res = createRes()
    await resetPassword({ body: { resetToken: '64b7f0f2c2a4a1a1a1a1a1a1', password: 'newpass123' } }, res)
    assert.equal(res.statusCode, 400)
    assert.equal(userLookedUp, false, 'no user may be touched without a verified token')
  } finally {
    PasswordReset.findOne = originalFind
    User.findById = originalUser
  }
})

test('password reset request fails loudly and discards the code when SMS fails', async () => {
  const originals = { findOne: User.findOne, deleteMany: PasswordReset.deleteMany, create: PasswordReset.create, deleteOne: PasswordReset.deleteOne, send: smsService.sendSMS }
  let deleted = null
  User.findOne = async () => ({ _id: 'u1' })
  PasswordReset.deleteMany = async () => ({})
  PasswordReset.create = async () => ({ _id: 'r1' })
  PasswordReset.deleteOne = async (filter) => { deleted = filter }
  smsService.sendSMS = async () => ({ success: false, error: 'SMS provider is not configured' })
  try {
    const res = createRes()
    await requestPasswordReset({ body: { phone: '+998901234567' } }, res)
    assert.equal(res.statusCode, 503)
    assert.equal(res.body.success, false)
    assert.deepEqual(deleted, { _id: 'r1' })
  } finally {
    User.findOne = originals.findOne
    PasswordReset.deleteMany = originals.deleteMany
    PasswordReset.create = originals.create
    PasswordReset.deleteOne = originals.deleteOne
    smsService.sendSMS = originals.send
  }
})

test('validation: reset schema accepts either token field; orders are bounded', () => {
  assert.equal(schemas.newPassword.validate({ token: 'abc', password: 'secret1' }).error, undefined)
  assert.equal(schemas.newPassword.validate({ resetToken: 'abc', password: 'secret1' }).error, undefined)
  assert.ok(schemas.newPassword.validate({ password: 'secret1' }).error)

  const item = { product: '64b7f0f2c2a4a1a1a1a1a1a1', name: 'Kostyum', quantity: 1, price: 100 }
  const base = {
    customer: { name: 'Ali', phone: '+998901234567', address: 'Toshkent' },
    items: [item],
    totals: { subtotal: 100, deliveryFee: 0, total: 100 }
  }
  assert.equal(schemas.order.validate(base).error, undefined)
  assert.ok(schemas.order.validate({ ...base, items: [{ ...item, quantity: 11 }] }).error, 'quantity above 10 is rejected')
  assert.ok(schemas.order.validate({ ...base, items: Array.from({ length: 21 }, () => item) }).error, 'more than 20 lines is rejected')
})

test('orders cap open orders per phone and track staff notification', async () => {
  const controller = await source('controllers/order.controller.js')
  assert.match(controller, /MAX_OPEN_ORDERS_PER_PHONE\s*=\s*3/)
  assert.match(controller, /status:\s*429|status\(429\)/)
  assert.match(controller, /notifiedAt/)

  const model = await source('models/order.model.js')
  assert.match(model, /notifiedAt\s*:/)
  assert.match(model, /notifyAttempts\s*:/)

  const routes = await source('routes/order.route.js')
  assert.match(routes, /\/pending-count['"],\s*protect,\s*authorize\('admin',\s*'manager'\)/)
})

test('order notifier rebuilds the same payload the Telegram message needs', () => {
  const order = {
    _id: 'o1',
    customer: { name: 'Ali', phone: '+998901234567', address: 'Toshkent' },
    items: [{ name: 'Kostyum', quantity: 1, price: 100 }],
    totals: { subtotal: 100, total: 100 }
  }
  const payload = toTelegramPayload(order)
  assert.equal(payload.orderId, 'o1')
  assert.deepEqual(payload.lookDiscounts, [])
  assert.equal(payload.totalLookDiscount, 0)
  assert.equal(payload.customer.name, 'Ali')
})
