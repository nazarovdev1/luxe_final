import test from 'node:test';
import assert from 'node:assert/strict';
import { earlyAccessVisibilityQuery } from '../controllers/product.controller.js';
import { schemas } from '../middleware/validate.middleware.js';

test('public visibility query matches legacy products without early-access fields', () => {
  const now = new Date();
  const query = earlyAccessVisibilityQuery('Bronze', now);
  const conditions = query.$or;

  assert.ok(Array.isArray(conditions));
  assert.ok(conditions.some((c) => c.earlyAccessUntil === null));
  assert.ok(conditions.some((c) => c.earlyAccessUntil && c.earlyAccessUntil.$exists === false));
  assert.ok(conditions.some((c) => c.earlyAccessTier && c.earlyAccessTier.$exists === false));
});

test('gold query hides only future diamond exclusives', () => {
  const future = new Date(Date.now() + 3600000);
  const query = earlyAccessVisibilityQuery('Gold', future);

  assert.deepEqual(query, {
    $or: [
      { earlyAccessTier: { $ne: 'Diamond' } },
      { earlyAccessUntil: { $lte: future } },
    ],
  });
});

test('product validation accepts mobile-style string image urls', () => {
  const { error, value } = schemas.product.validate({
    name: 'Test product',
    description: 'Test description',
    price: 1000,
    category: 'Shim',
    images: ['https://example.com/a.jpg'],
  });

  assert.ok(!error);
  assert.equal(value.images[0], 'https://example.com/a.jpg');
});

test('product validation accepts desktop-style image objects', () => {
  const { error } = schemas.product.validate({
    name: 'Test product',
    description: 'Test description',
    price: 1000,
    category: 'Shim',
    images: [{ url: 'https://example.com/a.jpg' }],
  });

  assert.ok(!error);
});

test('product validation still rejects a missing image list', () => {
  const { error } = schemas.product.validate({
    name: 'Test product',
    description: 'Test description',
    price: 1000,
    category: 'Shim',
    images: [],
  });

  assert.ok(error);
});
