'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useLocale } from 'next-intl';
import 'dayjs/locale/tr';
import 'dayjs/locale/en-gb';

import { ToastProvider } from '@/components/ui/ToastProvider';

import { theme } from './theme';

/**
 * The single client boundary for styling. `layout.tsx` stays a server component; everything below
 * this point that needs Emotion's context gets it from here.
 *
 * `AppRouterCacheProvider` is not optional: without it Emotion inserts its `<style>` tags after
 * hydration, so the first paint is unstyled and React warns about the mismatch. The `/v16-appRouter`
 * entry point is the one built for Next 16's `useServerInsertedHTML`.
 *
 * Order matters — the cache must wrap the provider, `CssBaseline` must be inside the theme, and the
 * toast host sits innermost so it renders with the theme applied.
 */
export function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const locale = useLocale();

  return (
    <AppRouterCacheProvider options={{ key: 'mui', enableCssLayer: true }}>
      <ThemeProvider theme={theme} defaultMode="system">
        <CssBaseline />
        {/*
          `en-gb`, not `en`: day-first ordering matches Turkish, so switching language changes the
          month names without also silently reordering every date field. A US-format date in a
          Turkish-speaking user's browser is read wrong, not read as English.
        */}
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale={locale === 'tr' ? 'tr' : 'en-gb'}
        >
          <ToastProvider>{children}</ToastProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
