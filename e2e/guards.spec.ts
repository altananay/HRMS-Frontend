import { expect, test } from './fixtures';

/**
 * Who can reach what.
 *
 * The guard is two-tier by design: `proxy.ts` only checks that a cookie exists, and the segment
 * layout does the real role check against a verified `/auth/me`. Both tiers are exercised here — an
 * anonymous visitor hits the first, a signed-in visitor with the wrong role hits the second.
 */
const PROTECTED = ['/profile', '/profile/cv', '/profile/applications', '/profile/security'];

test.describe('route guards', () => {
  for (const path of PROTECTED) {
    test(`an anonymous visitor is sent to sign in from ${path}`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path)}`));
    });
  }

  test('signing in returns the visitor to where they were headed', async ({ page }) => {
    await page.goto('/profile/cv');
    await expect(page).toHaveURL(/\/login/);

    const seeker = `redirect-${Date.now().toString(36)}@e2e.test`;

    // Register in another tab-less request so the `next` parameter survives the sign-in.
    await page.request.post('/api/auth/register/jobseeker', {
      data: { email: seeker, password: 'parola123', firstName: 'Ada', lastName: 'Lovelace' },
      headers: { origin: new URL(page.url()).origin },
    });
    await page.request.post('/api/auth/logout', { headers: { origin: new URL(page.url()).origin } });

    await page.goto('/profile/cv');
    await page.getByLabel('E-posta').fill(seeker);
    await page.getByLabel('Parola', { exact: true }).fill('parola123');
    await page.getByRole('button', { name: 'Giriş yap', exact: true }).click();

    await expect(page).toHaveURL(/\/profile\/cv/);
  });

  test('an admin cannot wander into the job seeker panel', async ({ page, actors }) => {
    // The cookie exists, so the proxy lets it through — the segment layout is what turns it away.
    await actors.signInAsAdmin();
    await page.goto('/profile');

    await expect(page).toHaveURL('/');
  });

  test('an employer cannot wander into the job seeker panel', async ({ page, actors }) => {
    await actors.signInAsNewEmployer();
    await page.goto('/profile/cv');

    await expect(page).toHaveURL('/');
  });

  test('the public site stays open to everyone', async ({ page }) => {
    for (const path of ['/', '/jobs', '/companies', '/contact', '/login', '/register']) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBeLessThan(400);
      expect(page.url(), path).toContain(path === '/' ? '/' : path);
    }
  });

  test('the proxy refuses an endpoint that is not on the allow-list', async ({ page }) => {
    const response = await page.request.get('/api/proxy/Logs/getall');

    // 404 rather than 403, so the allow-list cannot be probed to map the API.
    expect(response.status()).toBe(404);
  });

  test('the auth endpoints are unreachable through the proxy', async ({ page }) => {
    for (const path of ['auth/refresh', 'auth/me', 'auth/login']) {
      const response = await page.request.get(`/api/proxy/${path}`);
      expect(response.status(), path).toBe(404);
    }
  });

  test('a mutation from a foreign origin is rejected', async ({ page }) => {
    const response = await page.request.post('/api/proxy/Contacts', {
      data: {},
      headers: { origin: 'https://evil.example' },
    });

    expect(response.status()).toBe(403);
  });
});
