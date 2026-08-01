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

export function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const locale = useLocale();

  return (
    <AppRouterCacheProvider options={{ key: 'mui', enableCssLayer: true }}>
      <ThemeProvider theme={theme} defaultMode="system">
        <CssBaseline />
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
