import { defineConfig, devices } from '@playwright/test';

const APP_URL = 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 4 : 16,
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
      command: 'npm run start',
      url: APP_URL,
      timeout: 60_000,
      reuseExistingServer: false,
      env: {
        API_BASE_URL: 'http://localhost:5129',
        SESSION_COOKIE_SECURE: 'false',
      },
    },
  ],
});
