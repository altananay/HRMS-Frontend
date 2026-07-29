import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'HRMS',
    template: '%s · HRMS',
  },
  description: 'İş arayanlar ve işverenler için insan kaynakları yönetim sistemi.',
};

// Minimal for now. P3 replaces this with the MUI registry (AppRouterCacheProvider → ThemeProvider →
// CssBaseline → ToastProvider), the session provider and the next-intl provider — plus a self-hosted
// font via next/font/local rather than a Google Fonts request at runtime.
//
// This stays a server component throughout; only the registry itself is a client component.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
