import { defineConfig, devices } from '@playwright/test';

const APP_URL = 'http://localhost:3000';

// Runs against the REAL backend and a real PostgreSQL, not a mock. The point is to catch contract
// drift between this app and the .NET API, which a mocked suite cannot see.
//
// Two things here are load-bearing and easy to get wrong:
//
//   ASPNETCORE_HTTPS_PORTS: ''       Program.cs calls UseHttpsRedirection(). With no HTTPS port
//                                    configured it has nowhere to redirect and passes through, so
//                                    the dev-certificate problem disappears from the suite entirely.
//
//   RateLimiting__Auth__PermitLimit  The limiter partitions by remote IP, so every parallel worker
//                                    shares one 127.0.0.1 bucket and the production limit of 10 per
//                                    5 minutes would reject most of the run. Raising it is the knob
//                                    the backend's own functional suite already uses — no test-only
//                                    code path involved.
//
// Docker and the database reset live in `e2e/prepare.mjs`, run by `npm run e2e` BEFORE Playwright
// starts — not in `globalSetup`. Playwright launches `webServer` first and only then runs
// globalSetup, so resetting the database from there pulls it out from under an API that has already
// migrated and seeded it: every request 500s and it reads as a broken feature. Learned the hard way.
//
// `reuseExistingServer: false` on both servers, deliberately. The API only behaves correctly with
// the environment below (E2E database, raised rate limit, http-only); reusing whatever happens to be
// listening on 5129 would silently run the whole suite against the developer's own database. A port
// clash is a loud, obvious failure — testing the wrong data is not.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  // Capped below the core count on purpose. The suite runs against `next dev` — one Node process
  // compiling routes on demand — and at sixteen workers it intermittently reset a connection
  // mid-request (`ECONNRESET` on a POST that never reached a handler). Eight keeps the wall clock
  // about the same, because the run is dominated by the API round trips rather than by parallelism.
  workers: process.env.CI ? 4 : 8,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: [
    {
      command:
        'dotnet run --project ../HRMS-Backend/Presentation/WebAPI --no-launch-profile',
      url: 'http://localhost:5129/swagger/index.html',
      timeout: 180_000,
      reuseExistingServer: false,
      stdout: 'ignore',
      stderr: 'pipe',
      env: {
        ASPNETCORE_ENVIRONMENT: 'Development',
        ASPNETCORE_URLS: 'http://localhost:5129',
        ASPNETCORE_HTTPS_PORTS: '',
        ConnectionStrings__Postgres:
          'Host=localhost;Port=5433;Database=hrms_e2e;Username=hrms;Password=hrms',
        RateLimiting__Auth__PermitLimit: '10000',
        Serilog__Seq__ServerUrl: '',
        Email__Host: 'localhost',
        Email__Port: '1025',
        PasswordReset__LinkBaseUrl: `${APP_URL}/reset-password`,
        Seed__AdminEmail: 'admin@hrms.e2e',
        Seed__AdminPassword: 'Adm!nE2E12345',
      },
    },
    {
      command: 'npm run dev',
      url: APP_URL,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        API_BASE_URL: 'http://localhost:5129',
        SESSION_COOKIE_SECURE: 'false',
      },
    },
  ],
});
