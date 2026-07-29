/**
 * Formats a date as the backend's `DateOnly` — `YYYY-MM-DD`.
 *
 * Reads the **local** calendar parts on purpose. `toISOString()` converts to UTC first, so a date
 * the user picked at local midnight in UTC+3 comes back as the previous day; the create validator
 * (`Deadline >= today`) then rejects a form that looked valid. See `format.test.ts`.
 */
export function toDateOnly(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
