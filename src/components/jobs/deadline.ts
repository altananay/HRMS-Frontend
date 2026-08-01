import { toDateOnly } from '@/lib/format';

import type { DateOnlyString } from '@/contracts/envelope';

export function isDeadlinePassed(deadline: DateOnlyString, now: Date = new Date()): boolean {
  return deadline < toDateOnly(now);
}
