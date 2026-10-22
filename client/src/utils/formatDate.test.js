import { describe, expect, it } from 'vitest';
import { formatUzDate, formatUzMonthShort, formatUzWeekday } from './formatDate';

describe('formatUzDate', () => {
  const date = new Date(2026, 9, 3, 9, 5);

  it('writes the Uzbek month name instead of relying on browser locale data', () => {
    expect(formatUzDate(date)).toBe('3-oktabr, 2026');
    expect(formatUzDate(date, { year: false })).toBe('3-oktabr');
    expect(formatUzDate(date, { short: true, year: false })).toBe('3-okt');
    expect(formatUzDate(date, { time: true })).toBe('3-oktabr, 2026, 09:05');
  });

  it('returns an empty label for missing or invalid dates', () => {
    expect(formatUzDate(null)).toBe('');
    expect(formatUzDate('not a date')).toBe('');
  });

  it('gives short weekday and month names', () => {
    expect(formatUzWeekday(date)).toBe('Shan');
    expect(formatUzMonthShort(date)).toBe('okt');
  });
});
