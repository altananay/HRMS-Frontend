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

  // Resolves the `@/*` alias from tsconfig. Native since Vite 7 — the vite-tsconfig-paths plugin
  // that used to be needed for this is gone.
  resolve: { tsconfigPaths: true },

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
