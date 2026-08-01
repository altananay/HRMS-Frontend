import { describe, expect, it } from 'vitest';

import { allowedEntries, isAllowed } from './allowlist';

const GUID = '018f4a2b-9c1d-7e3f-8a4b-5c6d7e8f9a0b';

describe('isAllowed', () => {
  it.each([
    ['GET', ['JobAdvertisements', 'getall']],
    ['GET', ['JobAdvertisements', 'getbyid', GUID]],
    ['POST', ['JobAdvertisements', 'add']],
    ['PUT', ['Cvs', 'update']],
    ['POST', ['Cvs', 'uploadfile']],
    ['GET', ['Cvs', 'files', GUID]],
    ['DELETE', ['Cvs', 'files', GUID]],
    ['GET', ['Employers', 'public']],
    ['GET', ['Contacts']],
    ['POST', ['Contacts']],
  ] as const)('should_Allow_%s_%s', (method, segments) => {
    expect(isAllowed(method, segments)).toBe(true);
  });

  it('should_RejectAMethodTheEndpointDoesNotSupport', () => {
    expect(isAllowed('GET', ['JobAdvertisements', 'add'])).toBe(false);
    expect(isAllowed('DELETE', ['Contacts'])).toBe(false);
    expect(isAllowed('POST', ['Users', 'getall'])).toBe(false);
  });

  it('should_RejectAnEndpointThatIsNotListed', () => {
    expect(isAllowed('GET', ['Logs', 'getall'])).toBe(false);
    expect(isAllowed('GET', ['JobAdvertisements'])).toBe(false);
    expect(isAllowed('GET', ['JobAdvertisements', 'getall', 'extra'])).toBe(false);
  });

  it('should_NeverExposeTheAuthEndpoints', () => {
    for (const path of [
      ['auth', 'login'],
      ['auth', 'refresh'],
      ['auth', 'logout'],
      ['auth', 'me'],
      ['auth', 'register', 'jobseeker'],
      ['auth', 'change-password'],
    ]) {
      expect(isAllowed('POST', path)).toBe(false);
      expect(isAllowed('GET', path)).toBe(false);
    }
  });

  it('should_RejectPathTraversal', () => {
    expect(isAllowed('GET', ['Cvs', '..', 'auth', 'me'])).toBe(false);
    expect(isAllowed('GET', ['Cvs', 'files', '..'])).toBe(false);
    expect(isAllowed('GET', ['Cvs', '.', 'getall'])).toBe(false);
    expect(isAllowed('GET', ['', 'getall'])).toBe(false);
  });

  it('should_RequireARealGuid_WhereTheRouteExpectsOne', () => {
    expect(isAllowed('GET', ['JobAdvertisements', 'getbyid', 'getall'])).toBe(false);
    expect(isAllowed('GET', ['JobAdvertisements', 'getbyid', '123'])).toBe(false);
    expect(isAllowed('GET', ['JobAdvertisements', 'getbyid', `${GUID}x`])).toBe(false);
  });

  it('should_AcceptAGuidInEitherCase', () => {
    expect(isAllowed('GET', ['JobAdvertisements', 'getbyid', GUID.toUpperCase()])).toBe(true);
  });

  it('should_BeCaseSensitiveOnLiteralSegments', () => {
    expect(isAllowed('GET', ['jobadvertisements', 'getall'])).toBe(false);
  });
});

describe('the table itself', () => {
  it('should_ContainNoDuplicates', () => {
    const seen = allowedEntries.map(([method, path]) => `${method} ${path}`);

    expect(new Set(seen).size).toBe(seen.length);
  });

  it('should_NotListAnythingUnderAuth', () => {
    expect(allowedEntries.filter(([, path]) => path.toLowerCase().startsWith('auth'))).toEqual([]);
  });
});
