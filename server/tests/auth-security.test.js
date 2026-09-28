import test from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { schemas } from '../middleware/validate.middleware.js'
import { protect, authorize, admin } from '../middleware/auth.middleware.js'

test('register schema validates username, Uzbek phone format, and password length', () => {
  const validPayload = {
    username: 'luxe_vip_client',
    phone: '+998901234567',
    password: 'supersecretpass',
  }
  const { error: validError } = schemas.register.validate(validPayload)
  assert.equal(validError, undefined, 'Valid registration payload must pass validation')

  // Username too short (<3)
  const shortUsername = { ...validPayload, username: 'ab' }
  const { error: shortUserError } = schemas.register.validate(shortUsername)
  assert.ok(shortUserError, 'Username shorter than 3 characters must fail')

  // Username with forbidden characters
  const badCharUsername = { ...validPayload, username: 'user@name!' }
  const { error: badCharError } = schemas.register.validate(badCharUsername)
  assert.ok(badCharError, 'Username with special characters must fail pattern check')

  // Phone without +998 prefix or wrong length
  const invalidPhones = ['998901234567', '+12025550143', '+99890123456', '+9989012345678', 'abc']
  for (const phone of invalidPhones) {
    const { error: phoneError } = schemas.register.validate({ ...validPayload, phone })
    assert.ok(phoneError, `Phone format '${phone}' must fail validation`)
  }

  // Password shorter than 6 characters
  const shortPassword = { ...validPayload, password: '12345' }
  const { error: shortPassError } = schemas.register.validate(shortPassword)
  assert.ok(shortPassError, 'Password shorter than 6 characters must fail')
})

test('login schema enforces presence of identifier and password', () => {
  const { error: validError } = schemas.login.validate({
    identifier: '+998901234567',
    password: 'myPassword1',
  })
  assert.equal(validError, undefined, 'Valid login payload must pass')

  const { error: missingIdError } = schemas.login.validate({
    password: 'myPassword1',
  })
  assert.ok(missingIdError, 'Login without identifier must fail')

  const { error: missingPassError } = schemas.login.validate({
    identifier: '+998901234567',
  })
  assert.ok(missingPassError, 'Login without password must fail')
})

test('protect middleware rejects requests without valid Bearer token', async () => {
  const createMockRes = () => {
    const res = {
      statusCode: 200,
      jsonPayload: null,
      status(code) {
        this.statusCode = code
        return this
      },
      json(payload) {
        this.jsonPayload = payload
        return this
      },
    }
    return res
  }

  // 1. Missing authorization header
  const reqNoHeader = { headers: {} }
  const resNoHeader = createMockRes()
  let nextCalled = false
  await protect(reqNoHeader, resNoHeader, () => { nextCalled = true })
  assert.equal(nextCalled, false)
  assert.equal(resNoHeader.statusCode, 401)
  assert.equal(resNoHeader.jsonPayload?.success, false)

  // 2. Non-Bearer authorization header
  const reqBadHeader = { headers: { authorization: 'Basic dXNlcjpwYXNz' } }
  const resBadHeader = createMockRes()
  nextCalled = false
  await protect(reqBadHeader, resBadHeader, () => { nextCalled = true })
  assert.equal(nextCalled, false)
  assert.equal(resBadHeader.statusCode, 401)

  // 3. Malformed / tampered JWT token
  const reqBadToken = { headers: { authorization: 'Bearer invalid.tampered.jwt' } }
  const resBadToken = createMockRes()
  nextCalled = false
  await protect(reqBadToken, resBadToken, () => { nextCalled = true })
  assert.equal(nextCalled, false)
  assert.equal(resBadToken.statusCode, 401)
})

test('authorize middleware permits authorized roles and blocks others with 403', () => {
  const mockRes = {
    statusCode: 200,
    jsonPayload: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.jsonPayload = payload
      return this
    },
  }

  const adminOnly = authorize('admin')

  // Normal user blocked
  let nextCalled = false
  const userReq = { user: { _id: '123', role: 'user' } }
  adminOnly(userReq, mockRes, () => { nextCalled = true })
  assert.equal(nextCalled, false)
  assert.equal(mockRes.statusCode, 403)

  // Admin permitted
  nextCalled = false
  const adminReq = { user: { _id: '456', role: 'admin' } }
  adminOnly(adminReq, mockRes, () => { nextCalled = true })
  assert.equal(nextCalled, true)

  // Multiple roles allowed (e.g. admin or manager)
  const staffOnly = authorize('admin', 'manager')
  nextCalled = false
  staffOnly({ user: { _id: '789', role: 'manager' } }, mockRes, () => { nextCalled = true })
  assert.equal(nextCalled, true)
})

test('admin middleware restricts access strictly to admin and manager roles', () => {
  const mockRes = {
    statusCode: 200,
    jsonPayload: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.jsonPayload = payload
      return this
    },
  }

  let nextCalled = false
  admin({ user: { _id: '1', role: 'user' } }, mockRes, () => { nextCalled = true })
  assert.equal(nextCalled, false)
  assert.equal(mockRes.statusCode, 401)

  nextCalled = false
  admin({ user: { _id: '2', role: 'admin' } }, mockRes, () => { nextCalled = true })
  assert.equal(nextCalled, true)

  nextCalled = false
  admin({ user: { _id: '3', role: 'manager' } }, mockRes, () => { nextCalled = true })
  assert.equal(nextCalled, true)
})

test('bcrypt password hashing and verification invariants', async () => {
  const plainPassword = 'CoutureLuxePassword2026'
  const salt = await bcrypt.genSalt(10)
  const hashed = await bcrypt.hash(plainPassword, salt)

  assert.notEqual(hashed, plainPassword, 'Hashed password must never equal plain password')
  assert.ok(hashed.startsWith('$2'), 'Hashed password must use standard bcrypt format')

  const isMatch = await bcrypt.compare(plainPassword, hashed)
  assert.equal(isMatch, true, 'bcrypt.compare must resolve true for correct plain password')

  const isWrongMatch = await bcrypt.compare('WrongPassword999', hashed)
  assert.equal(isWrongMatch, false, 'bcrypt.compare must resolve false for incorrect password')
})
