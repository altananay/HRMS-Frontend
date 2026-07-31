import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';

/**
 * Accessibility, checked by axe against WCAG 2.1 A/AA on a real render of every kind of screen.
 *
 * Scope is deliberate. Axe finds the machine-checkable half — a control with no accessible name,
 * text under 4.5:1, a broken landmark, an `aria-*` pointing at nothing — which is exactly the half
 * that regresses silently as screens get edited. It cannot judge focus order or whether a label
 * *makes sense*; those stay a human job and are not claimed here.
 *
 * One screen per shape rather than all forty: the panels share `PanelLayout`, the lists share
 * `ServerDataGrid`, the forms share the `RHF*` wrappers. A violation in any of those surfaces
 * wherever it is first rendered.
 */
async function scan(page: Page, selector = 'body') {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .include(selector)
    .analyze();
}

/** A violation prints as its rule id and the nodes it hit — enough to fix without opening a report. */
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
    // Contrast is the one rule that a theme change can break everywhere at once, and it is checked
    // per computed colour — so the dark palette needs its own pass, not just the light one.
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expectNoViolations(page);

    await page.goto('/jobs');
    await expectNoViolations(page);
  });

  test('the skip link reaches the main landmark', async ({ page }) => {
    // Not an axe rule: axe sees the link, but only a keyboard proves it goes anywhere. This is the
    // whole point of the link — one Tab, one Enter, past the header.
    await page.goto('/');
    await page.keyboard.press('Tab');

    // Located by target, not by name: the Turkish copy starts with "İ" (U+0130), which JavaScript's
    // case-insensitive matching does not fold to "i" — a name regex silently matches nothing.
    const skip = page.locator('a[href="#main"]');
    await expect(skip).toBeFocused();
    await expect(skip).toHaveText(/çeriğe geç|Skip to content/);

    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeVisible();
    await expect(page).toHaveURL(/#main$/);
  });
});
