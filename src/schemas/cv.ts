import { z } from 'zod';

import { LanguageLevel } from '@/contracts/enums';
import type { CreateCvRequest, UpdateCvRequest } from '@/contracts/requests';
import type { CvResponse } from '@/contracts/responses';

import { MAX, optionalText, requiredText, tagList, type Translate } from './rules';

const YEAR_MIN = 1950;

function optionalYear(t: Translate) {
  return z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === '' || value === null) return undefined;
      const parsed = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    })
    .refine((value) => value === undefined || Number.isInteger(value), t('validation.integer'))
    .refine(
      (value) => value === undefined || (value >= YEAR_MIN && value <= new Date().getFullYear() + 10),
      t('validation.year'),
    );
}

const endYearAfterStart = (t: Translate) => ({
  check: (value: { startYear?: number | undefined; endYear?: number | undefined }) =>
    value.startYear === undefined || value.endYear === undefined || value.endYear >= value.startYear,
  options: { message: t('validation.endBeforeStart'), path: ['endYear'] },
});

export function educationSchema(t: Translate) {
  const rule = endYearAfterStart(t);

  return z
    .object({
      school: requiredText(t, { max: MAX.companyName }),
      major: requiredText(t, { max: MAX.companyName }),
      grade: optionalText(t, 50),
      startYear: optionalYear(t),
      endYear: optionalYear(t),
      isGraduated: z.boolean().default(false),
    })
    .refine(rule.check, rule.options);
}

export function jobExperienceSchema(t: Translate) {
  const rule = endYearAfterStart(t);

  return z
    .object({
      companyName: requiredText(t, { max: MAX.companyName }),
      department: optionalText(t, MAX.companyName),
      position: requiredText(t, { max: MAX.companyName }),
      startYear: optionalYear(t),
      endYear: optionalYear(t),
      description: optionalText(t, MAX.note),
    })
    .refine(rule.check, rule.options);
}

export function cvLanguageSchema(t: Translate) {
  return z.object({
    name: requiredText(t, { max: MAX.name }),
    level: z.enum(Object.values(LanguageLevel) as [string, ...string[]]),
  });
}

export function cvProjectSchema(t: Translate) {
  return z.object({
    name: requiredText(t, { max: MAX.companyName }),
    description: optionalText(t, MAX.note),
  });
}

export function cvSchema(t: Translate) {
  return z.object({
    information: optionalText(t, MAX.description),
    hobbies: optionalText(t, MAX.note),
    skills: tagList(t, MAX.sector),
    socialMedia: z.object({
      github: optionalText(t, MAX.webSite),
      linkedin: optionalText(t, MAX.webSite),
      webSite: optionalText(t, MAX.webSite),
    }),
    educations: z.array(educationSchema(t)).default([]),
    jobExperiences: z.array(jobExperienceSchema(t)).default([]),
    languages: z.array(cvLanguageSchema(t)).default([]),
    projects: z.array(cvProjectSchema(t)).default([]),
  });
}

export type CvValues = z.output<ReturnType<typeof cvSchema>>;
export type CvInput = z.input<ReturnType<typeof cvSchema>>;

export function fromCvResponse(cv: CvResponse): CvInput {
  return {
    information: cv.information ?? '',
    hobbies: cv.hobbies ?? '',
    skills: cv.skills,
    socialMedia: {
      github: cv.socialMedia?.github ?? '',
      linkedin: cv.socialMedia?.linkedin ?? '',
      webSite: cv.socialMedia?.webSite ?? '',
    },
    educations: cv.educations.map((education) => ({
      school: education.school,
      major: education.major,
      grade: education.grade ?? '',
      startYear: education.startYear ?? '',
      endYear: education.endYear ?? '',
      isGraduated: education.isGraduated,
    })),
    jobExperiences: cv.jobExperiences.map((experience) => ({
      companyName: experience.companyName,
      department: experience.department ?? '',
      position: experience.position,
      startYear: experience.startYear ?? '',
      endYear: experience.endYear ?? '',
      description: experience.description ?? '',
    })),
    languages: cv.languages.map((language) => ({ name: language.name, level: language.level })),
    projects: cv.projects.map((project) => ({
      name: project.name,
      description: project.description ?? '',
    })),
  };
}

export function emptyCv(): CvInput {
  return {
    information: '',
    hobbies: '',
    skills: [],
    socialMedia: { github: '', linkedin: '', webSite: '' },
    educations: [],
    jobExperiences: [],
    languages: [],
    projects: [],
  };
}

function toWire(values: CvValues) {
  return {
    information: values.information ?? null,
    hobbies: values.hobbies ?? null,
    skills: values.skills,
    socialMedia: {
      github: values.socialMedia.github ?? null,
      linkedin: values.socialMedia.linkedin ?? null,
      webSite: values.socialMedia.webSite ?? null,
    },
    educations: values.educations.map((education) => ({
      school: education.school,
      major: education.major,
      grade: education.grade ?? null,
      startYear: education.startYear ?? null,
      endYear: education.endYear ?? null,
      isGraduated: education.isGraduated,
    })),
    jobExperiences: values.jobExperiences.map((experience) => ({
      companyName: experience.companyName,
      department: experience.department ?? null,
      position: experience.position,
      startYear: experience.startYear ?? null,
      endYear: experience.endYear ?? null,
      description: experience.description ?? null,
    })),
    languages: values.languages.map((language) => ({
      name: language.name,
      level: language.level as CreateCvRequest['languages'][number]['level'],
    })),
    projects: values.projects.map((project) => ({
      name: project.name,
      description: project.description ?? null,
    })),
  };
}

export function toCreateCvRequest(values: CvValues): CreateCvRequest {
  return { imageUrl: null, ...toWire(values) };
}

export function toUpdateCvRequest(values: CvValues, cv: CvResponse): UpdateCvRequest {
  return {
    id: cv.id,
    imageUrl: cv.imageUrl,
    ...toWire(values),
  };
}
