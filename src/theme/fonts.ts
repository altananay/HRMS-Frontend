import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

/**
 * `next/font/google` downloads the font files **at build time** and serves them from our own origin
 * — there is no runtime request to Google and no `<link>` to a third party. It also emits the
 * `size-adjust` metrics for the fallback, which is what keeps the layout from shifting once the real
 * face arrives.
 *
 * Two faces on purpose: a geometric display face carries the headings, Inter carries body and UI
 * text where legibility at 15px matters more than character.
 *
 * Only `layout.tsx` imports this. `theme.ts` refers to the CSS variables by name so it stays plain
 * TypeScript that Vitest can load.
 */

export const bodyFont = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const displayFont = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

/** `latin-ext` above is not optional: Turkish needs ı, İ, ş, ğ, ç and the dotless-i pair. */
export const fontClassNames = `${bodyFont.variable} ${displayFont.variable}`;
