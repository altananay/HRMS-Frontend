/**
 * Plain-string design tokens. No imports, no functions — which is the entire point.
 *
 * A **server component cannot pass a function to a MUI component**, because MUI components are client
 * components and props crossing that boundary must be serializable. That rules out the two idioms the
 * MUI docs lean on hardest:
 *
 *   sx={(theme) => ({ … })}                 ← function prop
 *   sx={{ fontFamily: (theme) => … }}       ← function value inside the prop
 *   ...theme.applyStyles('dark', { … })     ← needs the theme, so needs the callback
 *
 * `next build` does not catch it: the pages that use them are dynamic, so nothing renders them until
 * a request arrives — and then every one of them 500s. These constants are what a server component
 * uses instead. Inside a `'use client'` component the callback forms are fine and preferred.
 */

/** Headings. Matches `typography.h1.fontFamily`; kept in one place so they cannot drift. */
export const displayFontFamily =
  'var(--font-display), "Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif';

/** Body and UI text. */
export const bodyFontFamily =
  'var(--font-body), Inter, system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * Nests a rule under the dark color scheme — the hand-written equivalent of
 * `theme.applyStyles('dark', …)`.
 *
 * The theme sets `cssVariables.colorSchemeSelector: 'class'`, so MUI's generated stylesheets and
 * `InitColorSchemeScript` both key off a `light` / `dark` class on `<html>`. `system` mode is resolved
 * to one of those two by that script, so the class is always present and this selector always applies.
 *
 * ```ts
 * sx={{ color: 'text.primary', [darkScheme]: { color: '#fff' } }}
 * ```
 */
export const darkScheme = '.dark &';

/** The header's height, needed by anything that has to sit clear of it (hero pull-up, scroll offsets). */
export const headerHeight = { xs: 64, md: 76 } as const;
