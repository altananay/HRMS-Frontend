import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ApiError } from '@/contracts/api-error';

import { ApiRequestError, __resetRefreshState, api, auth } from './http';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function apiErrorResponse(error: Partial<ApiError> & Pick<ApiError, 'code' | 'status'>): Response {
  return jsonResponse({ title: 'Error', ...error }, error.status);
}

const SESSION_EXPIRED = apiErrorResponse({ status: 401, code: 'session_expired' });

beforeEach(() => {
  __resetRefreshState();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('request', () => {
  it('should_CallTheProxy_ForAnApiPath', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: 1 }));

    await api('JobAdvertisements/getall');

    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/proxy/JobAdvertisements/getall');
  });

  it('should_DropEmptyQueryParameters', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}));

    await api('JobAdvertisements/getall', {
      query: { page: 1, city: '', skill: undefined, search: 'react', isActive: false },
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      '/api/proxy/JobAdvertisements/getall?page=1&search=react&isActive=false',
    );
  });

  it('should_SerializeAnObjectBodyAsJson', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}));

    await api('Contacts', { method: 'POST', body: { subject: 'hello' } });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.body).toBe('{"subject":"hello"}');
    expect(new Headers(init?.headers).get('content-type')).toBe('application/json');
  });

  it('should_NotSetContentType_ForFormData', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}));
    const form = new FormData();
    form.set('files', new Blob(['x']), 'cv.pdf');

    await api('Cvs/uploadfile', { method: 'POST', body: form });

    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('content-type')).toBeNull();
  });

  it('should_ReturnUndefined_ForA204', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));

    expect(await auth('logout', { method: 'POST' })).toBeUndefined();
  });

  it('should_ThrowAnApiRequestError_ThatIsAlsoAnError', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      apiErrorResponse({ status: 409, code: 'conflict', detail: 'Bu ilana zaten başvurdunuz.' }),
    );

    const caught = await api('JobApplications/add', { method: 'POST' }).catch((e: unknown) => e);

    expect(caught).toBeInstanceOf(ApiRequestError);
    expect(caught).toBeInstanceOf(Error);
    expect(caught).toMatchObject({ status: 409, code: 'conflict' });
    expect((caught as ApiRequestError).detail).toBe('Bu ilana zaten başvurdunuz.');
  });

  it('should_ThrowANetworkError_WhenFetchRejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(api('JobAdvertisements/getall')).rejects.toMatchObject({
      status: 0,
      code: 'network',
    });
  });

  it('should_SynthesizeAnError_WhenTheBodyIsNotAnApiError', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html>oops</html>', { status: 500, headers: { 'content-type': 'text/html' } }),
    );

    await expect(api('JobAdvertisements/getall')).rejects.toMatchObject({
      status: 500,
      code: 'server',
    });
  });
});

describe('single-flight refresh', () => {
  it('should_RefreshOnce_ForTenConcurrentCallsThatAllExpire', async () => {
    let refreshCalls = 0;
    let proxyCalls = 0;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes('refresh-session')) {
        refreshCalls += 1;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return new Response(null, { status: 204 });
      }

      proxyCalls += 1;
      return proxyCalls <= 10 ? SESSION_EXPIRED.clone() : jsonResponse({ data: 'ok' });
    });

    const results = await Promise.all(
      Array.from({ length: 10 }, () => api<{ data: string }>('JobAdvertisements/getall')),
    );

    expect(refreshCalls).toBe(1);
    expect(proxyCalls).toBe(20);
    expect(results.every((result) => result.data === 'ok')).toBe(true);
  });

  it('should_RetryOnlyOnce', async () => {
    let refreshCalls = 0;
    let proxyCalls = 0;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      if (String(input).includes('refresh-session')) {
        refreshCalls += 1;
        return new Response(null, { status: 204 });
      }

      proxyCalls += 1;
      return SESSION_EXPIRED.clone();
    });

    await expect(api('JobAdvertisements/getall')).rejects.toMatchObject({
      code: 'session_expired',
    });

    expect(proxyCalls).toBe(2);
    expect(refreshCalls).toBe(1);
  });

  it('should_NotRefresh_ForAnAnonymous401', async () => {
    let refreshCalls = 0;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      if (String(input).includes('refresh-session')) {
        refreshCalls += 1;
        return new Response(null, { status: 204 });
      }

      return apiErrorResponse({ status: 401, code: 'unauthorized' });
    });

    await expect(api('Cvs/getall')).rejects.toMatchObject({ code: 'unauthorized' });
    expect(refreshCalls).toBe(0);
  });

  it('should_NotRetry_WhenTheRefreshItselfFails', async () => {
    let proxyCalls = 0;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      if (String(input).includes('refresh-session')) return new Response(null, { status: 401 });

      proxyCalls += 1;
      return SESSION_EXPIRED.clone();
    });

    await expect(api('Cvs/getall')).rejects.toMatchObject({ code: 'session_expired' });
    expect(proxyCalls).toBe(1);
  });

  it('should_StartAFreshRefresh_AfterTheFirstOneCompletes', async () => {
    let refreshCalls = 0;
    let proxyCalls = 0;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      if (String(input).includes('refresh-session')) {
        refreshCalls += 1;
        return new Response(null, { status: 204 });
      }

      proxyCalls += 1;
      return proxyCalls % 2 === 1 ? SESSION_EXPIRED.clone() : jsonResponse({ ok: true });
    });

    await api('Cvs/getall');
    await api('Cvs/getall');

    expect(refreshCalls).toBe(2);
  });
});
