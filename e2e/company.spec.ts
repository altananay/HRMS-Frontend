import { expect, test } from './fixtures';

/**
 * The company panel: publishing, the application pipeline, and the profile.
 *
 * The department test is here for a specific reason — adding a department to an existing employer is
 * the same "insert a child row into a tracked parent" shape that made every résumé save throw
 * `DbUpdateConcurrencyException`. It was fixed by generating entity keys at save time; this is the
 * second path that fix covers, and nothing else exercises it.
 */
/**
 * Job positions are global and resolved by name, so a fixed name would have every parallel worker
 * creating the same row at once. That used to be a real backend defect — `ResolveOrCreateAsync`
 * checked then inserted, and the unique index on `job_positions.name` answered the loser with a 500.
 * It is fixed upstream now (an `ON CONFLICT DO NOTHING` upsert, with its own concurrency test), so
 * this per-run name is no longer hiding anything: it just keeps one worker's posting out of another's
 * assertions.
 */
const POSITION = `E2E Position ${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const POSTING = {
  title: 'E2E Backend Developer',
  jobPositionName: POSITION,
  description: 'Bu ilan otomatik testler tarafından oluşturuldu ve yeterince uzun bir açıklama taşır.',
  experience: null,
  city: 'İstanbul',
  skills: ['C#', 'PostgreSQL'],
  minSalary: 90000,
  maxSalary: 140000,
  currency: 'TRY',
  openPositions: 2,
  jobType: 'FullTime',
  deadline: new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10),
};

const origin = (url: string) => ({ origin: new URL(url || 'http://localhost:3000').origin });

/** Publishes a posting through the proxy and returns its id, failing loudly if the API refused. */
async function publish(page: import('@playwright/test').Page): Promise<string> {
  const response = await page.request.post('/api/proxy/JobAdvertisements/add', {
    data: POSTING,
    headers: origin(page.url()),
  });

  expect(response.status(), await response.text()).toBe(201);

  return (await response.json()).data.id as string;
}

test.describe('company panel', () => {
  test('an employer publishes a posting and it reaches the public board', async ({
    page,
    actors,
  }) => {
    const employer = await actors.signInAsNewEmployer();

    await page.goto('/company/jobs/new');

    await page.getByLabel('İlan başlığı').fill('E2E Frontend Developer');
    await page.getByLabel('Pozisyon', { exact: true }).fill(POSITION);
    await page
      .getByLabel('İlan açıklaması')
      .fill('Tarayıcı testinden oluşturulan, doğrulamayı geçecek kadar uzun bir ilan açıklaması.');
    await page.getByLabel('Şehir').fill('İzmir');

    await page.getByRole('button', { name: 'İlanı yayınla' }).click();

    // Create answers 201 with the new id, so the employer lands on the posting itself.
    await expect(page).toHaveURL(/\/company\/jobs\/[0-9a-f-]{36}$/);
    await expect(page.locator('main')).toContainText('E2E Frontend Developer');
    await expect(page.locator('main')).toContainText('Yayında');

    // And a candidate can find it.
    await page.goto('/jobs?search=E2E%20Frontend');
    await expect(page.locator('main')).toContainText('E2E Frontend Developer');
    await expect(page.locator('main')).toContainText(employer.displayName);
  });

  test('an employer sees an application and can move it along the pipeline', async ({
    page,
    actors,
  }) => {
    const employer = await actors.signInAsNewEmployer();
    const jobId = await publish(page);

    // A candidate applies, in their own session.
    await actors.signOut();
    await actors.signInAsNewJobSeeker();
    await page.request.post('/api/proxy/JobApplications/add', {
      data: { jobAdvertisementId: jobId, jobSeekerNote: 'E2E ön yazısı.' },
      headers: origin(page.url()),
    });

    // Back to the employer.
    await actors.signOut();
    await page.request.post('/api/auth/login', {
      data: { email: employer.email, password: employer.password },
      headers: origin(page.url()),
    });

    await page.goto('/company/applications');
    await expect(page.locator('main')).toContainText('Ada Lovelace');

    await page.getByText('Ada Lovelace').first().click();
    await expect(page).toHaveURL(/\/company\/applications\/[0-9a-f-]{36}$/);
    await expect(page.locator('main')).toContainText('E2E ön yazısı.');

    await page.getByLabel('Durum').click();
    await page.getByRole('option', { name: 'Görüşme planlandı' }).click();
    await page.getByLabel('Aday hakkında notunuz').fill('Teknik görüşmeye alalım.');
    await page.getByRole('button', { name: 'Durumu güncelle' }).click();

    await expect(page.locator('main')).toContainText('Görüşme planlandı');
  });

  test('adding a department to an existing employer saves', async ({ page, actors }) => {
    // The regression path. Before the key-generation fix this threw a concurrency exception and
    // answered 500 — the identical shape that broke every résumé with a child row.
    await actors.signInAsNewEmployer();

    await page.goto('/company/profile');
    await expect(page.getByText('Henüz departman eklenmedi')).toBeVisible();

    await page.getByRole('button', { name: 'Departman ekle' }).click();
    await page.getByRole('textbox', { name: 'Departman adı' }).fill('Platform');
    await page.getByLabel('Çalışan sayısı').last().fill('12');

    await page.getByRole('button', { name: 'Kaydet' }).click();

    await expect(page.getByText('Şirket profiliniz güncellendi')).toBeVisible();

    await page.reload();
    await expect(page.getByRole('textbox', { name: 'Departman adı' })).toHaveValue('Platform');
  });

  test('one employer cannot open another employer posting', async ({ page, actors }) => {
    await actors.signInAsNewEmployer();
    const jobId = await publish(page);

    await actors.signOut();
    await actors.signInAsNewEmployer();

    // `getbyid` is anonymous upstream, so the panel has to refuse this itself rather than relying on
    // the API — otherwise it would render someone else's posting and its applications.
    const response = await page.goto(`/company/jobs/${jobId}`);
    expect(response?.status()).toBe(404);

    const edit = await page.goto(`/company/jobs/${jobId}/edit`);
    expect(edit?.status()).toBe(404);
  });

  test('a job seeker cannot reach the company panel', async ({ page, actors }) => {
    await actors.signInAsNewJobSeeker();
    await page.goto('/company');

    await expect(page).toHaveURL('/');
  });
});
