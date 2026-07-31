import { z } from 'zod';

/**
 * The shared building blocks every schema is assembled from.
 *
 * These mirror `Core/Application/Validation/Validators.cs` **deliberately and by hand**. The
 * duplication is the point: the client copy exists so a user sees a problem before a round trip, and
 * the server copy is the only one that decides anything. If you change one, change the other in the
 * same commit and say so in the message.
 *
 * Messages are produced by a translator passed in from the component rather than hard-coded, so a
 * validation error obeys the same i18n rule as every other piece of user-facing text. Tests pass a
 * stub, which also keeps them asserting on *which inputs fail* rather than on prose.
 */

/**
 * The message keys a schema may use.
 *
 * Spelled out rather than left as `string` so that `useTranslations()`'s own typed translator is
 * assignable here: its parameter is the union of every real key, and a function accepting a wider
 * union satisfies one accepting a narrower one. Widening this to `string` would break that in the
 * other direction and force a cast at every call site — and a typo in a key would go back to
 * rendering the key itself on screen.
 */
export type ValidationKey =
  | 'validation.required'
  | 'validation.email'
  | 'validation.minLength'
  | 'validation.maxLength'
  | 'validation.integer'
  | 'validation.positive'
  | 'validation.nationalId'
  | 'validation.passwordsDoNotMatch'
  | 'validation.year'
  | 'validation.endBeforeStart';

export type Translate = (key: ValidationKey, values?: Record<string, string | number>) => string;

/** Backend column widths. Exceeding one is a 400 from the API, so the form should catch it first. */
export const MAX = {
  email: 256,
  name: 100,
  companyName: 200,
  phone: 32,
  webSite: 256,
  description: 4000,
  sector: 100,
  subject: 200,
  message: 4000,
  title: 200,
  jobDescription: 8000,
  note: 2000,
} as const;

/** `PasswordPolicy.MinimumLength`. Length only — no character-class rules, by decision. */
export const PASSWORD_MIN_LENGTH = 5;

export function email(t: Translate) {
  return z
    .string()
    .trim()
    .min(1, t('validation.required'))
    .email(t('validation.email'))
    .max(MAX.email, t('validation.maxLength', { max: MAX.email }));
}

/**
 * A password being **set**. Registration, reset, change.
 *
 * Not the same as the one being **checked** — see `currentPassword`. The backend draws that line too,
 * and for a good reason.
 */
export function newPassword(t: Translate) {
  return z
    .string()
    .min(1, t('validation.required'))
    .min(PASSWORD_MIN_LENGTH, t('validation.minLength', { min: PASSWORD_MIN_LENGTH }));
}

/**
 * A password being **checked**: presence only.
 *
 * `LoginCommandValidator` is explicit about why — a length rule on sign-in discloses the policy to an
 * anonymous caller, and would lock out any password that predates the current one. Do not "improve"
 * this by reusing `newPassword`.
 */
export function currentPassword(t: Translate) {
  return z.string().min(1, t('validation.required'));
}

export function requiredText(t: Translate, { min = 1, max }: { min?: number; max: number }) {
  const base = z.string().trim().min(1, t('validation.required'));

  return min > 1
    ? base.min(min, t('validation.minLength', { min })).max(max, t('validation.maxLength', { max }))
    : base.max(max, t('validation.maxLength', { max }));
}

/**
 * An optional free-text field.
 *
 * Empty input becomes `undefined`, not `''`. An empty string round-trips to the API as a real value
 * and overwrites whatever was there; `undefined` is serialized away by `JSON.stringify`, which is
 * what "the user left it blank" should mean.
 */
export function optionalText(t: Translate, max: number) {
  return z
    .string()
    .trim()
    .max(max, t('validation.maxLength', { max }))
    .optional()
    .transform((value) => (value ? value : undefined));
}

/**
 * A positive whole number that may be left blank.
 *
 * The input arrives as a string, because that is what an `<input>` holds — including `''` for empty
 * and `'abc'` for a paste. Coercing with `z.coerce.number()` would turn both into `NaN` and `0`
 * respectively, and `0` would sail past a `.positive()` check on the wrong side of the boundary.
 */
export function optionalPositiveInt(t: Translate) {
  return z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === '' || value === null) return undefined;
      const parsed = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    })
    .refine((value) => value === undefined || Number.isInteger(value), t('validation.integer'))
    .refine((value) => value === undefined || value > 0, t('validation.positive'));
}

/** `RegisterJobSeekerCommandValidator`: exactly eleven digits, and only when supplied. */
export function optionalNationalId(t: Translate) {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine((value) => value === undefined || /^[0-9]{11}$/.test(value), t('validation.nationalId'));
}

/** A chip list — sectors, skills. Each entry is bounded; the list itself may be empty. */
export function tagList(t: Translate, max: number) {
  return z
    .array(z.string().trim().min(1, t('validation.required')).max(max, t('validation.maxLength', { max })))
    .default([]);
}
