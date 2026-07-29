/**
 * Mirrors `Core/Domain/Enums/*`. The API serializes enums with `JsonStringEnumConverter`, so the
 * wire values are the C# member names verbatim.
 *
 * `as const` objects plus a union type rather than TypeScript `enum`: erasable syntax (so nothing
 * survives into the bundle), structurally typed, tree-shakeable, and `Object.values` feeds Zod for
 * free. A TS `enum` would give none of that and would not compare equal to the string on the wire.
 */

export const JobType = {
  FullTime: 'FullTime',
  PartTime: 'PartTime',
  Contract: 'Contract',
  Internship: 'Internship',
  Freelance: 'Freelance',
  Temporary: 'Temporary',
} as const;

export type JobType = (typeof JobType)[keyof typeof JobType];

export const JobApplicationStatus = {
  Submitted: 'Submitted',
  UnderReview: 'UnderReview',
  InterviewScheduled: 'InterviewScheduled',
  Offered: 'Offered',
  Accepted: 'Accepted',
  Rejected: 'Rejected',
  Withdrawn: 'Withdrawn',
} as const;

export type JobApplicationStatus =
  (typeof JobApplicationStatus)[keyof typeof JobApplicationStatus];

export const LanguageLevel = {
  Beginner: 'Beginner',
  Elementary: 'Elementary',
  Intermediate: 'Intermediate',
  UpperIntermediate: 'UpperIntermediate',
  Advanced: 'Advanced',
  Native: 'Native',
} as const;

export type LanguageLevel = (typeof LanguageLevel)[keyof typeof LanguageLevel];

export const UserType = {
  JobSeeker: 'JobSeeker',
  Employer: 'Employer',
  SystemStaff: 'SystemStaff',
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];

/** Only `Local` ships today; `R2` exists in the backend enum but is not configured. */
export const StorageProvider = {
  Local: 'Local',
  R2: 'R2',
} as const;

export type StorageProvider = (typeof StorageProvider)[keyof typeof StorageProvider];

/**
 * Role claim values, from `Core/Application/Utilities/Constants/Roles.cs`. Lower-case on the wire —
 * comparing against `UserType` values (`'JobSeeker'`) would silently never match.
 */
export const Role = {
  JobSeeker: 'jobseeker',
  Employer: 'employer',
  Admin: 'admin',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/** Ordered for display: the hiring pipeline, not alphabetical. */
export const jobApplicationStatusOrder: readonly JobApplicationStatus[] = [
  JobApplicationStatus.Submitted,
  JobApplicationStatus.UnderReview,
  JobApplicationStatus.InterviewScheduled,
  JobApplicationStatus.Offered,
  JobApplicationStatus.Accepted,
  JobApplicationStatus.Rejected,
  JobApplicationStatus.Withdrawn,
];

/** Ordered weakest to strongest, matching the backend's ordinals. */
export const languageLevelOrder: readonly LanguageLevel[] = [
  LanguageLevel.Beginner,
  LanguageLevel.Elementary,
  LanguageLevel.Intermediate,
  LanguageLevel.UpperIntermediate,
  LanguageLevel.Advanced,
  LanguageLevel.Native,
];
