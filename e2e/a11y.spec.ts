import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';

async function scan(page: Page, selector = 'body') {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .include(selector)
    .analyze();
}

function summarize(violations: Awaited<ReturnType<typeof scan>>['violations']) {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target.join(' ')),
  }));
}

async function expectNoViolations(page: Page, selector?: string) {
  const { violations } = await scan(page, selector);

  expect(summarize(violations)).toEqual([]);
}

test.describe('accessibility', () => {
  const publicPages = ['/', '/jobs', '/companies', '/contact', '/login', '/register/jobseeker'];

  for (const path of publicPages) {
    test(`${path} has no axe violations`, async ({ page }) => {
      await page.goto(path);
      await expectNoViolations(page);
    });
  }

  test('a job posting page is accessible', async ({ page }) => {
    await page.goto('/jobs');

    const firstJob = page.getByRole('link', { name: /ilan|detay|incele/i }).first();

    if ((await firstJob.count()) === 0) test.skip(true, 'no postings seeded');

    await firstJob.click();
    await expectNoViolations(page);
  });

  test('the job seeker panel is accessible', async ({ page, actors }) => {
    await actors.signInAsNewJobSeeker();

    for (const path of ['/profile', '/profile/cv', '/profile/applications']) {
      await page.goto(path);
      await expectNoViolations(page);
    }
  });

  test('the CV editor is accessible', async ({ page, actors }) => {
    await actors.signInAsNewJobSeeker();
    await page.goto('/profile/cv/edit');
    await expectNoViolations(page);
  });

  test('the company panel is accessible', async ({ page, actors }) => {
    await actors.signInAsNewEmployer();

    for (const path of ['/company', '/company/jobs', '/company/jobs/new', '/company/profile']) {
      await page.goto(path);
      await expectNoViolations(page);
    }
  });

  test('the admin panel is accessible', async ({ page, actors }) => {
    await actors.signInAsAdmin();

    for (const path of ['/admin', '/admin/users', '/admin/job-positions', '/admin/contacts']) {
      await page.goto(path);
      await expectNoViolations(page);
    }
  });

  test('dark mode keeps its contrast', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expectNoViolations(page);

    await page.goto('/jobs');
    await expectNoViolations(page);
  });

  test('the skip link reaches the main landmark', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skip = page.locator('a[href="#main"]');
    await expect(skip).toBeFocused();
    await expect(skip).toHaveText(/çeriğe geç|Skip to content/);

    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeVisible();
    await expect(page).toHaveURL(/#main$/);
  });
});
