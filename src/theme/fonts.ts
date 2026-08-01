import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

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

export const fontClassNames = `${bodyFont.variable} ${displayFont.variable}`;
