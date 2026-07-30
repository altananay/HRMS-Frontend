import { describe, expect, it } from 'vitest';

import { networkError, toApiError } from './problem-details';

function problem(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/problem+json' },
  });
}

describe('toApiError', () => {
  it('should_ExtractFieldErrors_FromAValidationProblem', async () => {
    const error = await toApiError(
      problem(
        {
          title: 'Doğrulama hatası.',
          status: 400,
          errors: {
            Email: ['Geçerli bir e-posta girin.'],
            'Educations[0].School': ['Okul adı zorunludur.'],
          },
        },
        400,
      ),
    );

    expect(error.code).toBe('validation');
    expect(error.fieldErrors).toEqual({
      email: ['Geçerli bir e-posta girin.'],
      'educations.0.school': ['Okul adı zorunludur.'],
    });
  });

  it('should_Distinguish_ABusinessRuleFromAValidationFailure', async () => {
    // Both are 400. The presence of `errors` is the only reliable signal — the backend's titles
    // ("Doğrulama hatası." vs "İş kuralı ihlali.") are display strings, not a contract.
    const business = await toApiError(
      problem({ title: 'İş kuralı ihlali.', detail: 'Bu ilana zaten başvurdunuz.' }, 400),
    );

    expect(business.code).toBe('business');
    expect(business.detail).toBe('Bu ilana zaten başvurdunuz.');
    expect(business.fieldErrors).toBeUndefined();
  });

  it('should_TreatAnEmptyErrorsDictionaryAsABusinessRule', async () => {
    const error = await toApiError(problem({ title: 'x', errors: {} }, 400));

    expect(error.code).toBe('business');
  });

  it.each([
    [401, false, 'unauthorized'],
    [401, true, 'session_expired'],
    [403, true, 'forbidden'],
    [404, false, 'not_found'],
    [409, true, 'conflict'],
    [429, false, 'rate_limited'],
    [500, true, 'server'],
    [503, false, 'server'],
    [418, false, 'unknown'],
  ] as const)('should_Map%d_hadSession=%s_To_%s', async (status, hadSession, expected) => {
    expect((await toApiError(problem({ title: 't' }, status), hadSession)).code).toBe(expected);
  });

  it('should_SplitA401_OnWhetherASessionWasPresented', async () => {
    // `unauthorized` means nothing was presented, so there is nothing to refresh — retrying it would
    // be a guaranteed-useless round trip on every anonymous 401. `session_expired` is the one the
    // browser retries once.
    expect((await toApiError(new Response(null, { status: 401 }), false)).code).toBe('unauthorized');
    expect((await toApiError(new Response(null, { status: 401 }), true)).code).toBe(
      'session_expired',
    );
  });

  describe('responses that are not ProblemDetails at all', () => {
    it('should_HandleAnEmptyBody', async () => {
      // A 403 from the authorization middleware short-circuits before MVC runs, so
      // GlobalExceptionHandler never sees it and there is no body. `response.json()` on this throws.
      const error = await toApiError(new Response(null, { status: 403 }), true);

      expect(error).toMatchObject({ status: 403, code: 'forbidden' });
      expect(error.detail).toBeUndefined();
    });

    it('should_HandleThePlainTextBodyFromUseStatusCodePages', async () => {
      // What the rate limiter actually produces: `RejectionStatusCode` is written directly and
      // `UseStatusCodePages()` fills in text/plain.
      const response = new Response('Status Code: 429; Too Many Requests', {
        status: 429,
        headers: { 'content-type': 'text/plain' },
      });

      expect(await toApiError(response)).toMatchObject({ status: 429, code: 'rate_limited' });
    });

    it('should_HandleAJsonContentTypeWithATruncatedBody', async () => {
      const response = new Response('{"title": "trunc', {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });

      expect(await toApiError(response)).toMatchObject({ status: 500, code: 'server' });
    });

    it('should_HandleAJsonBodyThatIsNotAnObject', async () => {
      const response = new Response('"just a string"', {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });

      expect(await toApiError(response)).toMatchObject({ code: 'business' });
    });

    it('should_HandleAnHtmlErrorPage', async () => {
      const response = new Response('<html><body>502 Bad Gateway</body></html>', {
        status: 502,
        headers: { 'content-type': 'text/html' },
      });

      expect(await toApiError(response)).toMatchObject({ status: 502, code: 'server' });
    });
  });
});

describe('networkError', () => {
  it('should_UseStatusZero_SoItIsDistinguishableFromAnyHttpStatus', () => {
    const error = networkError(new Error('connect ECONNREFUSED 127.0.0.1:7129'));

    expect(error.status).toBe(0);
    expect(error.code).toBe('network');
    expect(error.title).toContain('ECONNREFUSED');
  });

  it('should_TolerateANonErrorCause', () => {
    expect(networkError('something odd')).toMatchObject({ status: 0, code: 'network' });
  });
});
