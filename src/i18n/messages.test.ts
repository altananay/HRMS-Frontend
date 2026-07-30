import { describe, expect, it } from 'vitest';

import en from './messages/en.json';
import tr from './messages/tr.json';
import { defaultLocale, isAppLocale, locales } from './config';

/**
 * The bundles must stay key-for-key identical.
 *
 * next-intl does not throw on a missing key — it renders the key path, so `home.hero.subtitle`
 * appears verbatim in the English UI and the page still looks like it works. Nothing in the type
 * system catches it either: `messages.d.ts` types the keys against `tr.json` only, so a key added to
 * Turkish and forgotten in English compiles cleanly. This test is the only thing standing between
 * that mistake and production.
 */

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
    // Asserted separately from the equality above so a failure names the culprit instead of dumping
    // two 150-line arrays into the terminal.
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
    // `{year}` in one bundle and nothing in the other renders a blank instead of failing loudly.
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

/**
 * The ICU argument names in a message.
 *
 * The trailing `[},]` is load-bearing. An argument is always `{name}` or `{name, type, …}`, but a
 * plural's branches are also braces — `{count, plural, one {# opening} other {# openings}}` — and a
 * naive `\{(\w+)` happily reports `opening` and `openings` as arguments. That produced a failure on a
 * pair of messages that were perfectly consistent, which is the worst kind of test: one that has to
 * be argued with rather than trusted.
 */
function placeholders(message: string): string[] {
  return [...message.matchAll(/\{(\w+)\s*[},]/g)].map((match) => match[1] ?? '').sort();
}
