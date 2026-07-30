/**
 * Named date, time and number formats, shared by every screen.
 *
 * Two reasons this file exists rather than options objects scattered at call sites.
 *
 * The first is consistency: a deadline should look the same on a card, on the detail page and in a
 * table, and that only happens if there is one definition.
 *
 * The second is that **an undeclared format name fails silently**. `format.dateTime(date, 'short')`
 * with no `short` declared does not throw — it renders the raw `Date.toString()`, so a job board ends
 * up showing `Thu Oct 29 2026 03:00:00 GMT+0300` where it meant to show `29 Eki 2026`. Declaring them
 * here and augmenting `AppConfig` with `typeof formats` turns a wrong name into a compile error.
 */
export const formats = {
  dateTime: {
    /** Dense contexts — cards, table cells. `29 Eki 2026`. */
    short: {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
    /** Detail pages, where there is room to read. `29 Ekim 2026`. */
    long: {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
    /** When the time of day carries information — an application's status change. */
    dateTime: {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  },
} as const;
