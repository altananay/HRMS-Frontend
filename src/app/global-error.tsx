'use client';

import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
          background: '#0B1220',
          color: '#E8EDF7',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <main style={{ maxWidth: '44ch', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', margin: '0 0 .75rem' }}>Bir şeyler ters gitti</h1>
          <p style={{ margin: '0 0 1.75rem', lineHeight: 1.6, color: '#A3B1C6' }}>
            Uygulama başlatılamadı. Sayfayı yenilemeyi deneyin.
            <br />
            <span lang="en">The application failed to start. Try reloading the page.</span>
          </p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '.75rem 1.25rem',
              borderRadius: 10,
              background: '#2551EA',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Ana sayfa · Home
          </a>
        </main>
      </body>
    </html>
  );
}
