import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { MIN_INTERVAL_MS, requestSiteRebuild, resetSiteRebuildThrottle } from '../utils/siteRebuild.js'

const serverRoot = path.resolve(import.meta.dirname, '..')
const source = async (relativePath) => readFile(path.join(serverRoot, relativePath), 'utf8')

const okFetch = () => {
  const calls = []
  const fetchImpl = async (url, options) => { calls.push({ url, method: options.method }); return { ok: true, status: 200 } }
  return { calls, fetchImpl }
}

test('no deploy hook configured means no request and no error', async () => {
  resetSiteRebuildThrottle()
  const { calls, fetchImpl } = okFetch()
  const result = await requestSiteRebuild('test', { hookUrl: '', fetchImpl })
  assert.deepEqual(result, { triggered: false, why: 'no-hook' })
  assert.equal(calls.length, 0)
})

test('a burst of edits triggers one rebuild, the next one after the interval', async () => {
  resetSiteRebuildThrottle()
  const { calls, fetchImpl } = okFetch()
  const hookUrl = 'https://api.vercel.com/v1/integrations/deploy/test'
  const start = 1_000_000

  assert.equal((await requestSiteRebuild('a', { hookUrl, fetchImpl, now: start })).triggered, true)
  assert.equal((await requestSiteRebuild('b', { hookUrl, fetchImpl, now: start + 1000 })).why, 'throttled')
  assert.equal((await requestSiteRebuild('c', { hookUrl, fetchImpl, now: start + MIN_INTERVAL_MS })).triggered, true)
  assert.equal(calls.length, 2)
  assert.equal(calls[0].method, 'POST')
})

test('a failed ping never throws and allows an immediate retry', async () => {
  resetSiteRebuildThrottle()
  const hookUrl = 'https://api.vercel.com/v1/integrations/deploy/test'
  const failing = async () => { throw new Error('network down') }
  const result = await requestSiteRebuild('x', { hookUrl, fetchImpl: failing, now: 5_000_000 })
  assert.deepEqual(result, { triggered: false, why: 'error' })

  const { calls, fetchImpl } = okFetch()
  assert.equal((await requestSiteRebuild('y', { hookUrl, fetchImpl, now: 5_000_001 })).triggered, true)
  assert.equal(calls.length, 1)
})

test('product and article writes ask for a storefront rebuild', async () => {
  const products = await source('controllers/product.controller.js')
  const blogs = await source('controllers/blog.controller.js')
  for (const reason of ['product created', 'product updated', 'product deleted']) {
    assert.match(products, new RegExp(`requestSiteRebuild\\('${reason}'\\)`))
  }
  for (const reason of ['article published', 'article updated', 'article deleted']) {
    assert.match(blogs, new RegExp(`requestSiteRebuild\\('${reason}'\\)`))
  }
})
