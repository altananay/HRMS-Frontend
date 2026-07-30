import { toDateOnly } from '@/lib/format';

import type { DateOnlyString } from '@/contracts/envelope';

/**
 * Whether an opening's closing date has passed.
 *
 * **Compared as dates, not as timestamps**, and that is the whole reason this is a function rather
 * than one line in a component.
 *
 * `new Date('2026-09-01')` parses as *UTC* midnight. Comparing that to `Date.now()` in UTC+3 makes an
 * opening whose deadline is today look closed from 03:00 local onwards — the last day of applications
 * silently disappears, and only for users east of Greenwich. The backend's rule is
 * `Deadline >= DateOnly.FromDateTime(UtcNow)`: a whole-day comparison.
 *
 * ISO dates sort lexicographically, so comparing the two `YYYY-MM-DD` strings is both correct and
 * exact — no parsing, no zone, nothing to get wrong.
 */
export function isDeadlinePassed(deadline: DateOnlyString, now: Date = new Date()): boolean {
  return deadline < toDateOnly(now);
}
