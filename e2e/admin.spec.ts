import { expect, test } from './fixtures';

/**
 * The admin panel.
 *
 * Ten screens that all read the same way, so the spec checks the shape once per screen and spends its
 * detail on the two things that actually have behaviour: server-side paging through the URL, and the
 * moderation actions.
 */
const SCREENS = [
  ['/admin', 'Yönetim paneli'],
  ['/admin/users', 'Kullanıcılar'],
  ['/admin/job-seekers', 'İş arayanlar'],
  ['/admin/employers', 'İşverenler'],
  ['/admin/system-staff', 'Sistem ekibi'],
  ['/admin/job-positions', 'Pozisyonlar'],
  ['/admin/job-advertisements', 'İlanlar'],
  ['/admin/job-applications', 'Başvurular'],
  ['/admin/cvs', 'Özgeçmişler'],
  ['/admin/contacts', 'İletişim mesajları'],
] as const;

test.describe('admin panel', () => {
  for (const [path, heading] of SCREENS) {
    test(`${path} renders`, async ({ page, actors }) => {
      await actors.signInAsAdmin();

      const response = await page.goto(path);

      expect(response?.status(), path).toBeLessThan(400);
      await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    });
  }

  test('paging lives in the URL, so a page survives a reload', async ({ page, actors }) => {
    // Eleven seekers, so a ten-row page always has a second one to go to. Counting what the seed and
    // the other specs happen to leave behind would make this test pass or fail on run order.
    for (let index = 0; index < 11; index += 1) {
      await actors.signInAsNewJobSeeker();
    }

    await actors.signInAsAdmin();
    await page.goto('/admin/job-seekers?pageSize=10');
    await expect(page.getByRole('grid')).toBeVisible();

    await page.getByRole('button', { name: /Go to next page|Sonraki sayfa/i }).click();
    await expect(page).toHaveURL(/[?&]page=2/);

    await page.reload();
    await expect(page).toHaveURL(/[?&]page=2/);
    await expect(page.getByRole('row')).not.toHaveCount(1); // header only would mean an empty page 2
  });

  test('an administrator creates a job position and deletes it', async ({ page, actors }) => {
    await actors.signInAsAdmin();
    await page.goto('/admin/job-positions?pageSize=100');

    const name = `E2E Pozisyon ${Date.now().toString(36)}`;
    // The grid's own column menus carry the field label too, so every dialog control is scoped.
    const dialog = page.getByRole('dialog');

    await page.getByRole('button', { name: 'Yeni pozisyon' }).click();
    await dialog.getByLabel('Pozisyon adı').fill(name);
    await dialog.getByRole('button', { name: 'Oluştur' }).click();

    await expect(page.getByText('Pozisyon eklendi')).toBeVisible();
    await expect(page.getByRole('grid')).toContainText(name);

    await page.getByRole('button', { name: `Sil: ${name}` }).click();
    await dialog.getByRole('button', { name: 'Sil', exact: true }).click();

    await expect(page.getByText('Kayıt silindi')).toBeVisible();
    await expect(page.getByRole('grid')).not.toContainText(name);
  });

  test('an administrator marks a contact message handled', async ({ page, actors }) => {
    // The message is posted anonymously, the way the public form does it.
    await page.goto('/');
    const subject = `E2E mesaj ${Date.now().toString(36)}`;
    await page.request.post('/api/proxy/Contacts', {
      headers: { origin: new URL(page.url()).origin },
      data: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@e2e.test',
        subject,
        message: 'Bu mesaj otomatik testler tarafından gönderildi ve yeterince uzundur.',
      },
    });

    await actors.signInAsAdmin();
    await page.goto('/admin/contacts?pageSize=100');

    const row = page.getByRole('row', { name: new RegExp(subject) });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'İşlendi olarak işaretle' }).click();

    await expect(page.getByText('Mesaj güncellendi')).toBeVisible();
    await expect(row.getByText('İşlendi')).toBeVisible();
  });

  test('the panel is closed to everyone else', async ({ page, actors }) => {
    await actors.signInAsNewJobSeeker();
    await page.goto('/admin');
    await expect(page).toHaveURL('/');

    await actors.signOut();
    await actors.signInAsNewEmployer();
    await page.goto('/admin/users');
    await expect(page).toHaveURL('/');
  });
});
