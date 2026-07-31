import { test as base, type APIRequestContext, type Page } from '@playwright/test';

/**
 * Per-spec identities and sign-in.
 *
 * Every spec creates its own users through the API and never touches anyone else's data. That is what
 * makes `fullyParallel: true` safe without a lock or a shared login: registration is anonymous and
 * returns a session immediately, so a spec's whole world costs about five requests.
 *
 * Sign-in goes through **the app's own** `/api/auth/login`, not the API's, and specifically through
 * `page.request` — which shares the browser context's cookie jar, so the httpOnly cookies the BFF
 * sets are the ones the page then navigates with. That is the real session, not a simulation of one.
 */

export const ADMIN = { email: 'admin@hrms.e2e', password: 'Adm!nE2E12345' } as const;

/** Anything a spec creates is prefixed with this, so a failure names the spec that owns the data. */
function unique(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export type Identity = {
  email: string;
  password: string;
  displayName: string;
};

export type Actors = {
  /** Registers a job seeker and signs the browser in as them. */
  signInAsNewJobSeeker: (overrides?: Partial<Identity>) => Promise<Identity>;
  /** Registers an employer and signs the browser in as them. */
  signInAsNewEmployer: (overrides?: Partial<Identity>) => Promise<Identity>;
  /** Signs in as the seeded administrator. */
  signInAsAdmin: () => Promise<void>;
  /** Signs the browser out and clears the cookie jar. */
  signOut: () => Promise<void>;
};

/**
 * The BFF rejects a mutation whose `Origin` is missing or foreign — the same CSRF check a browser
 * request would satisfy automatically. Playwright's API requests do not set it, so specs must.
 */
function origin(page: Page): Record<string, string> {
  return { origin: new URL(page.url() || 'http://localhost:3000').origin };
}

async function post(page: Page, path: string, data: unknown) {
  const response = await page.request.post(path, { data, headers: origin(page) });

  if (!response.ok()) {
    throw new Error(`${path} failed: ${response.status()} ${await response.text()}`);
  }

  return response;
}

export const test = base.extend<{ actors: Actors }>({
  /**
   * Everything here goes through `page.request`, never the top-level `request` fixture.
   *
   * They are different `APIRequestContext`s with different cookie jars: `request` is standalone, so a
   * sign-in through it succeeds, stores its cookies somewhere the browser cannot see, and every
   * subsequent `page.goto` is anonymous. `page.request` shares the browser context's storage, which is
   * what makes the session real for the page.
   */
  actors: async ({ page }, use) => {
    // A page must exist before the cookie jar is useful, and `origin()` needs a URL to work from.
    await page.goto('/');

    const register = async (
      role: 'jobseeker' | 'employer',
      overrides: Partial<Identity> = {},
    ): Promise<Identity> => {
      const identity: Identity = {
        email: `${unique(role)}@e2e.test`,
        password: 'parola123',
        displayName: role === 'employer' ? 'E2E Şirket' : 'Ada Lovelace',
        ...overrides,
      };

      const body =
        role === 'employer'
          ? {
              email: identity.email,
              password: identity.password,
              companyName: identity.displayName,
              sectors: ['Yazılım'],
            }
          : {
              email: identity.email,
              password: identity.password,
              firstName: 'Ada',
              lastName: 'Lovelace',
            };

      // Registration signs the user in, so no separate login call is needed.
      await post(page, `/api/auth/register/${role}`, body);

      return identity;
    };

    await use({
      signInAsNewJobSeeker: (overrides) => register('jobseeker', overrides),
      signInAsNewEmployer: (overrides) => register('employer', overrides),
      signInAsAdmin: async () => {
        await post(page, '/api/auth/login', ADMIN);
      },
      signOut: async () => {
        await page.request.post('/api/auth/logout', { headers: origin(page) });
        await page.context().clearCookies();
      },
    });
  },
});

export { expect } from '@playwright/test';

/**
 * Waits for the reset mail and returns its link.
 *
 * Polled rather than awaited once: the API answers the request before SMTP delivery finishes, so a
 * single read races the mail and fails perhaps one run in five — the worst kind of flake.
 */
export async function waitForResetLink(
  request: APIRequestContext,
  email: string,
  timeoutMs = 15_000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    const link = await readResetLink(request, email);
    if (link) return link;

    if (Date.now() > deadline) {
      throw new Error(`No reset mail arrived for ${email} within ${timeoutMs}ms`);
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

/** Reads the newest message Mailpit received for an address, and the reset link inside it. */
export async function readResetLink(
  request: APIRequestContext,
  email: string,
): Promise<string | null> {
  const inbox = await request.get('http://localhost:8025/api/v1/messages');
  const messages = (await inbox.json()).messages as
    | { ID: string; To: { Address: string }[] }[]
    | undefined;

  const message = messages?.find((item) =>
    item.To.some((to) => to.Address.toLowerCase() === email.toLowerCase()),
  );

  if (!message) return null;

  const detail = await request.get(`http://localhost:8025/api/v1/message/${message.ID}`);
  const body = await detail.json();

  return /https?:\/\/[^\s"<]*reset-password[^\s"<]*/.exec(body.Text ?? body.HTML ?? '')?.[0] ?? null;
}
