'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';

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
  return (
    <AppRouterCacheProvider options={{ key: 'mui', enableCssLayer: true }}>
      <ThemeProvider theme={theme} defaultMode="system">
        <CssBaseline />
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
