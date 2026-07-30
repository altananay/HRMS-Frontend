import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Two environments, because most of what is worth testing here is plain Node — the BFF handlers,
// the ProblemDetails mapper, the field-error key translation, the Zod schemas, the wire mappers.
// Only component tests need a DOM, and paying for jsdom on every file would slow the whole suite.
//
// Note neither project executes React Server Components: no runner does. RSC pages are covered by
// Playwright; here we test the modules they call.
export default defineConfig({
  plugins: [react()],

  resolve: {
    // Resolves the `@/*` alias from tsconfig. Native since Vite 7 — the vite-tsconfig-paths plugin
    // that used to be needed for this is gone.
    tsconfigPaths: true,

    alias: {
      // `server-only` resolves to a module that throws unless the bundler applies React's
      // `react-server` export condition — which Next does and Vitest does not. Without this, importing
      // any `src/server/**` module from a test fails at import time with "cannot be imported from a
      // Client Component", which is a confusing thing to read about a plain Node test.
      //
      // Aimed at the package's own no-op entry by absolute path: the `exports` map does not publish
      // `./empty.js` as a subpath, so `'server-only/empty.js'` is rejected. The marker keeps doing its
      // real job in `next build`; only the test runner is taught to ignore it.
      'server-only': fileURLToPath(new URL('./node_modules/server-only/empty.js', import.meta.url)),
    },
  },

  test: {
    globals: true,
    exclude: ['node_modules/**', 'e2e/**', '.next/**'],
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./vitest.setup.ts'],
        },
      },
    ],
  },
});
