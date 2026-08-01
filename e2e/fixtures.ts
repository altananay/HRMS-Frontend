import { test as base, type APIRequestContext, type Page } from '@playwright/test';

export const ADMIN = { email: 'admin@hrms.e2e', password: 'Adm!nE2E12345' } as const;

function unique(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export type Identity = {
  email: string;
  password: string;
  displayName: string;
};

export type Actors = {
  signInAsNewJobSeeker: (overrides?: Partial<Identity>) => Promise<Identity>;
  signInAsNewEmployer: (overrides?: Partial<Identity>) => Promise<Identity>;
  signInAsAdmin: () => Promise<void>;
  signOut: () => Promise<void>;
};

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
  actors: async ({ page }, use) => {
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
