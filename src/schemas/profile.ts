import { z } from 'zod';

import type { UpdateJobSeekerRequest } from '@/contracts/requests';
import type { JobSeekerResponse } from '@/contracts/responses';
import { toDateOnly } from '@/lib/format';

import {
  MAX,
  currentPassword,
  email,
  newPassword,
  requiredText,
  type Translate,
} from './rules';

export function jobSeekerProfileSchema(t: Translate) {
  return z.object({
    firstName: requiredText(t, { min: 2, max: MAX.name }),
    lastName: requiredText(t, { min: 2, max: MAX.name }),
    email: email(t),
    dateOfBirth: z.date().nullable().default(null),
  });
}

export type JobSeekerProfileValues = z.output<ReturnType<typeof jobSeekerProfileSchema>>;
export type JobSeekerProfileInput = z.input<ReturnType<typeof jobSeekerProfileSchema>>;

export function fromJobSeeker(seeker: JobSeekerResponse): JobSeekerProfileInput {
  return {
    firstName: seeker.firstName,
    lastName: seeker.lastName,
    email: seeker.email,
    dateOfBirth: seeker.dateOfBirth ? new Date(`${seeker.dateOfBirth}T00:00:00`) : null,
  };
}

export function toUpdateJobSeekerRequest(values: JobSeekerProfileValues): UpdateJobSeekerRequest {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    dateOfBirth: values.dateOfBirth ? toDateOnly(values.dateOfBirth) : null,
  };
}

export function changePasswordSchema(t: Translate) {
  return z
    .object({
      currentPassword: currentPassword(t),
      newPassword: newPassword(t),
      confirmPassword: z.string().min(1, t('validation.required')),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      message: t('validation.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });
}

export type ChangePasswordValues = z.output<ReturnType<typeof changePasswordSchema>>;
export type ChangePasswordInput = z.input<ReturnType<typeof changePasswordSchema>>;
