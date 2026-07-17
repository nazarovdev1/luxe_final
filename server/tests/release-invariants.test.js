import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const serverRoot = path.resolve(import.meta.dirname, '..')
const source = async (relativePath) => readFile(path.join(serverRoot, relativePath), 'utf8')

test('style poll management routes require an administrative role', async () => {
  const routes = await source('routes/stylePoll.routes.js')

  assert.match(routes, /import\s*\{[^}]*\b(?:admin|authorize)\b[^}]*\}\s*from\s*['"]\.\.\/middleware\/auth\.middleware\.js['"]/s)
  for (const method of ['get', 'post', 'put', 'delete']) {
    const routePattern = new RegExp(`router\\.${method}\\([^\\n]+protect,\\s*(?:admin|authorize\\([^)]*admin[^)]*\\))`)
    assert.match(routes, routePattern, `${method.toUpperCase()} management route must enforce an admin role`)
  }
})

test('Telegram credentials never fall back to source-controlled values', async () => {
  const telegram = await source('services/telegram.service.js')

  assert.doesNotMatch(telegram, /TELEGRAM_BOT_TOKEN\s*\|\|/)
  assert.doesNotMatch(telegram, /TELEGRAM_CHAT_ID\s*\|\|/)
  assert.doesNotMatch(telegram, /bot\d{6,}:[A-Za-z0-9_-]+/)
  assert.match(telegram, /(?:escapeHtml|escapeHTML)\s*[=(]/)
  assert.match(telegram, /(?:escapeHtml|escapeHTML)\(customer\.(?:name|address|comments)\)/)
})

test('gift card creation is restricted to staff', async () => {
  const routes = await source('routes/giftCard.routes.js')

  assert.match(routes, /router\.post\(\s*['"]\/['"]\s*,\s*protect\s*,\s*(?:admin|authorize\([^)]*(?:admin|manager)[^)]*\))/)
})

test('checkout does not trust client-supplied delivery fees or look discount totals', async () => {
  const controller = await source('controllers/order.controller.js')

  assert.doesNotMatch(controller, /deliveryFee\s*=\s*clampMoney\(totals\.deliveryFee\)/)
  assert.doesNotMatch(controller, /processedLookDiscounts\s*=\s*lookDiscounts/)
})

test('orders persist payment state and enforce idempotency uniqueness', async () => {
  const model = await source('models/order.model.js')

  assert.match(model, /paymentStatus\s*:/)
  assert.match(model, /providerTransactionId\s*:/)
  assert.match(model, /idempotencyKey\s*:/)
  assert.match(model, /index\(\s*\{\s*idempotencyKey:\s*1\s*\}\s*,\s*\{[^}]*unique:\s*true[^}]*sparse:\s*true/s)
})

test('products expose variant-level stock and checkout performs an atomic stock update', async () => {
  const productModel = await source('models/product.model.js')
  const orderController = await source('controllers/order.controller.js')

  assert.match(productModel, /variantSchema[\s\S]*?stock\s*:/)
  assert.match(productModel, /variants\s*:/)
  assert.match(orderController, /(?:findOneAndUpdate|updateOne)\s*\(/)
  assert.match(orderController, /\$(?:inc|set)\s*:/)
})
