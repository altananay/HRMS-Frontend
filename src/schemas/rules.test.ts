import { describe, expect, it } from 'vitest';

import { email, optionalNationalId, optionalPositiveInt, PASSWORD_MIN_LENGTH, newPassword } from './rules';

const t = (key: string) => key;

describe('email', () => {
  const parse = (value: string) => email(t).safeParse(value);

  it.each([
    'ada@example.com',
    'admin@hrms.e2e',
    'someone@3m.com',
    'user@web2.de',
    'first.last+tag@sub.domain.co.uk',
    'a@b',
  ])('should accept %s', (value) => {
    expect(parse(value).success, value).toBe(true);
  });

  it.each(['not-an-email', 'no@spaces here.com', 'two@@at.com', '@nothing.com', 'nothing@', ''])(
    'should reject %s',
    (value) => {
      expect(parse(value).success, value).toBe(false);
    },
  );

  it('should trim before validating', () => {
    const result = parse('  ada@example.com  ');

    expect(result.success).toBe(true);
    expect(result.data).toBe('ada@example.com');
  });
});

describe('newPassword', () => {
  it('should enforce length only, matching PasswordPolicy', () => {
    expect(newPassword(t).safeParse('12345').success).toBe(true);
    expect(newPassword(t).safeParse('!!!!!').success).toBe(true);
    expect(newPassword(t).safeParse('1234').success).toBe(false);
    expect(PASSWORD_MIN_LENGTH).toBe(5);
  });

  it('should not trim, because a password may legitimately end in a space', () => {
    expect(newPassword(t).safeParse('     ').success).toBe(true);
  });
});

describe('optionalPositiveInt', () => {
  it.each([
    ['', undefined],
    ['12', 12],
    [42, 42],
  ])('should parse %o to %o', (input, expected) => {
    const result = optionalPositiveInt(t).safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data).toBe(expected);
  });

  it.each(['0', '-3', 'abc', '1.5'])('should reject %s', (value) => {
    expect(optionalPositiveInt(t).safeParse(value).success, value).toBe(false);
  });
});

describe('optionalNationalId', () => {
  it('should accept exactly eleven digits, or nothing at all', () => {
    expect(optionalNationalId(t).safeParse('12345678901').success).toBe(true);
    expect(optionalNationalId(t).safeParse('').success).toBe(true);
    expect(optionalNationalId(t).safeParse(undefined).success).toBe(true);
  });

  it.each(['1234567890', '123456789012', '1234567890a'])('should reject %s', (value) => {
    expect(optionalNationalId(t).safeParse(value).success, value).toBe(false);
  });
});
