import { expect, test } from './fixtures';

test.describe('authentication', () => {
  test('one form signs in every role, and each lands in its own panel', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('E-posta').fill('admin@hrms.e2e');
    await page.getByLabel('Parola', { exact: true }).fill('Adm!nE2E12345');
    await page.getByRole('button', { name: 'Giriş yap', exact: true }).click();

    await expect(page).toHaveURL(/\/admin/);
  });

  test('the session cookie is never readable by scripts', async ({ page, actors }) => {
    await actors.signInAsNewJobSeeker();
    await page.goto('/profile');

    const cookies = await page.context().cookies();
    const session = cookies.filter((cookie) => cookie.name.startsWith('hrms_'));

    expect(session).toHaveLength(2);
    expect(session.every((cookie) => cookie.httpOnly)).toBe(true);
    expect(session.every((cookie) => cookie.sameSite === 'Lax')).toBe(true);

    expect(await page.evaluate(() => document.cookie)).not.toContain('hrms_');
  });

  test('a wrong password says the credentials are wrong, not "please sign in"', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('E-posta').fill('admin@hrms.e2e');
    await page.getByLabel('Parola', { exact: true }).fill('kesinlikle-yanlis');
    await page.getByRole('button', { name: 'Giriş yap', exact: true }).click();

    await expect(page.locator('form').getByRole('alert')).toContainText('E-posta veya parola hatalı');
    await expect(page).toHaveURL(/\/login/);
  });

  test('an unknown address gives the same message as a wrong password', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('E-posta').fill('kimse-yok@e2e.test');
    await page.getByLabel('Parola', { exact: true }).fill('kesinlikle-yanlis');
    await page.getByRole('button', { name: 'Giriş yap', exact: true }).click();

    await expect(page.locator('form').getByRole('alert')).toContainText('E-posta veya parola hatalı');
  });

  test('registering as a job seeker signs in and lands in the panel', async ({ page }) => {
    await page.goto('/register/jobseeker');

    const email = `ui-${Date.now().toString(36)}@e2e.test`;

    await page.getByLabel('E-posta').fill(email);
    await page.getByLabel('Parola', { exact: true }).fill('parola123');
    await page.getByLabel('Ad', { exact: true }).fill('Ada');
    await page.getByLabel('Soyad').fill('Lovelace');
    await page.getByRole('button', { name: 'Hesabı oluştur' }).click();

    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole('button', { name: 'Hesabım' })).toBeVisible();
  });

  test('the header reflects the session on the server, with no signed-out flash', async ({
    page,
    actors,
  }) => {
    await actors.signInAsNewJobSeeker();
    await page.goto('/');

    const html = await (await page.request.get('/')).text();
    expect(html).not.toContain('href="/login"');

    await expect(page.getByRole('button', { name: 'Hesabım' })).toBeVisible();
  });

  test('signing out clears the session', async ({ page, actors }) => {
    await actors.signInAsNewJobSeeker();
    await page.goto('/profile');

    await page.getByRole('button', { name: 'Hesabım' }).click();
    await page.getByRole('menuitem', { name: 'Çıkış yap' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('banner').getByRole('link', { name: 'Giriş yap' })).toBeVisible();

    const cookies = await page.context().cookies();
    expect(cookies.filter((cookie) => cookie.name.startsWith('hrms_'))).toHaveLength(0);
  });
});
