import { z } from 'zod';

import { LanguageLevel } from '@/contracts/enums';
import type { CreateCvRequest, UpdateCvRequest } from '@/contracts/requests';
import type { CvResponse } from '@/contracts/responses';

import { MAX, optionalText, requiredText, tagList, type Translate } from './rules';

/**
 * The résumé form.
 *
 * ⚠ **`UpdateCvCommand` is a full replacement, not a patch.** The manager clears each collection and
 * re-inserts what it was given, so a request that omits `educations` deletes every education row — and
 * the API returns 200. There is no error, no warning, and nothing in the response to notice.
 *
 * `fromCvResponse` therefore builds the form from the **complete** existing résumé, and
 * `toUpdateCvRequest` sends every collection back. Those two functions are the only thing standing
 * between a user editing their hobbies and losing their work history. Do not "optimise" either into
 * sending a subset.
 */

const YEAR_MIN = 1950;

/** A four-digit year that may be left blank. Text input, so `''` is the empty state. */
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

/**
 * `EndYear >= StartYear`, mirroring `EducationRequestValidator` and `JobExperienceRequestValidator`.
 *
 * Written as an options object rather than a wrapper function: a generic helper taking
 * `z.ZodType<{startYear?, endYear?}>` erases every other property of the object it is applied to, and
 * the resulting `CvInput` loses `school`, `major` and the rest — which then makes every field-array
 * path fail to type-check for reasons that have nothing to do with the paths.
 *
 * `path: ['endYear']` puts the message on a field. An object-level issue has nowhere to render.
 */
const endYearAfterStart = (t: Translate) => ({
  check: (value: { startYear?: number | undefined; endYear?: number | undefined }) =>
    value.startYear === undefined || value.endYear === undefined || value.endYear >= value.startYear,
  // Not `as const` — Zod's `path` is a mutable `PropertyKey[]`, and a readonly tuple will not assign.
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

/**
 * Fills the form from an existing résumé — **every** field of it.
 *
 * This is the load-bearing half of the full-replacement contract. A field left out here is a field
 * that gets wiped on the next save, silently.
 */
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
      // `?? ''` and not `?? undefined`: an input whose value flips between a string and `undefined`
      // switches from controlled to uncontrolled and React resets the caret.
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

/** A blank résumé — the starting point for someone who has never created one. */
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
    // Not part of the form: there is no image upload in this system, and sending `null` would clear
    // whatever an admin or an earlier version had set.
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
    // Carried through rather than dropped: the update replaces the whole record, so a `null` here
    // would delete an image URL the form never showed.
    imageUrl: cv.imageUrl,
    ...toWire(values),
  };
}
