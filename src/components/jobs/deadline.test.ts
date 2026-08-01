import { describe, expect, it } from 'vitest';

import { isDeadlinePassed } from './deadline';

const morningOfTheFirst = new Date(2026, 8, 1, 6, 0, 0);

describe('isDeadlinePassed', () => {
  it('should_BeOpen_OnTheDeadlineDayItself', () => {
    expect(isDeadlinePassed('2026-09-01', morningOfTheFirst)).toBe(false);
  });

  it('should_BeOpen_LateOnTheDeadlineDay', () => {
    expect(isDeadlinePassed('2026-09-01', new Date(2026, 8, 1, 23, 59, 59))).toBe(false);
  });

  it('should_BeClosed_TheFollowingDay', () => {
    expect(isDeadlinePassed('2026-09-01', new Date(2026, 8, 2, 0, 0, 1))).toBe(true);
  });

  it('should_BeOpen_ForAFutureDeadline', () => {
    expect(isDeadlinePassed('2026-12-31', morningOfTheFirst)).toBe(false);
  });

  it('should_CompareAcrossMonthAndYearBoundaries', () => {
    expect(isDeadlinePassed('2026-09-30', new Date(2026, 9, 1, 12))).toBe(true);
    expect(isDeadlinePassed('2027-01-01', new Date(2026, 11, 31, 23))).toBe(false);
  });
});
