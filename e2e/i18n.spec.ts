import { expect, test } from './fixtures';

test.describe('i18n', () => {
  test('the switcher changes the language and the choice survives a reload', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
    await expect(page.getByRole('banner').getByRole('link', { name: 'İş ilanları' })).toBeVisible();

    await page.getByRole('button', { name: 'Dili değiştir' }).click();
    await page.getByRole('menuitem', { name: 'English' }).click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('banner').getByRole('link', { name: 'Jobs' })).toBeVisible();

    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('banner').getByRole('link', { name: 'Jobs' })).toBeVisible();
  });

  test('a message key never leaks to the screen', async ({ page }) => {
    for (const locale of ['tr', 'en']) {
      await page.context().addCookies([
        { name: 'NEXT_LOCALE', value: locale, url: 'http://localhost:3000' },
      ]);

      for (const path of ['/', '/jobs', '/companies', '/login', '/register', '/contact']) {
        await page.goto(path);

        const text = await page.locator('main').innerText();
        expect(text, `${locale} ${path}`).not.toMatch(
          /\b(nav|home|auth|jobs|companies|contact|errors|validation|profile|cv|files|applications|security|footer|pagination|skills|latest)\.[a-zA-Z]/,
        );
      }
    }
  });

  test('an unknown locale cookie falls back instead of failing', async ({ page }) => {
    await page.context().addCookies([
      { name: 'NEXT_LOCALE', value: 'de', url: 'http://localhost:3000' },
    ]);

    const response = await page.goto('/');

    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  });

  test('validation messages follow the chosen language', async ({ page }) => {
    await page.context().addCookies([
      { name: 'NEXT_LOCALE', value: 'en', url: 'http://localhost:3000' },
    ]);

    await page.goto('/login');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password', { exact: true }).click();
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  });
});
