import { describe, expect, it } from 'vitest';

import { API_ERROR_CODES, type ApiError, type ApiErrorCode } from '@/contracts/api-error';
import en from '@/i18n/messages/en.json';
import tr from '@/i18n/messages/tr.json';

import { apiErrorMessage, errorMessageKey, hasFieldErrors } from './api-error';

const ALL_CODES = API_ERROR_CODES;

const echo = (key: `errors.${ApiErrorCode}`) => key;

function error(overrides: Partial<ApiError> & Pick<ApiError, 'code'>): ApiError {
  return { status: 400, title: 'Hata', ...overrides };
}

describe('errorMessageKey', () => {
  it.each(ALL_CODES)('should_HaveAMessageInBothBundles_For_%s', (code) => {
    const key = errorMessageKey(code).split('.')[1] as string;

    expect(tr.errors).toHaveProperty(key);
    expect(en.errors).toHaveProperty(key);
  });
});

describe('apiErrorMessage', () => {
  it.each(['validation', 'unauthorized', 'forbidden', 'not_found', 'rate_limited', 'network'] as const)(
    'should_UseTheTranslation_For_%s',
    (code) => {
      expect(apiErrorMessage(error({ code, detail: 'Türkçe bir açıklama' }), echo)).toBe(
        `errors.${code}`,
      );
    },
  );

  it('should_NeverShowTheDetail_ForAServerError', () => {
    const message = apiErrorMessage(
      error({
        code: 'server',
        status: 500,
        detail: 'System.NullReferenceException: Object reference not set...\n   at HRMS...',
      }),
      echo,
    );

    expect(message).toBe('errors.server');
  });

  it.each(['business', 'conflict'] as const)('should_PreferTheDetail_For_%s', (code) => {
    expect(apiErrorMessage(error({ code, detail: 'Bu ilana zaten başvurdunuz.' }), echo)).toBe(
      'Bu ilana zaten başvurdunuz.',
    );
  });

  it.each(['business', 'conflict'] as const)(
    'should_FallBackToTheTranslation_When_%s_HasNoDetail',
    (code) => {
      expect(apiErrorMessage(error({ code }), echo)).toBe(`errors.${code}`);
      expect(apiErrorMessage(error({ code, detail: '   ' }), echo)).toBe(`errors.${code}`);
    },
  );
});

describe('hasFieldErrors', () => {
  it('should_BeTrue_OnlyWhenThereIsSomethingToShowOnAField', () => {
    expect(hasFieldErrors(error({ code: 'validation', fieldErrors: { email: ['zorunlu'] } }))).toBe(
      true,
    );
  });

  it('should_BeFalse_ForAValidationErrorWithNoUsablePaths', () => {
    expect(hasFieldErrors(error({ code: 'validation' }))).toBe(false);
    expect(hasFieldErrors(error({ code: 'validation', fieldErrors: {} }))).toBe(false);
  });

  it('should_BeFalse_ForOtherCodes', () => {
    expect(hasFieldErrors(error({ code: 'business', fieldErrors: { email: ['x'] } }))).toBe(false);
  });
});
