import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  REFRESH_SKEW_MS,
  __resetRefreshState,
  needsRefresh,
  readExpiry,
  refreshOnce,
} from './tokens';

const API = 'https://api.test';

/** A JWT with only the payload filled in — nothing here verifies a signature. */
function jwt(claims: Record<string, unknown>): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `header.${payload}.signature`;
}

function tokenPair(suffix: string) {
  return {
    data: {
      accessToken: `access-${suffix}`,
      accessTokenExpiresAt: '2026-08-01T00:15:00Z',
      refreshToken: `refresh-${suffix}`,
      refreshTokenExpiresAt: '2026-08-08T00:00:00Z',
    },
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  __resetRefreshState();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('readExpiry', () => {
  it('should_ReturnExpiryInMilliseconds', () => {
    expect(readExpiry(jwt({ exp: 1_800_000_000 }))).toBe(1_800_000_000_000);
  });

  it.each([
    ['not-a-jwt', 'no segments'],
    ['header.@@@@.signature', 'payload is not base64'],
    [`header.${Buffer.from('not json').toString('base64url')}.sig`, 'payload is not JSON'],
    [jwt({ sub: 'x' }), 'no exp claim'],
    [jwt({ exp: 'soon' }), 'exp is not a number'],
  ])('should_ReturnNull_When_%s', (token) => {
    expect(readExpiry(token)).toBeNull();
  });
});

describe('needsRefresh', () => {
  const now = Date.UTC(2026, 7, 1, 12, 0, 0);
  const at = (offsetMs: number) => jwt({ exp: Math.floor((now + offsetMs) / 1000) });

  it('should_BeFalse_WhenComfortablyValid', () => {
    expect(needsRefresh(at(10 * 60_000), now)).toBe(false);
  });

  it('should_BeTrue_WhenAlreadyExpired', () => {
    expect(needsRefresh(at(-1), now)).toBe(true);
  });

  it('should_BeTrue_WithinTheSkewWindow', () => {
    // The backend validates with `ClockSkew = TimeSpan.Zero`, so a token that expires mid-flight is
    // simply rejected — the window exists to make sure that never happens.
    expect(needsRefresh(at(REFRESH_SKEW_MS - 1_000), now)).toBe(true);
    expect(needsRefresh(at(REFRESH_SKEW_MS + 1_000), now)).toBe(false);
  });

  it.each([
    ['there is no token', undefined],
    ['the token is unreadable', 'garbage'],
  ])('should_BeTrue_When_%s', (_label, token) => {
    // Refreshing needlessly costs one request; skipping a needed refresh costs a 401.
    expect(needsRefresh(token, now)).toBe(true);
  });
});

describe('refreshOnce', () => {
  it('should_SendExactlyOneUpstreamRequest_ForTenConcurrentCallers', async () => {
    // **The exit gate for this phase.**
    //
    // `AuthManager.RefreshAsync` treats a second presentation of a rotated refresh token as theft: it
    // revokes the whole chain and bumps the security stamp, which signs the user out of every device
    // and surfaces as an ordinary 401. Ten parallel requests after an idle period is a completely
    // ordinary way to reach that, so "one upstream call" is a correctness requirement, not a
    // performance one.
    let resolveUpstream: (value: Response) => void = () => {};
    const upstream = new Promise<Response>((resolve) => {
      resolveUpstream = resolve;
    });

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockReturnValue(upstream);

    const callers = Array.from({ length: 10 }, () => refreshOnce('shared-token', API));

    // Every caller must have joined the same in-flight promise *before* it settles.
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveUpstream(jsonResponse(tokenPair('new')));

    const outcomes = await Promise.all(callers);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(outcomes).toHaveLength(10);

    for (const outcome of outcomes) {
      expect(outcome).toEqual({ status: 'refreshed', tokens: tokenPair('new').data });
    }
  });

  it('should_NotShareAPromise_BetweenDifferentTokens', async () => {
    // Keyed by token, so two users refreshing at the same moment never receive each other's session.
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (_url, init) => {
        const body = JSON.parse(String(init?.body)) as { refreshToken: string };
        return jsonResponse(tokenPair(body.refreshToken));
      });

    const [first, second] = await Promise.all([
      refreshOnce('alice', API),
      refreshOnce('bob', API),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(first).toMatchObject({ tokens: { accessToken: 'access-alice' } });
    expect(second).toMatchObject({ tokens: { accessToken: 'access-bob' } });
  });

  it('should_StartAFreshRequest_AfterTheFirstSettles', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse(tokenPair('new')));

    await refreshOnce('token', API);
    await refreshOnce('token', API);

    // Not cached — the entry is cleared on settle, or a stale success would be replayed forever.
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should_ClearTheInFlightEntry_WhenTheRequestFails', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('connection refused'))
      .mockResolvedValueOnce(jsonResponse(tokenPair('new')));

    expect(await refreshOnce('token', API)).toEqual({ status: 'unavailable' });
    // A rejected promise left in the map would poison every later refresh for that token.
    expect(await refreshOnce('token', API)).toMatchObject({ status: 'refreshed' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([
    [401, 'rejected'],
    [400, 'rejected'],
    [500, 'unavailable'],
    [503, 'unavailable'],
  ])('should_Map%dTo%s', async (status, expected) => {
    // The distinction decides whether the caller clears the cookies. A 5xx must never sign a user out
    // — that would log people out because a container was restarting.
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, status));

    expect(await refreshOnce('token', API)).toEqual({ status: expected });
  });

  it('should_BeUnavailable_WhenTheBodyIsNotATokenPair', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: { accessToken: 'x' } }));

    expect(await refreshOnce('token', API)).toEqual({ status: 'unavailable' });
  });

  it('should_PostTheRefreshTokenToTheApiRefreshEndpoint', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse(tokenPair('new')));

    await refreshOnce('the-token', API);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(`${API}/api/auth/refresh`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ refreshToken: 'the-token' });
  });
});
