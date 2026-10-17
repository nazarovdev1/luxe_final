import { describe, expect, it } from 'vitest';
import { formatPrice, formatSaleNote, getActiveSale, getDisplayBadge, getReviewSummary } from './productDisplay';

describe('getReviewSummary', () => {
  it('hides a rating that has no reviews behind it', () => {
    expect(getReviewSummary({ rating: 5, numOfReviews: 0 }).show).toBe(false);
    expect(getReviewSummary({ rating: 4 }).show).toBe(false);
    expect(getReviewSummary({}).show).toBe(false);
  });

  it('shows the rounded average when real reviews exist', () => {
    expect(getReviewSummary({ rating: 4.333, numOfReviews: 3 })).toEqual({ show: true, rating: 4.3, count: 3 });
  });
});

describe('getActiveSale', () => {
  const product = { price: 1499000, originalPrice: 1850000 };

  it('treats a crossed-out price as a dated promotion', () => {
    const sale = getActiveSale({ ...product, saleEndsAt: '2026-12-31T23:59:59+05:00' }, new Date('2026-11-01'));
    expect(sale.active).toBe(true);
    expect(sale.percent).toBe(19);
    expect(sale.originalPrice).toBe(1850000);
  });

  it('falls back to the opening promotion end date and expires after it', () => {
    expect(getActiveSale(product, new Date('2026-12-30T12:00:00+05:00')).active).toBe(true);
    expect(getActiveSale(product, new Date('2027-01-01T00:00:01+05:00')).active).toBe(false);
  });

  it('ignores an original price that is not higher than the price', () => {
    expect(getActiveSale({ price: 2000000, originalPrice: 2000000 }, new Date('2026-11-01')).active).toBe(false);
    expect(getActiveSale({ price: 2000000, originalPrice: null }, new Date('2026-11-01')).active).toBe(false);
  });
});

describe('getDisplayBadge', () => {
  it('drops unbacked bestseller claims but keeps factual badges', () => {
    expect(getDisplayBadge({ badge: 'BESTSELLER' })).toBe('');
    expect(getDisplayBadge({ badge: 'NEW' })).toBe('NEW');
    expect(getDisplayBadge({ badge: 'LIMITED' })).toBe('LIMITED');
  });
});

describe('formatting', () => {
  it('formats the sale note in each language', () => {
    const end = '2026-12-31T23:59:59+05:00';
    expect(formatSaleNote(end, 'uz')).toBe('Ochilish narxi · 31-dekabrgacha');
    expect(formatSaleNote(end, 'ru')).toBe('Цена открытия · до 31 декабря');
    expect(formatSaleNote(end, 'en')).toBe('Opening price · until December 31');
  });

  it('groups thousands with spaces', () => {
    expect(formatPrice(2800000)).toBe('2 800 000');
  });
});
