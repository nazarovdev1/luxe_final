import { describe, expect, it } from 'vitest';
import { isFeatureEnabled, parseEnabledFeatures } from '../features';
import { RETURN_DAYS, WARRANTY_DAYS } from '../policies';
import { eventNavItems } from '../navigation';
import { normalizeUzPhone, PHONE_PATTERN } from '../../components/BackInStockButton';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('optional features', () => {
  it('hides community modules unless explicitly enabled', () => {
    expect(isFeatureEnabled('live', '')).toBe(false);
    expect(isFeatureEnabled('live', 'live')).toBe(true);
    expect(isFeatureEnabled('style-feed', ' live , style-feed ')).toBe(true);
    expect(isFeatureEnabled('challenges', 'live')).toBe(false);
  });

  it('never hides regular features', () => {
    expect(isFeatureEnabled('vip-club', '')).toBe(true);
  });

  it('parses empty values safely', () => {
    expect(parseEnabledFeatures(undefined).size).toBe(0);
  });

  it('navigation omits gated items by default', () => {
    const ids = eventNavItems.map((item) => item.id);
    expect(ids).not.toContain('live');
    expect(ids).toContain('vip-club');
  });
});

describe('policies', () => {
  it('uses one return window everywhere', () => {
    expect(RETURN_DAYS).toBe(14);
    expect(WARRANTY_DAYS).toBeGreaterThan(0);
    const dump = readFileSync(path.resolve(process.cwd(), 'src/data/translations.js'), 'utf8');
    expect(dump).not.toMatch(/\b7\s*(kun|дн|day)/i);
  });
});

describe('back-in-stock phone handling', () => {
  it('normalizes common Uzbek phone formats', () => {
    for (const raw of ['90 123 45 67', '998901234567', '+998 90 123-45-67']) {
      expect(normalizeUzPhone(raw)).toBe('+998901234567');
      expect(PHONE_PATTERN.test(normalizeUzPhone(raw))).toBe(true);
    }
    expect(PHONE_PATTERN.test(normalizeUzPhone('12345'))).toBe(false);
  });
});
