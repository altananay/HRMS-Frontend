/**
 * Token primitives and the process-wide single-flight refresh.
 *
 * Deliberately free of `next/headers` **and** of `server-only`, because `middleware.ts` imports this
 * and runs in the Edge sandbox where neither is available. Everything here works on both runtimes:
 * `fetch`, `atob` and `JSON` are all standard in Node 20+ and on Edge.
 *
 * The cookie *writing* lives in `session.ts` (Node) and in the middleware itself.
 */

export const ACCESS_TOKEN_COOKIE = 'hrms_at';
export const REFRESH_TOKEN_COOKIE = 'hrms_rt';

/**
 * How long before expiry the access token is treated as already dead. The access token lives 15
 * minutes and the backend validates it with `ClockSkew = TimeSpan.Zero`, so there is no grace period
 * on the other side — a token that expires mid-flight is simply rejected.
 */
export const REFRESH_SKEW_MS = 60_000;

export type SessionTokens = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

/**
 * Three outcomes, not two, because the caller must react differently to the last two:
 *
 *   `rejected`    the API answered and refused — the refresh token is spent, revoked or expired.
 *                 The session is genuinely over; clear the cookies.
 *   `unavailable` the request never got an answer — API down, TLS failure, unparseable body. The
 *                 session may be perfectly valid. Clearing the cookies here would sign a user out
 *                 because a container was restarting, and they would have no idea why.
 *
 * Collapsing both into `null` is the easy mistake, and it is invisible until the day the API blips.
 */
export type RefreshOutcome =
  | { status: 'refreshed'; tokens: SessionTokens }
  | { status: 'rejected' }
  | { status: 'unavailable' };

/**
 * Reads `exp` out of a JWT **without verifying the signature**.
 *
 * That is safe here and nowhere else: the value is used only to decide whether to refresh early. A
 * forged token with a distant `exp` buys an attacker nothing, because the backend still verifies the
 * signature, the lifetime and the security stamp on every single request. Verifying here would mean
 * copying the signing key into the frontend, which would be a real regression.
 */
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
    // Not a JWT, or not base64. Treated as "expiry unknown" — the caller refreshes, which is the
    // safe direction: a needless refresh costs one request, a skipped one costs a 401.
    return null;
  }
}

export function needsRefresh(accessToken: string | undefined, now = Date.now()): boolean {
  if (!accessToken) return true;

  const expiresAt = readExpiry(accessToken);
  if (expiresAt === null) return true;

  return expiresAt - REFRESH_SKEW_MS <= now;
}

/**
 * In-flight refreshes, keyed by the refresh token being spent.
 *
 * **This map is the single most important object in the BFF.** `AuthManager.RefreshAsync` rotates the
 * refresh token and treats a second presentation of an already-rotated one as theft: it revokes the
 * entire token chain *and* bumps the user's security stamp, which the API validates on every request.
 * Two concurrent refreshes with the same token therefore do not merely waste a round trip — they log
 * the user out of every device, and it surfaces as an ordinary 401 with nothing in the UI to explain
 * it. Ten parallel page requests after a 15-minute idle is a completely ordinary way to trigger that.
 *
 * Keyed by token rather than by user so two people never share a promise, and cleared on settle so a
 * long-lived process does not accumulate entries.
 */
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

  // 401 and 400 both mean the token is no good — expired, already rotated, or revoked as part of a
  // reuse detection. 5xx means the API is broken, which is not the user's session's fault.
  if (!response.ok) {
    return response.status >= 500 ? { status: 'unavailable' } : { status: 'rejected' };
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

/** Test seam. Nothing in the application calls this. */
export function __resetRefreshState(): void {
  inFlight.clear();
}
