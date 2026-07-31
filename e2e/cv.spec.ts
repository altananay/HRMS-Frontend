import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';

/**
 * A wizard step button.
 *
 * Scoped to the stepper because 'Eğitim' also names the 'Eğitim ekle' button inside the step, and the
 * accessible name of a MUI StepButton includes its number ('2Eğitim') rather than the label alone.
 */
const step = (page: Page, label: string) =>
  page.locator('.MuiStepper-root').locator('button', { hasText: label });

/**
 * The résumé editor, and the data-loss trap it exists to avoid.
 *
 * `UpdateCvCommand` replaces every collection wholesale and answers 200 either way, so a form that
 * saved only the section on screen would delete the rest silently. The headline test edits one field
 * on step one and asserts that education, experience, languages and projects all survive.
 */
const FULL_CV = {
  imageUrl: null,
  information: 'Ödeme sistemleri üzerine çalışan backend geliştirici.',
  hobbies: 'Satranç',
  skills: ['C#', 'PostgreSQL'],
  socialMedia: { github: 'https://github.com/ada', linkedin: null, webSite: null },
  educations: [
    {
      school: 'ODTÜ',
      major: 'Bilgisayar Mühendisliği',
      grade: '3.4',
      startYear: 2008,
      endYear: 2012,
      isGraduated: true,
    },
  ],
  jobExperiences: [
    {
      companyName: 'Kuzey Yazılım',
      department: 'Platform',
      position: 'Senior Developer',
      startYear: 2015,
      endYear: null,
      description: 'Ödeme servisleri.',
    },
  ],
  languages: [{ name: 'İngilizce', level: 'Advanced' }],
  projects: [{ name: 'hrms', description: 'Açık kaynak İK uygulaması.' }],
};

test.describe('résumé', () => {
  test('editing one field keeps every other section', async ({ page, actors }) => {
    await actors.signInAsNewJobSeeker();

    await page.request.post('/api/proxy/Cvs/add', {
      data: FULL_CV,
      headers: { origin: new URL(page.url() || 'http://localhost:3000').origin },
    });

    await page.goto('/profile/cv/edit');

    // Every step is mounted even while hidden, so the field arrays keep their values across the
    // stepper. Loading only the visible step is what would delete the rest on save.
    await expect(step(page, 'Genel')).toBeVisible();

    await page.getByLabel('Hakkımda').fill('E2E ile güncellendi.');
    await page.getByRole('button', { name: 'Kaydet' }).click();

    await expect(page).toHaveURL(/\/profile\/cv$/);

    const body = page.locator('main');
    await expect(body).toContainText('E2E ile güncellendi.');
    await expect(body).toContainText('ODTÜ');
    await expect(body).toContainText('Kuzey Yazılım');
    await expect(body).toContainText('İngilizce');
    await expect(body).toContainText('hrms');
    await expect(body).toContainText('C#');
  });

  test('a new résumé can be created from empty and read back', async ({ page, actors }) => {
    await actors.signInAsNewJobSeeker();

    await page.goto('/profile/cv');
    await expect(page.getByText('Henüz bir özgeçmişiniz yok')).toBeVisible();

    await page.getByRole('link', { name: 'Özgeçmiş oluştur' }).click();
    await expect(page).toHaveURL(/\/profile\/cv\/edit/);

    await page.getByLabel('Hakkımda').fill('Yeni başlayan bir geliştirici.');

    // A skill chip, which is the field that was silently inert until the Autocomplete slotProps fix.
    const skills = page.getByLabel('Yetenekler');
    await skills.fill('TypeScript');
    await skills.press('Enter');

    await page.getByRole('button', { name: 'İleri' }).click();
    await page.getByRole('button', { name: 'Eğitim ekle' }).click();
    await page.getByLabel('Okul').fill('Boğaziçi');
    await page.getByLabel('Bölüm').fill('Matematik');

    await page.getByRole('button', { name: 'Kaydet' }).click();

    await expect(page).toHaveURL(/\/profile\/cv$/);
    await expect(page.locator('main')).toContainText('Yeni başlayan bir geliştirici.');
    await expect(page.locator('main')).toContainText('TypeScript');
    await expect(page.locator('main')).toContainText('Boğaziçi');
  });

  test('an education entry added on a later step survives stepping away and back', async ({
    page,
    actors,
  }) => {
    // Unmounting a hidden step would drop its field array, and the loss would look like a save bug.
    await actors.signInAsNewJobSeeker();
    await page.goto('/profile/cv/edit');

    await step(page, 'Eğitim').click();
    await page.getByRole('button', { name: 'Eğitim ekle' }).click();
    await page.getByLabel('Okul').fill('İTÜ');

    await step(page, 'Genel').click();
    await step(page, 'Eğitim').click();

    await expect(page.getByLabel('Okul')).toHaveValue('İTÜ');
  });

  test('one seeker cannot read another seeker CV', async ({ page, actors }) => {
    const first = await actors.signInAsNewJobSeeker();
    await page.request.post('/api/proxy/Cvs/add', {
      data: FULL_CV,
      headers: { origin: new URL(page.url() || 'http://localhost:3000').origin },
    });

    const session = await (await page.request.get('/api/auth/session')).json();
    const victimId = session.user.id as string;
    expect(first.email).toBeTruthy();

    await actors.signOut();
    await actors.signInAsNewJobSeeker();

    const response = await page.request.get(`/api/proxy/Cvs/getbyjobseekerid/${victimId}`);

    expect(response.status()).toBe(403);
  });
});
