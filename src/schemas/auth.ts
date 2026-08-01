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

export function loginSchema(t: Translate) {
  return z.object({
    email: email(t),
    password: currentPassword(t),
  });
}

export type LoginValues = z.output<ReturnType<typeof loginSchema>>;

export type LoginInput = z.input<ReturnType<typeof loginSchema>>;

export function registerJobSeekerSchema(t: Translate) {
  return z.object({
    email: email(t),
    password: newPassword(t),
    firstName: requiredText(t, { min: 2, max: MAX.name }),
    lastName: requiredText(t, { min: 2, max: MAX.name }),
    nationalId: optionalNationalId(t),
    dateOfBirth: z.date().nullable().default(null),
  });
}

export type RegisterJobSeekerValues = z.output<ReturnType<typeof registerJobSeekerSchema>>;

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

export type RegisterEmployerValues = z.output<ReturnType<typeof registerEmployerSchema>>;

export type RegisterEmployerInput = z.input<ReturnType<typeof registerEmployerSchema>>;

export function forgotPasswordSchema(t: Translate) {
  return z.object({ email: email(t) });
}

export type ForgotPasswordValues = z.output<ReturnType<typeof forgotPasswordSchema>>;

export type ForgotPasswordInput = z.input<ReturnType<typeof forgotPasswordSchema>>;

export function resetPasswordSchema(t: Translate) {
  return z
    .object({
      newPassword: newPassword(t),
      confirmPassword: z.string().min(1, t('validation.required')),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      message: t('validation.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });
}

export type ResetPasswordValues = z.output<ReturnType<typeof resetPasswordSchema>>;

export type ResetPasswordInput = z.input<ReturnType<typeof resetPasswordSchema>>;

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
  return { token, newPassword: values.newPassword };
}
