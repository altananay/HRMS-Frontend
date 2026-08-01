import { describe, expect, it } from 'vitest';

import en from './messages/en.json';
import tr from './messages/tr.json';
import { defaultLocale, isAppLocale, locales } from './config';

type Json = { [key: string]: Json | string };

function flatten(value: Json, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === 'string' ? [path] : flatten(child, path);
  });
}

const trKeys = flatten(tr).sort();
const enKeys = flatten(en).sort();

describe('message bundles', () => {
  it('should_HaveIdenticalKeySets', () => {
    expect(enKeys).toEqual(trKeys);
  });

  it('should_ReportMissingKeysByName_WhenTheyDiverge', () => {
    expect(trKeys.filter((key) => !enKeys.includes(key))).toEqual([]);
    expect(enKeys.filter((key) => !trKeys.includes(key))).toEqual([]);
  });

  it('should_NotContainEmptyStrings', () => {
    const empties = [
      ...Object.entries({ tr, en }).flatMap(([locale, bundle]) =>
        flatten(bundle as Json)
          .filter((path) => resolve(bundle as Json, path).trim().length === 0)
          .map((path) => `${locale}:${path}`),
      ),
    ];

    expect(empties).toEqual([]);
  });

  it('should_KeepIcuPlaceholdersConsistentAcrossLocales', () => {
    const mismatched = trKeys.filter(
      (path) =>
        placeholders(resolve(tr, path)).join(',') !== placeholders(resolve(en, path)).join(','),
    );

    expect(mismatched).toEqual([]);
  });
});

describe('locale config', () => {
  it('should_TreatTheDefaultLocaleAsSupported', () => {
    expect(locales).toContain(defaultLocale);
  });

  it.each([
    ['tr', true],
    ['en', true],
    ['de', false],
    ['TR', false],
    ['', false],
    [undefined, false],
    [null, false],
    [42, false],
  ])('isAppLocale(%o) should be %s', (value, expected) => {
    expect(isAppLocale(value)).toBe(expected);
  });
});

function resolve(bundle: Json, path: string): string {
  const value = path.split('.').reduce<Json | string | undefined>((node, key) => {
    if (node === undefined || typeof node === 'string') return undefined;
    return node[key];
  }, bundle);

  if (typeof value !== 'string') throw new Error(`${path} is not a string`);

  return value;
}

function placeholders(message: string): string[] {
  return [...message.matchAll(/\{(\w+)\s*[},]/g)].map((match) => match[1] ?? '').sort();
}
