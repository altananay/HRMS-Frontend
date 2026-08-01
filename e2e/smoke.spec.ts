import { expect, test } from '@playwright/test';

test.describe('harness', () => {
  test('the app responds', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.status()).toBeLessThan(400);
  });

  test('the backend is reachable and anonymous browsing works', async ({ request }) => {
    const response = await request.get('http://localhost:5129/api/JobAdvertisements/getall');

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ isSuccess: true });
  });

  test('the seeded administrator can sign in', async ({ request }) => {
    const response = await request.post('http://localhost:5129/api/auth/login', {
      data: { email: 'admin@hrms.e2e', password: 'Adm!nE2E12345' },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.accessToken).toBeTruthy();
    expect(body.data.user.roles).toContain('admin');
  });

  test('mailpit is accepting mail', async ({ request }) => {
    const response = await request.get('http://localhost:8025/readyz');

    expect(response.status()).toBe(200);
  });
});
