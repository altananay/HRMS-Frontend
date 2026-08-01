import { describe, expect, it } from 'vitest';

import { FORM_LEVEL_FIELD, toFieldErrors, toFieldPath } from './field-errors';

describe('toFieldPath', () => {
  it.each([
    ['Email', 'email'],
    ['Password', 'password'],
    ['CompanyName', 'companyName'],
    ['WebSite', 'webSite'],
    ['NationalId', 'nationalId'],
    ['Sectors', 'sectors'],

    ['SocialMedia.Github', 'socialMedia.github'],
    ['SocialMedia.WebSite', 'socialMedia.webSite'],

    ['Educations[0].School', 'educations.0.school'],
    ['Educations[12].EndYear', 'educations.12.endYear'],
    ['JobExperiences[1].CompanyName', 'jobExperiences.1.companyName'],
    ['Skills[0]', 'skills.0'],
    ['Departments[2].NumberOfEmployees', 'departments.2.numberOfEmployees'],

    ['$.deadline', 'deadline'],
    ['$.openPositions', 'openPositions'],
    ['$', FORM_LEVEL_FIELD],

    ['', FORM_LEVEL_FIELD],
    ['.', FORM_LEVEL_FIELD],
  ])('%s → %s', (key, expected) => {
    expect(toFieldPath(key)).toBe(expected);
  });

  it('should_LowerOnlyTheFirstCharacter', () => {
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
    expect(toFieldErrors({ Email: ['bir'], email: ['iki'] })).toEqual({ email: ['bir', 'iki'] });
  });

  it('should_SkipEntriesWithNoMessages', () => {
    expect(toFieldErrors({ Email: [], Password: ['zorunlu'] })).toEqual({ password: ['zorunlu'] });
  });

  it('should_TolerateAMalformedDictionary', () => {
    const errors = { Email: 'not an array' } as unknown as Record<string, string[]>;

    expect(toFieldErrors(errors)).toEqual({});
  });
});
