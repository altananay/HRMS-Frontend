import { z } from 'zod';

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
  | 'validation.endBeforeStart'
  | 'validation.currency'
  | 'validation.maxBelowMin'
  | 'validation.deadlineInPast';

export type Translate = (key: ValidationKey, values?: Record<string, string | number>) => string;

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

export const PASSWORD_MIN_LENGTH = 5;

const EMAIL = /^[^@\s]+@[^@\s]+$/;

export function email(t: Translate) {
  return z
    .string()
    .trim()
    .min(1, t('validation.required'))
    .regex(EMAIL, t('validation.email'))
    .max(MAX.email, t('validation.maxLength', { max: MAX.email }));
}

export function newPassword(t: Translate) {
  return z
    .string()
    .min(1, t('validation.required'))
    .min(PASSWORD_MIN_LENGTH, t('validation.minLength', { min: PASSWORD_MIN_LENGTH }));
}

export function currentPassword(t: Translate) {
  return z.string().min(1, t('validation.required'));
}

export function requiredText(t: Translate, { min = 1, max }: { min?: number; max: number }) {
  const base = z.string().trim().min(1, t('validation.required'));

  return min > 1
    ? base.min(min, t('validation.minLength', { min })).max(max, t('validation.maxLength', { max }))
    : base.max(max, t('validation.maxLength', { max }));
}

export function optionalText(t: Translate, max: number) {
  return z
    .string()
    .trim()
    .max(max, t('validation.maxLength', { max }))
    .optional()
    .transform((value) => (value ? value : undefined));
}

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

export function optionalNationalId(t: Translate) {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine((value) => value === undefined || /^[0-9]{11}$/.test(value), t('validation.nationalId'));
}

export function tagList(t: Translate, max: number) {
  return z
    .array(z.string().trim().min(1, t('validation.required')).max(max, t('validation.maxLength', { max })))
    .default([]);
}
