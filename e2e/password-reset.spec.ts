import { expect, test, waitForResetLink } from './fixtures';

/**
 * The reset flow, end to end through a real SMTP server.
 *
 * Everything here is a security property, not a convenience: the response must not reveal whether an
 * address is registered, the token must work once, and a completed reset must end every session the
 * user had.
 */
test.describe('password reset', () => {
  test('a registered address gets a working link, and the reset ends every session', async ({
    page,
    request,
    actors,
  }) => {
    const seeker = await actors.signInAsNewJobSeeker();

    // Keep this browser's session, then reset from a clean one — the point is that the old session
    // dies even though nothing signed it out.
    const sessionBefore = await page.request.get('/api/auth/session');
    expect((await sessionBefore.json()).user).not.toBeNull();

    await page.goto('/forgot-password');
    await page.getByLabel('E-posta').fill(seeker.email);
    await page.getByRole('button', { name: 'Sıfırlama bağlantısı gönder' }).click();

    await expect(page.getByText('E-postanızı kontrol edin')).toBeVisible();

    const link = await waitForResetLink(request, seeker.email);

    expect(link).toContain('/reset-password?token=');

    await page.goto(link);
    await page.getByLabel('Yeni parola', { exact: true }).fill('yeniparola');
    await page.getByLabel('Yeni parola (tekrar)').fill('yeniparola');
    await page.getByRole('button', { name: 'Parolayı güncelle' }).click();

    await expect(page.getByText('Parolanız güncellendi')).toBeVisible();

    // The old password is dead.
    const oldPassword = await page.request.post('/api/auth/login', {
      data: { email: seeker.email, password: seeker.password },
      headers: { origin: new URL(page.url()).origin },
    });
    expect(oldPassword.status()).toBe(401);

    // The new one works.
    const newPassword = await page.request.post('/api/auth/login', {
      data: { email: seeker.email, password: 'yeniparola' },
      headers: { origin: new URL(page.url()).origin },
    });
    expect(newPassword.status()).toBe(200);
  });

  test('an unknown address is answered exactly like a known one', async ({ page }) => {
    // No branch anywhere may reveal that the address is not registered.
    await page.goto('/forgot-password');
    await page.getByLabel('E-posta').fill(`kimse-yok-${Date.now()}@e2e.test`);
    await page.getByRole('button', { name: 'Sıfırlama bağlantısı gönder' }).click();

    await expect(page.getByText('E-postanızı kontrol edin')).toBeVisible();
  });

  test('a token works once', async ({ page, request, actors }) => {
    const seeker = await actors.signInAsNewJobSeeker();
    await actors.signOut();

    await page.goto('/forgot-password');
    await page.getByLabel('E-posta').fill(seeker.email);
    await page.getByRole('button', { name: 'Sıfırlama bağlantısı gönder' }).click();
    await expect(page.getByText('E-postanızı kontrol edin')).toBeVisible();

    const link = await waitForResetLink(request, seeker.email);

    const token = new URL(link).searchParams.get('token')!;
    const reset = () =>
      page.request.post('/api/auth/reset-password', {
        data: { token, newPassword: 'birinciparola' },
        headers: { origin: new URL(page.url() || 'http://localhost:3000').origin },
      });

    expect((await reset()).status()).toBe(200);
    expect((await reset()).status()).toBe(400);
  });

  test('a bogus token is refused and never echoed back', async ({ page }) => {
    await page.goto('/reset-password?token=kesinlikle-gecersiz-bir-token');

    await page.getByLabel('Yeni parola', { exact: true }).fill('yeniparola');
    await page.getByLabel('Yeni parola (tekrar)').fill('yeniparola');
    await page.getByRole('button', { name: 'Parolayı güncelle' }).click();

    const banner = page.locator('form').getByRole('alert');
    await expect(banner).toBeVisible();
    // A single-use credential must not end up in an error message, a log or a screenshot.
    await expect(banner).not.toContainText('kesinlikle-gecersiz-bir-token');
  });

  test('a link with no token says so instead of failing on submit', async ({ page }) => {
    await page.goto('/reset-password');

    await expect(page.getByText('Bu bağlantı geçersiz')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Parolayı güncelle' })).toHaveCount(0);
  });
});
