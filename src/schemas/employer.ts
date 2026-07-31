import { z } from 'zod';

import type { UpdateEmployerRequest } from '@/contracts/requests';
import type { EmployerDetailResponse } from '@/contracts/responses';

import {
  MAX,
  optionalPositiveInt,
  optionalText,
  requiredText,
  tagList,
  type Translate,
} from './rules';

/**
 * The employer's own profile. Mirrors `UpdateEmployerCommandValidator`.
 *
 * ⚠ **`departments` is replaced wholesale**, exactly like the résumé's collections: the manager clears
 * the list and re-inserts what it receives. So the form is always loaded from the complete record and
 * always sends every department back. `fromEmployer` is the half that makes that true.
 *
 * `id` is not a field. The controller sets it from the token for a non-admin, and a body-supplied
 * owner would be an IDOR.
 */
export function employerProfileSchema(t: Translate) {
  return z.object({
    companyName: requiredText(t, { min: 2, max: MAX.companyName }),
    companyPhone: optionalText(t, MAX.phone),
    webSite: optionalText(t, MAX.webSite),
    description: optionalText(t, MAX.description),
    numberOfEmployees: optionalPositiveInt(t),
    sectors: tagList(t, MAX.sector),
    departments: z
      .array(
        z.object({
          name: requiredText(t, { max: MAX.companyName }),
          numberOfEmployees: optionalPositiveInt(t),
        }),
      )
      .default([]),
  });
}

export type EmployerProfileValues = z.output<ReturnType<typeof employerProfileSchema>>;
export type EmployerProfileInput = z.input<ReturnType<typeof employerProfileSchema>>;

export function fromEmployer(employer: EmployerDetailResponse): EmployerProfileInput {
  return {
    companyName: employer.companyName,
    companyPhone: employer.companyPhone ?? '',
    webSite: employer.webSite ?? '',
    description: employer.description ?? '',
    numberOfEmployees: employer.numberOfEmployees ?? '',
    sectors: employer.sectors,
    departments: employer.departments.map((department) => ({
      name: department.name,
      numberOfEmployees: department.numberOfEmployees ?? '',
    })),
  };
}

export function toUpdateEmployerRequest(values: EmployerProfileValues): UpdateEmployerRequest {
  return {
    companyName: values.companyName,
    companyPhone: values.companyPhone ?? null,
    webSite: values.webSite ?? null,
    description: values.description ?? null,
    numberOfEmployees: values.numberOfEmployees ?? null,
    sectors: values.sectors,
    departments: values.departments.map((department) => ({
      name: department.name,
      numberOfEmployees: department.numberOfEmployees ?? null,
    })),
  };
}
