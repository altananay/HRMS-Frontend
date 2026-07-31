/**
 * The raw colour scales. Kept separate from `theme.ts` so a tone can be referenced directly
 * (gradients, canvas, chart series) without reaching into a built theme object.
 *
 * Three families, each a proper 50→950 tonal ramp so light and dark can pick different rungs
 * instead of relying on `alpha()` guesses:
 *
 *   brand    a cool cobalt — the trust colour, used for structure and primary actions
 *   accent   a warm amber — used sparingly, and only where we want the eye to land
 *   neutral  slate with a blue undertone; pure grey next to a blue brand reads muddy
 */

export const brand = {
  50: '#EFF4FF',
  100: '#DBE6FE',
  200: '#BFD3FE',
  300: '#93B4FD',
  400: '#608EFA',
  500: '#3B6AF5',
  600: '#2551EA',
  700: '#1D3ED7',
  800: '#1E37AE',
  900: '#1E3389',
  950: '#172255',
} as const;

export const accent = {
  50: '#FFF8EB',
  100: '#FFECC6',
  200: '#FFD788',
  300: '#FFBC4A',
  400: '#FFA31F',
  500: '#F98107',
  600: '#DD5D02',
  700: '#B74006',
  800: '#94310C',
  900: '#7A290D',
  950: '#461302',
} as const;

export const neutral = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E4EAF1',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#111C2E',
  950: '#0A1320',
} as const;

/**
 * The semantic colours, one set per colour scheme.
 *
 * They cannot be shared. `main` does double duty — it fills a chip or an alert **and** it colours
 * text on the page background — and those two jobs pull in opposite directions once the background
 * flips. A green dark enough for white text on a light page is nearly invisible as text on a dark
 * one, and the reverse is worse: the original single set filled chips at 3.47:1, which is what axe
 * caught on `/admin/users`.
 *
 * So: light gets dark fills with white text, dark gets bright fills with near-black text. Every pair
 * below is ≥ 4.5:1 (checked at both ends — fill against its own text, and `main` as text against the
 * page). Change one and re-check the other; `e2e/a11y.spec.ts` scans both schemes.
 */
export const success = {
  light: '#34D399',
  main: '#0A7F57', // 5.02:1 with white
  dark: '#04563E',
  contrastText: '#FFFFFF',
} as const;

export const warning = {
  light: '#FBBF24',
  main: '#B45309', // 5.02:1
  dark: '#7C3D06',
  contrastText: '#FFFFFF',
} as const;

export const error = {
  light: '#F87171',
  main: '#DC2626', // 4.83:1 — already passing, left alone
  dark: '#991B1B',
  contrastText: '#FFFFFF',
} as const;

export const info = {
  light: '#38BDF8',
  main: '#0369A1', // 5.93:1
  dark: '#0B4A6F',
  contrastText: '#FFFFFF',
} as const;

/** The dark-scheme counterparts: bright fills, dark text on them. */
export const successDark = {
  light: '#6EE7B7',
  main: '#34D399',
  dark: '#0F9D6B',
  contrastText: '#04231A',
} as const;

export const warningDark = {
  light: '#FCD34D',
  main: '#FBBF24',
  dark: '#D97706',
  contrastText: '#2A1603',
} as const;

export const errorDark = {
  light: '#FCA5A5',
  main: '#F87171',
  dark: '#DC2626',
  contrastText: '#2A0A0A',
} as const;

export const infoDark = {
  light: '#7DD3FC',
  main: '#38BDF8',
  dark: '#0284C7',
  contrastText: '#042536',
} as const;

/**
 * Decorative gradients. Written as functions of the scales above so a palette change propagates
 * instead of leaving hard-coded hexes behind in a hero section.
 */
export const gradients = {
  /** The hero mesh — three offset radial blooms rather than a linear ramp, which looks dated. */
  heroLight: `radial-gradient(at 18% 12%, ${brand[100]} 0px, transparent 55%),
              radial-gradient(at 82% 8%, ${accent[100]} 0px, transparent 50%),
              radial-gradient(at 55% 85%, ${brand[50]} 0px, transparent 55%)`,
  heroDark: `radial-gradient(at 18% 12%, ${brand[950]} 0px, transparent 55%),
             radial-gradient(at 82% 8%, ${accent[950]} 0px, transparent 50%),
             radial-gradient(at 55% 85%, #10203F 0px, transparent 55%)`,
  /** For text that needs to carry the brand: headline spans, logo mark. */
  brandText: `linear-gradient(120deg, ${brand[600]}, ${brand[400]} 55%, ${accent[400]})`,
  brandTextDark: `linear-gradient(120deg, ${brand[300]}, ${brand[200]} 55%, ${accent[300]})`,
} as const;
