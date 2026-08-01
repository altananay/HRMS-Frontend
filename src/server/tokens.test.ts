import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  REFRESH_SKEW_MS,
  __resetRefreshState,
  needsRefresh,
  readExpiry,
  refreshOnce,
} from './tokens';

const API = 'https://api.test';

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
    expect(needsRefresh(at(REFRESH_SKEW_MS - 1_000), now)).toBe(true);
    expect(needsRefresh(at(REFRESH_SKEW_MS + 1_000), now)).toBe(false);
  });

  it.each([
    ['there is no token', undefined],
    ['the token is unreadable', 'garbage'],
  ])('should_BeTrue_When_%s', (_label, token) => {
    expect(needsRefresh(token, now)).toBe(true);
  });
});

describe('refreshOnce', () => {
  it('should_SendExactlyOneUpstreamRequest_ForTenConcurrentCallers', async () => {
    let resolveUpstream: (value: Response) => void = () => {};
    const upstream = new Promise<Response>((resolve) => {
      resolveUpstream = resolve;
    });

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockReturnValue(upstream);

    const callers = Array.from({ length: 10 }, () => refreshOnce('shared-token', API));

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

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should_ClearTheInFlightEntry_WhenTheRequestFails', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('connection refused'))
      .mockResolvedValueOnce(jsonResponse(tokenPair('new')));

    expect(await refreshOnce('token', API)).toEqual({ status: 'unavailable' });
    expect(await refreshOnce('token', API)).toMatchObject({ status: 'refreshed' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([
    [401, 'rejected'],
    [400, 'rejected'],
    [500, 'unavailable'],
    [503, 'unavailable'],
  ])('should_Map%dTo%s', async (status, expected) => {
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
