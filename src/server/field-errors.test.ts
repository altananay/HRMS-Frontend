import { describe, expect, it } from 'vitest';

import { FORM_LEVEL_FIELD, toFieldErrors, toFieldPath } from './field-errors';

/**
 * Table-driven, because the failure mode is silent. `setError('Email', …)` matches no registered
 * field, so React Hook Form files it away and renders nothing — the form appears to ignore a
 * perfectly good submission, with no console warning and no failing request. Every row here is a
 * shape one of the two producers actually emits.
 */
describe('toFieldPath', () => {
  it.each([
    // FluentValidation, via GlobalExceptionHandler.
    ['Email', 'email'],
    ['Password', 'password'],
    ['CompanyName', 'companyName'],
    ['WebSite', 'webSite'],
    ['NationalId', 'nationalId'],
    ['Sectors', 'sectors'],

    // Nested objects.
    ['SocialMedia.Github', 'socialMedia.github'],
    ['SocialMedia.WebSite', 'socialMedia.webSite'],

    // Collections — the shape that breaks a naive implementation.
    ['Educations[0].School', 'educations.0.school'],
    ['Educations[12].EndYear', 'educations.12.endYear'],
    ['JobExperiences[1].CompanyName', 'jobExperiences.1.companyName'],
    ['Skills[0]', 'skills.0'],
    ['Departments[2].NumberOfEmployees', 'departments.2.numberOfEmployees'],

    // ASP.NET's model binder, when the body cannot be deserialised at all. Different producer, same
    // dictionary — already camelCase, and prefixed with a JSON-path root.
    ['$.deadline', 'deadline'],
    ['$.openPositions', 'openPositions'],
    ['$', FORM_LEVEL_FIELD],

    // Degenerate input must not produce an empty path: `setError('', …)` throws in RHF.
    ['', FORM_LEVEL_FIELD],
    ['.', FORM_LEVEL_FIELD],
  ])('%s → %s', (key, expected) => {
    expect(toFieldPath(key)).toBe(expected);
  });

  it('should_LowerOnlyTheFirstCharacter', () => {
    // A full `toLowerCase()` would turn `companyName` into `companyname`, which matches no field and
    // therefore displays nothing. This is the single most likely way to get this file wrong.
    expect(toFieldPath('CompanyPhone')).not.toBe('companyphone');
    expect(toFieldPath('CompanyPhone')).toBe('companyPhone');
  });
});

describe('toFieldErrors', () => {
  it('should_TranslateEveryKey', () => {
    expect(
      toFieldErrors({
        Email: ['Geçerli bir e-posta girin.'],
        'Educations[0].School': ['Okul adı zorunludur.'],
      }),
    ).toEqual({
      email: ['Geçerli bir e-posta girin.'],
      'educations.0.school': ['Okul adı zorunludur.'],
    });
  });

  it('should_MergeKeysThatCollideAfterTranslation', () => {
    // `Email` and `email` in one payload both become `email`. Overwriting would drop one message
    // with nothing to indicate it happened.
    expect(toFieldErrors({ Email: ['bir'], email: ['iki'] })).toEqual({ email: ['bir', 'iki'] });
  });

  it('should_SkipEntriesWithNoMessages', () => {
    expect(toFieldErrors({ Email: [], Password: ['zorunlu'] })).toEqual({ password: ['zorunlu'] });
  });

  it('should_TolerateAMalformedDictionary', () => {
    // The value is typed `string[]`, but it arrives over the wire from another process.
    const errors = { Email: 'not an array' } as unknown as Record<string, string[]>;

    expect(toFieldErrors(errors)).toEqual({});
  });
});
