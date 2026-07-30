import type { getFormatter } from 'next-intl/server';

import type { JobAdvertisementResponse } from '@/contracts/responses';

/**
 * next-intl's formatter, taken from the function that produces it rather than described by hand.
 * Its `NumberFormatOptions` is stricter than `Intl.NumberFormatOptions`, so a structural stand-in
 * does not satisfy it — and the same type covers `useFormatter()` on the client.
 */
type Formatter = Awaited<ReturnType<typeof getFormatter>>;

/**
 * Renders a salary range the way a reader expects, from three nullable fields.
 *
 * All four combinations occur in real data and each reads differently: a range, a floor, a ceiling,
 * or nothing at all. Rendering `null – null` or a bare `0` would be worse than saying nothing.
 *
 * `currency` is a three-letter ISO code when present. When it is absent the number is formatted
 * plainly rather than guessed at — showing an amount in the wrong currency is a real way to mislead
 * someone about a job offer.
 */
export function formatSalary(
  job: Pick<JobAdvertisementResponse, 'minSalary' | 'maxSalary' | 'currency'>,
  format: Formatter,
  t: (key: 'salaryFrom' | 'salaryTo' | 'salaryRange' | 'salaryUndisclosed', values?: Record<string, string>) => string,
): string {
  const { minSalary, maxSalary, currency } = job;

  if (minSalary === null && maxSalary === null) return t('salaryUndisclosed');

  const money = (value: number) =>
    currency
      ? format.number(value, { style: 'currency', currency, maximumFractionDigits: 0 })
      : format.number(value, { maximumFractionDigits: 0 });

  if (minSalary !== null && maxSalary !== null) {
    return t('salaryRange', { min: money(minSalary), max: money(maxSalary) });
  }

  return minSalary !== null
    ? t('salaryFrom', { min: money(minSalary) })
    : t('salaryTo', { max: money(maxSalary as number) });
}
