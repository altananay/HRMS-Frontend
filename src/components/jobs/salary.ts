import type { getFormatter } from 'next-intl/server';

import type { JobAdvertisementResponse } from '@/contracts/responses';

type Formatter = Awaited<ReturnType<typeof getFormatter>>;

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
