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
import { SITE_URL } from '@/server/site';
import { fontClassNames } from '@/theme/fonts';
import { ThemeRegistry } from '@/theme/ThemeRegistry';

import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations('meta'), getLocale()]);

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('title'), template: t('titleTemplate') },
    description: t('description'),
    applicationName: t('title'),
    openGraph: {
      type: 'website',
      siteName: t('title'),
      title: t('title'),
      description: t('description'),
      locale,
      url: '/',
    },
    twitter: { card: 'summary_large_image', title: t('title'), description: t('description') },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, user] = await Promise.all([getLocale(), getSession()]);

  return (
    <html
      lang={locale}
      className={fontClassNames}
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
