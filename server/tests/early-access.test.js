import test from 'node:test';
import assert from 'node:assert/strict';
import { canSeeEarlyAccessProduct, earlyAccessVisibilityQuery } from '../controllers/product.controller.js';

const future = new Date(Date.now() + 24 * 60 * 60 * 1000);

test('Diamond early access remains exclusive to Diamond users', () => {
  const product = { earlyAccessTier: 'Diamond', earlyAccessUntil: future };

  assert.equal(canSeeEarlyAccessProduct(product, 'Bronze'), false);
  assert.equal(canSeeEarlyAccessProduct(product, 'Gold'), false);
  assert.equal(canSeeEarlyAccessProduct(product, 'Diamond'), true);
});

test('Gold early access is available to Gold and Diamond users only', () => {
  const product = { earlyAccessTier: 'Gold', earlyAccessUntil: future };

  assert.equal(canSeeEarlyAccessProduct(product, 'Bronze'), false);
  assert.equal(canSeeEarlyAccessProduct(product, 'Gold'), true);
  assert.equal(canSeeEarlyAccessProduct(product, 'Diamond'), true);
});

test('expired and open products remain visible to everyone', () => {
  assert.equal(canSeeEarlyAccessProduct({ earlyAccessTier: 'Diamond', earlyAccessUntil: new Date(Date.now() - 1000) }, 'Bronze'), true);
  assert.equal(canSeeEarlyAccessProduct({ earlyAccessTier: 'none', earlyAccessUntil: null }, 'Bronze'), true);
});

test('visibility query excludes future Diamond products for Gold users', () => {
  const query = earlyAccessVisibilityQuery('Gold', future);

  assert.deepEqual(query, {
    $or: [
      { earlyAccessUntil: null },
      { earlyAccessUntil: { $lte: future } },
      { earlyAccessTier: 'none' },
      { earlyAccessTier: { $ne: 'Diamond' } },
    ],
  });
});
