import { z } from 'zod';

import { JobType } from '@/contracts/enums';
import type {
  CreateJobAdvertisementRequest,
  UpdateJobAdvertisementRequest,
} from '@/contracts/requests';
import type { JobAdvertisementResponse } from '@/contracts/responses';
import { toDateOnly } from '@/lib/format';

import { MAX, optionalPositiveInt, optionalText, requiredText, tagList, type Translate } from './rules';

export function jobAdvertisementSchema(t: Translate, mode: 'create' | 'edit') {
  const base = z.object({
    title: requiredText(t, { min: 3, max: MAX.title }),
    jobPositionName: requiredText(t, { max: MAX.title }),
    description: requiredText(t, { min: 20, max: MAX.jobDescription }),
    experience: optionalText(t, MAX.note),
    city: optionalText(t, MAX.name),
    skills: tagList(t, MAX.sector),
    minSalary: optionalPositiveInt(t),
    maxSalary: optionalPositiveInt(t),
    currency: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value.toUpperCase() : undefined))
      .refine((value) => value === undefined || /^[A-Z]{3}$/.test(value), t('validation.currency')),
    openPositions: z
      .union([z.string(), z.number()])
      .transform((value) => {
        const parsed = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(parsed) ? parsed : Number.NaN;
      })
      .refine((value) => Number.isInteger(value), t('validation.integer'))
      .refine((value) => value > 0, t('validation.positive')),
    jobType: z.enum(Object.values(JobType) as [string, ...string[]]),
    deadline: z.date({ error: t('validation.required') }),
    isActive: z.boolean().default(true),
  });

  return base
    .refine(
      (values) =>
        values.minSalary === undefined ||
        values.maxSalary === undefined ||
        values.maxSalary >= values.minSalary,
      { message: t('validation.maxBelowMin'), path: ['maxSalary'] },
    )
    .refine(
      (values) => mode === 'edit' || toDateOnly(values.deadline) >= toDateOnly(new Date()),
      { message: t('validation.deadlineInPast'), path: ['deadline'] },
    );
}

export type JobAdvertisementValues = z.output<ReturnType<typeof jobAdvertisementSchema>>;
export type JobAdvertisementInput = z.input<ReturnType<typeof jobAdvertisementSchema>>;

export function emptyJobAdvertisement(): JobAdvertisementInput {
  const deadline = new Date();
  deadline.setMonth(deadline.getMonth() + 1);

  return {
    title: '',
    jobPositionName: '',
    description: '',
    experience: '',
    city: '',
    skills: [],
    minSalary: '',
    maxSalary: '',
    currency: 'TRY',
    openPositions: '1',
    jobType: JobType.FullTime,
    deadline,
    isActive: true,
  };
}

export function fromJobAdvertisement(job: JobAdvertisementResponse): JobAdvertisementInput {
  return {
    title: job.title,
    jobPositionName: job.jobPositionName,
    description: job.description,
    experience: job.experience ?? '',
    city: job.city ?? '',
    skills: job.skills,
    minSalary: job.minSalary ?? '',
    maxSalary: job.maxSalary ?? '',
    currency: job.currency ?? '',
    openPositions: job.openPositions,
    jobType: job.jobType,
    deadline: new Date(`${job.deadline}T00:00:00`),
    isActive: job.isActive,
  };
}

function toWire(values: JobAdvertisementValues) {
  return {
    title: values.title,
    jobPositionName: values.jobPositionName,
    description: values.description,
    experience: values.experience ?? null,
    city: values.city ?? null,
    skills: values.skills,
    minSalary: values.minSalary ?? null,
    maxSalary: values.maxSalary ?? null,
    currency: values.currency ?? null,
    openPositions: values.openPositions,
    jobType: values.jobType as CreateJobAdvertisementRequest['jobType'],
    deadline: toDateOnly(values.deadline),
  };
}

export function toCreateJobAdvertisementRequest(
  values: JobAdvertisementValues,
): CreateJobAdvertisementRequest {
  return toWire(values);
}

export function toUpdateJobAdvertisementRequest(
  values: JobAdvertisementValues,
  id: string,
): UpdateJobAdvertisementRequest {
  return { id, isActive: values.isActive, ...toWire(values) };
}
