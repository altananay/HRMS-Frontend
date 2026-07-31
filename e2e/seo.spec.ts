import { expect, test } from '@playwright/test';

/**
 * What a crawler sees.
 *
 * Both files are generated at request time from `src/app/robots.ts` and `src/app/sitemap.ts`, so they
 * can break in ways a build never notices — a wrong base URL, or a sitemap that 500s because the API
 * is unreachable. Those are exactly the two failures asserted here.
 */
test.describe('crawlers', () => {
  test('robots.txt keeps the panels out and points at the sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');

    expect(response.status()).toBe(200);

    const body = await response.text();

    expect(body).toContain('Disallow: /admin');
    expect(body).toContain('Disallow: /profile');
    expect(body).toContain('Disallow: /company');
    expect(body).toContain('Sitemap: http://localhost:3000/sitemap.xml');
  });

  test('the sitemap lists the public site with absolute URLs', async ({ request }) => {
    const response = await request.get('/sitemap.xml');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('xml');

    const body = await response.text();

    for (const path of ['/', '/jobs', '/companies', '/contact']) {
      expect(body).toContain(`<loc>http://localhost:3000${path}</loc>`);
    }

    // A relative <loc> is accepted by the XML schema and ignored by every crawler — the quietest way
    // for this file to be useless.
    expect(body).not.toMatch(/<loc>(?!https?:\/\/)/);
  });

  test('the home page carries its description and social card', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{20,}/);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  });
});
