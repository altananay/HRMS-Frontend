/**
 * Request bodies and query strings, mirroring `Core/Application/Features/**‍/*Requests.cs`.
 *
 * The backend calls these `*Command` / `*Query`; here they are all `*Request`, per the project's
 * naming rule. The six nested records the backend already names `*Request` (`EducationRequest`,
 * `SocialMediaRequest`, …) keep their names verbatim.
 *
 * **Owner fields are deliberately absent.** The controllers overwrite `EmployerId`, `JobSeekerId`,
 * `RequestedBy` and `UserId` from the bearer token, so sending them is at best ignored. Two
 * exceptions are modelled as optional and documented at their type: `UpdateEmployerRequest.id`,
 * `UpdateJobSeekerRequest.id` and `UpdateCvRequest.jobSeekerId` are honoured **only for an admin**,
 * who names the target in the body. A non-admin's value is replaced with their own id.
 */

import type { DateOnlyString, Guid } from './envelope';
import type { JobApplicationStatus, JobType, LanguageLevel } from './enums';

/** `PageRequest`. Sent as a query string; `page` is 1-based. */
export type PageRequest = {
  page?: number;
  pageSize?: number;
};

// ── Auth ─────────────────────────────────────────────────────────────────────────────────────────

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterJobSeekerRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  /** TCKN. PII — never logged, never echoed back into the DOM. */
  nationalId?: string | null;
  dateOfBirth?: DateOnlyString | null;
};

export type RegisterEmployerRequest = {
  email: string;
  password: string;
  companyName: string;
  companyPhone?: string | null;
  webSite?: string | null;
  numberOfEmployees?: number | null;
  description?: string | null;
  sectors: string[];
};

export type RegisterSystemStaffRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
};

// ── Job advertisements ───────────────────────────────────────────────────────────────────────────

/**
 * `jobPositionName` is a free-text name, not an id: the backend resolves it to an existing position
 * or creates one. That is why the field is an `Autocomplete freeSolo` and not a `Select`.
 */
export type CreateJobAdvertisementRequest = {
  title: string;
  jobPositionName: string;
  description: string;
  experience?: string | null;
  city?: string | null;
  skills: string[];
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  openPositions: number;
  jobType: JobType;
  deadline: DateOnlyString;
};

/** Adds `id` and `isActive`; the deadline rule differs from create — see `schemas/job-advertisement.ts`. */
export type UpdateJobAdvertisementRequest = CreateJobAdvertisementRequest & {
  id: Guid;
  isActive: boolean;
};

export type GetAllJobAdvertisementRequest = PageRequest & {
  employerId?: Guid;
  isActive?: boolean;
  /** Exact match against the skills array. Not a substring — `"Java"` will not match `"JavaScript"`. */
  skill?: string;
  /** Case-insensitive whole city name. */
  city?: string;
  /** Case-insensitive substring of title **or** description. */
  search?: string;
  orderByHighestSalary?: boolean;
};

// ── Job applications ─────────────────────────────────────────────────────────────────────────────

export type CreateJobApplicationRequest = {
  jobAdvertisementId: Guid;
  jobSeekerNote?: string | null;
};

export type UpdateJobApplicationRequest = {
  id: Guid;
  status: JobApplicationStatus;
  employerNote?: string | null;
};

/**
 * `employerId` / `jobSeekerId` are overwritten from the token for those two roles, so only an admin
 * can actually filter by them. `jobAdvertisementId` and `status` work for everyone.
 */
export type GetAllJobApplicationRequest = PageRequest & {
  employerId?: Guid;
  jobSeekerId?: Guid;
  jobAdvertisementId?: Guid;
  status?: JobApplicationStatus;
};

// ── CV ───────────────────────────────────────────────────────────────────────────────────────────

export type EducationRequest = {
  school: string;
  major: string;
  grade?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  isGraduated: boolean;
};

export type JobExperienceRequest = {
  companyName: string;
  department?: string | null;
  position: string;
  startYear?: number | null;
  endYear?: number | null;
  description?: string | null;
};

export type CvLanguageRequest = {
  name: string;
  level: LanguageLevel;
};

export type CvProjectRequest = {
  name: string;
  description?: string | null;
};

export type SocialMediaRequest = {
  github?: string | null;
  linkedin?: string | null;
  webSite?: string | null;
};

export type CreateCvRequest = {
  information?: string | null;
  imageUrl?: string | null;
  hobbies?: string | null;
  skills: string[];
  socialMedia?: SocialMediaRequest | null;
  educations: EducationRequest[];
  jobExperiences: JobExperienceRequest[];
  languages: CvLanguageRequest[];
  projects: CvProjectRequest[];
};

/**
 * ⚠ **Full replacement, not a patch.** The manager replaces every collection wholesale, so an
 * omitted `educations` deletes all education rows without an error. Always build this from the
 * complete current CV — `fromCvResponse` exists for exactly that reason.
 */
export type UpdateCvRequest = CreateCvRequest & {
  id: Guid;
  /** Admin only; ignored for a job seeker, who may edit only their own CV. */
  jobSeekerId?: Guid;
};

// ── Employer / job seeker / system staff ─────────────────────────────────────────────────────────

export type DepartmentRequest = {
  name: string;
  numberOfEmployees?: number | null;
};

export type UpdateEmployerRequest = {
  /** Admin only; a non-admin's value is replaced with their own id. */
  id?: Guid;
  companyName: string;
  companyPhone?: string | null;
  webSite?: string | null;
  numberOfEmployees?: number | null;
  description?: string | null;
  sectors: string[];
  departments: DepartmentRequest[];
};

export type GetAllEmployerRequest = PageRequest & {
  orderByNumberOfEmployees?: boolean;
};

export type UpdateJobSeekerRequest = {
  /** Admin only; a non-admin's value is replaced with their own id. */
  id?: Guid;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: DateOnlyString | null;
};

export type UpdateSystemStaffRequest = {
  id: Guid;
  firstName: string;
  lastName: string;
  email: string;
};

// ── Job positions & contacts ─────────────────────────────────────────────────────────────────────

export type CreateJobPositionRequest = {
  name: string;
};

export type UpdateJobPositionRequest = {
  id: Guid;
  name: string;
};

export type CreateContactRequest = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
};

export type UpdateContactRequest = CreateContactRequest & {
  id: Guid;
  isHandled: boolean;
};
