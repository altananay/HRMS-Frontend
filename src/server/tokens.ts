export const ACCESS_TOKEN_COOKIE = 'hrms_at';
export const REFRESH_TOKEN_COOKIE = 'hrms_rt';

export const REFRESH_SKEW_MS = 60_000;

export type SessionTokens = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

export type RefreshOutcome =
  | { status: 'refreshed'; tokens: SessionTokens }
  | { status: 'rejected' }
  | { status: 'unavailable' };

export function readExpiry(token: string): number | null {
  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims: unknown = JSON.parse(json);

    if (typeof claims !== 'object' || claims === null) return null;

    const exp = (claims as { exp?: unknown }).exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function needsRefresh(accessToken: string | undefined, now = Date.now()): boolean {
  if (!accessToken) return true;

  const expiresAt = readExpiry(accessToken);
  if (expiresAt === null) return true;

  return expiresAt - REFRESH_SKEW_MS <= now;
}

const inFlight = new Map<string, Promise<RefreshOutcome>>();

export function refreshOnce(refreshToken: string, apiBaseUrl: string): Promise<RefreshOutcome> {
  const existing = inFlight.get(refreshToken);
  if (existing) return existing;

  const attempt = requestRefresh(refreshToken, apiBaseUrl).finally(() => {
    inFlight.delete(refreshToken);
  });

  inFlight.set(refreshToken, attempt);

  return attempt;
}

async function requestRefresh(refreshToken: string, apiBaseUrl: string): Promise<RefreshOutcome> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });
  } catch {
    return { status: 'unavailable' };
  }

  if (!response.ok) {
    // 429 is the auth rate limiter, not the API saying this refresh token is invalid — treating it as
    // `rejected` would clear a perfectly good session over a transient limit, exactly the "signs users
    // out whenever the API blips" failure this three-outcome design exists to avoid.
    return response.status >= 500 || response.status === 429
      ? { status: 'unavailable' }
      : { status: 'rejected' };
  }

  try {
    const body: unknown = await response.json();
    const tokens = (body as { data?: SessionTokens }).data;

    if (!tokens?.accessToken || !tokens.refreshToken) return { status: 'unavailable' };

    return { status: 'refreshed', tokens };
  } catch {
    return { status: 'unavailable' };
  }
}

export function __resetRefreshState(): void {
  inFlight.clear();
}
