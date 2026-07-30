import { z } from 'zod';

import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterEmployerRequest,
  RegisterJobSeekerRequest,
  ResetPasswordRequest,
} from '@/contracts/requests';
import { toDateOnly } from '@/lib/format';

import {
  MAX,
  currentPassword,
  email,
  newPassword,
  optionalNationalId,
  optionalPositiveInt,
  optionalText,
  requiredText,
  tagList,
  type Translate,
} from './rules';

/**
 * Sign-in and registration forms.
 *
 * Schemas are factories rather than constants because their messages are translated. Call them inside
 * a `useMemo` keyed on the translator.
 *
 * The form types and the wire types are **not** the same shape, and each mapper below says where they
 * part company. That is the whole reason `contracts/`, `schemas/` and `*.map` are three layers rather
 * than one inferred type.
 */

export function loginSchema(t: Translate) {
  return z.object({
    email: email(t),
    // Presence only — `LoginCommandValidator` is deliberate about this and so are we.
    password: currentPassword(t),
  });
}

/** What the schema produces — what the submit handler and the mappers receive. */
export type LoginValues = z.output<ReturnType<typeof loginSchema>>;

/** What the fields hold before parsing. This is the type the form and its inputs are generic over. */
export type LoginInput = z.input<ReturnType<typeof loginSchema>>;

export function registerJobSeekerSchema(t: Translate) {
  return z.object({
    email: email(t),
    password: newPassword(t),
    firstName: requiredText(t, { min: 2, max: MAX.name }),
    lastName: requiredText(t, { min: 2, max: MAX.name }),
    nationalId: optionalNationalId(t),
    // `Date | null` from the MUI picker, never a string. Converting happens in the mapper, once.
    dateOfBirth: z.date().nullable().default(null),
  });
}

/** What the schema produces — what the submit handler and the mappers receive. */
export type RegisterJobSeekerValues = z.output<ReturnType<typeof registerJobSeekerSchema>>;

/** What the fields hold before parsing. This is the type the form and its inputs are generic over. */
export type RegisterJobSeekerInput = z.input<ReturnType<typeof registerJobSeekerSchema>>;

export function registerEmployerSchema(t: Translate) {
  return z.object({
    email: email(t),
    password: newPassword(t),
    companyName: requiredText(t, { min: 2, max: MAX.companyName }),
    companyPhone: optionalText(t, MAX.phone),
    webSite: optionalText(t, MAX.webSite),
    description: optionalText(t, MAX.description),
    numberOfEmployees: optionalPositiveInt(t),
    sectors: tagList(t, MAX.sector),
  });
}

/** What the schema produces — what the submit handler and the mappers receive. */
export type RegisterEmployerValues = z.output<ReturnType<typeof registerEmployerSchema>>;

/** What the fields hold before parsing. This is the type the form and its inputs are generic over. */
export type RegisterEmployerInput = z.input<ReturnType<typeof registerEmployerSchema>>;

export function forgotPasswordSchema(t: Translate) {
  return z.object({ email: email(t) });
}

/** What the schema produces — what the submit handler and the mappers receive. */
export type ForgotPasswordValues = z.output<ReturnType<typeof forgotPasswordSchema>>;

/** What the fields hold before parsing. This is the type the form and its inputs are generic over. */
export type ForgotPasswordInput = z.input<ReturnType<typeof forgotPasswordSchema>>;

/**
 * `confirmPassword` exists **only here**. The API has no such field and never sees it.
 *
 * A confirmation box is the one guard against a typo in a password the user cannot see and is about
 * to be locked out by, so it belongs in the form — and nowhere near the contract. `toResetPasswordRequest`
 * drops it.
 */
export function resetPasswordSchema(t: Translate) {
  return z
    .object({
      newPassword: newPassword(t),
      confirmPassword: z.string().min(1, t('validation.required')),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      message: t('validation.passwordsDoNotMatch'),
      // Reported on the confirmation box, not on the object: an object-level issue has no field to
      // attach to and RHF renders it nowhere.
      path: ['confirmPassword'],
    });
}

/** What the schema produces — what the submit handler and the mappers receive. */
export type ResetPasswordValues = z.output<ReturnType<typeof resetPasswordSchema>>;

/** What the fields hold before parsing. This is the type the form and its inputs are generic over. */
export type ResetPasswordInput = z.input<ReturnType<typeof resetPasswordSchema>>;

// ── Form values → wire ───────────────────────────────────────────────────────────────────────────

export function toLoginRequest(values: LoginValues): LoginRequest {
  return { email: values.email, password: values.password };
}

export function toRegisterJobSeekerRequest(
  values: RegisterJobSeekerValues,
): RegisterJobSeekerRequest {
  return {
    email: values.email,
    password: values.password,
    firstName: values.firstName,
    lastName: values.lastName,
    nationalId: values.nationalId ?? null,
    // `toDateOnly` reads local calendar parts. `toISOString().slice(0, 10)` would shift a date picked
    // at local midnight in UTC+3 back by one day.
    dateOfBirth: values.dateOfBirth ? toDateOnly(values.dateOfBirth) : null,
  };
}

export function toRegisterEmployerRequest(values: RegisterEmployerValues): RegisterEmployerRequest {
  return {
    email: values.email,
    password: values.password,
    companyName: values.companyName,
    companyPhone: values.companyPhone ?? null,
    webSite: values.webSite ?? null,
    description: values.description ?? null,
    numberOfEmployees: values.numberOfEmployees ?? null,
    sectors: values.sectors,
  };
}

export function toForgotPasswordRequest(values: ForgotPasswordValues): ForgotPasswordRequest {
  return { email: values.email };
}

export function toResetPasswordRequest(
  values: ResetPasswordValues,
  token: string,
): ResetPasswordRequest {
  // `confirmPassword` stops here. The token comes from the URL, not from a field, so it is passed in
  // rather than validated as part of the form.
  return { token, newPassword: values.newPassword };
}
