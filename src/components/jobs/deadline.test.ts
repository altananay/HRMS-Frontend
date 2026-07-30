import { describe, expect, it } from 'vitest';

import { isDeadlinePassed } from './deadline';

/** Local 06:00 on 1 September 2026 — well after UTC midnight, which is where the bug lived. */
const morningOfTheFirst = new Date(2026, 8, 1, 6, 0, 0);

describe('isDeadlinePassed', () => {
  it('should_BeOpen_OnTheDeadlineDayItself', () => {
    // The regression this exists for. `new Date('2026-09-01').getTime() < Date.now()` is true from
    // 03:00 local in UTC+3, so the last day of applications vanished — for eastern users only, which
    // is exactly the kind of bug nobody reproduces.
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
    // Lexicographic comparison only works because the parts are zero-padded — worth pinning.
    expect(isDeadlinePassed('2026-09-30', new Date(2026, 9, 1, 12))).toBe(true);
    expect(isDeadlinePassed('2027-01-01', new Date(2026, 11, 31, 23))).toBe(false);
  });
});
