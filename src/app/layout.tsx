import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';

import { SessionProvider } from '@/components/providers/SessionProvider';
import { Footer } from '@/components/shell/Footer';
import { Header } from '@/components/shell/Header';
import { SkipLink } from '@/components/ui/SkipLink';
import { getSession } from '@/server/session';
import { fontClassNames } from '@/theme/fonts';
import { ThemeRegistry } from '@/theme/ThemeRegistry';

import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');

  return {
    title: { default: t('title'), template: t('titleTemplate') },
    description: t('description'),
  };
}

/**
 * Stays a server component. The only client boundary is `ThemeRegistry`; `Header` is a client
 * component in its own right and is composed in as a child rather than by making this file one.
 *
 * Two details are load-bearing:
 *
 *   `InitColorSchemeScript` must be the first thing in `<body>`. It writes the `light`/`dark` class
 *   onto `<html>` from localStorage *before* the browser paints, which is the only way to avoid a
 *   flash of the wrong theme. Move it below the providers and the flash comes back.
 *
 *   `suppressHydrationWarning` on `<html>` is required *because* of that script: the server cannot
 *   know which class it will add, so the attribute legitimately differs between server and client. It
 *   applies to this element only and silences nothing below it.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolved on the server on every render, so the header is never briefly wrong. For an anonymous
  // visitor this costs nothing — no cookie, no upstream call.
  const [locale, user] = await Promise.all([getLocale(), getSession()]);

  return (
    <html
      lang={locale}
      className={fontClassNames}
      // Tells the router to suppress the smooth scroll on a route change. Without it Next warns, and a
      // navigation animates the scroll instead of landing at the top.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <InitColorSchemeScript attribute="class" defaultMode="system" />

        <NextIntlClientProvider>
          <ThemeRegistry>
            <SessionProvider user={user}>
              <SkipLink />
              <Header />
              <Box component="main" id="main" sx={{ flex: '1 1 auto' }}>
                {children}
              </Box>
              <Footer />
            </SessionProvider>
          </ThemeRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
