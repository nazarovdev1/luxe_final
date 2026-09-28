import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { schemas } from '../middleware/validate.middleware.js'

const serverRoot = path.resolve(import.meta.dirname, '..')
const source = async (relativePath) => readFile(path.join(serverRoot, relativePath), 'utf8')

const validObjectId = '507f1f77bcf86cd799439011'

const createValidOrder = () => ({
  customer: {
    name: 'Madina Karimova',
    phone: '+998901234567',
    address: 'Toshkent shahar, Mirobod tumani, Nukus ko\'chasi 12-uy',
    comments: 'Eshik qo\'ng\'irog\'ini bosing',
  },
  items: [
    {
      product: validObjectId,
      name: 'Cashmere Double-Breasted Coat',
      image: 'https://images.unsplash.com/photo-test',
      quantity: 1,
      price: 2400000,
      selectedColor: 'Noir',
      selectedSize: 'M',
    },
  ],
  totals: {
    subtotal: 2400000,
    deliveryFee: 0,
    discountAmount: 0,
    total: 2400000,
  },
  paymentMethod: 'cash_on_delivery',
  idempotencyKey: 'idem-order-key-123456',
})

test('order schema accepts a complete valid order payload', () => {
  const order = createValidOrder()
  const { error, value } = schemas.order.validate(order)
  assert.equal(error, undefined, 'Valid order payload must pass validation')
  assert.equal(value.customer.name, 'Madina Karimova')
  assert.equal(value.items.length, 1)
  assert.equal(value.paymentMethod, 'cash_on_delivery')
})

test('order schema rejects empty items array or non-positive quantities', () => {
  // Empty items array
  const emptyItemsOrder = createValidOrder()
  emptyItemsOrder.items = []
  const { error: emptyError } = schemas.order.validate(emptyItemsOrder)
  assert.ok(emptyError, 'Order with empty items array must be rejected')

  // Zero quantity
  const zeroQtyOrder = createValidOrder()
  zeroQtyOrder.items[0].quantity = 0
  const { error: zeroQtyError } = schemas.order.validate(zeroQtyOrder)
  assert.ok(zeroQtyError, 'Item quantity equal to 0 must be rejected')

  // Negative quantity
  const negQtyOrder = createValidOrder()
  negQtyOrder.items[0].quantity = -2
  const { error: negQtyError } = schemas.order.validate(negQtyOrder)
  assert.ok(negQtyError, 'Negative item quantity must be rejected')
})

test('order schema enforces 24-character hex ObjectId for product references', () => {
  const badProductOrder = createValidOrder()
  badProductOrder.items[0].product = 'invalid-mongo-id'
  const { error } = schemas.order.validate(badProductOrder)
  assert.ok(error, 'Product ID not conforming to 24-char ObjectId must be rejected')
})

test('order schema requires valid customer phone and shipping address', () => {
  // Missing customer address
  const noAddressOrder = createValidOrder()
  delete noAddressOrder.customer.address
  const { error: noAddrError } = schemas.order.validate(noAddressOrder)
  assert.ok(noAddrError, 'Missing customer address must fail validation')

  // Invalid customer phone format
  const badPhoneOrder = createValidOrder()
  badPhoneOrder.customer.phone = '12345'
  const { error: badPhoneError } = schemas.order.validate(badPhoneOrder)
  assert.ok(badPhoneError, 'Phone number not matching +998XXXXXXXXX format must fail')
})

test('order schema rejects negative prices and negative totals', () => {
  const negPriceOrder = createValidOrder()
  negPriceOrder.items[0].price = -500
  const { error: priceError } = schemas.order.validate(negPriceOrder)
  assert.ok(priceError, 'Negative item price must fail validation')

  const negTotalOrder = createValidOrder()
  negTotalOrder.totals.total = -100
  const { error: totalError } = schemas.order.validate(negTotalOrder)
  assert.ok(totalError, 'Negative order total must fail validation')
})

test('order schema validates idempotency key constraints', () => {
  const shortIdemOrder = createValidOrder()
  shortIdemOrder.idempotencyKey = 'short' // < 8 characters
  const { error: shortError } = schemas.order.validate(shortIdemOrder)
  assert.ok(shortError, 'Idempotency key shorter than 8 chars must fail')

  const validIdemOrder = createValidOrder()
  validIdemOrder.idempotencyKey = 'c9a29e2f-5192-4f36-96b6-9bb828da0ff9'
  const { error: validError } = schemas.order.validate(validIdemOrder)
  assert.equal(validError, undefined, 'UUID length idempotency key must pass validation')
})

test('order routes enforce validation on creation and admin authorization on admin endpoints', async () => {
  const routeCode = await source('routes/order.route.js')

  // Creation validates schema
  assert.match(routeCode, /router\.post\(\s*['"]\/['"]\s*,\s*(?:optionalProtect,\s*)?validate\(['"]order['"]\)/)

  // Listing all orders requires admin or manager
  assert.match(routeCode, /router\.get\(\s*['"]\/all['"]\s*,\s*protect\s*,\s*authorize\(['"]admin['"],\s*['"]manager['"]\)/)

  // Status update requires admin or manager
  assert.match(routeCode, /router\.patch\(\s*['"]\/:id\/status['"]\s*,\s*protect\s*,\s*authorize\(['"]admin['"],\s*['"]manager['"]\)/)

  // Order deletion requires admin or manager
  assert.match(routeCode, /router\.delete\(\s*['"]\/:id['"]\s*,\s*protect\s*,\s*authorize\(['"]admin['"],\s*['"]manager['"]\)/)
})
