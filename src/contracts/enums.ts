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

export const StorageProvider = {
  Local: 'Local',
  R2: 'R2',
} as const;

export type StorageProvider = (typeof StorageProvider)[keyof typeof StorageProvider];

export const Role = {
  JobSeeker: 'jobseeker',
  Employer: 'employer',
  Admin: 'admin',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const jobApplicationStatusOrder: readonly JobApplicationStatus[] = [
  JobApplicationStatus.Submitted,
  JobApplicationStatus.UnderReview,
  JobApplicationStatus.InterviewScheduled,
  JobApplicationStatus.Offered,
  JobApplicationStatus.Accepted,
  JobApplicationStatus.Rejected,
  JobApplicationStatus.Withdrawn,
];

export const languageLevelOrder: readonly LanguageLevel[] = [
  LanguageLevel.Beginner,
  LanguageLevel.Elementary,
  LanguageLevel.Intermediate,
  LanguageLevel.UpperIntermediate,
  LanguageLevel.Advanced,
  LanguageLevel.Native,
];
