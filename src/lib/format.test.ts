import { describe, expect, it } from 'vitest';

import { toDateOnly } from './format';

describe('toDateOnly', () => {
  // The bug this guards: `new Date(...).toISOString().slice(0, 10)` converts to UTC first, so a
  // local midnight in UTC+3 becomes the previous day. The backend's create validator then rejects
  // a deadline the user picked as valid — and nothing in the UI explains why.
  it('keeps the local calendar date rather than shifting to UTC', () => {
    const localMidnight = new Date(2026, 8, 1, 0, 0, 0);

    expect(toDateOnly(localMidnight)).toBe('2026-09-01');
  });

  it('pads month and day to two digits', () => {
    expect(toDateOnly(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('is stable across the end of a month', () => {
    expect(toDateOnly(new Date(2026, 11, 31, 23, 59, 59))).toBe('2026-12-31');
  });
});
