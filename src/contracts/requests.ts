import type { DateOnlyString, Guid } from './envelope';
import type { JobApplicationStatus, JobType, LanguageLevel } from './enums';

export type PageRequest = {
  page?: number;
  pageSize?: number;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterJobSeekerRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
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

export type UpdateJobAdvertisementRequest = CreateJobAdvertisementRequest & {
  id: Guid;
  isActive: boolean;
};

export type GetAllJobAdvertisementRequest = PageRequest & {
  employerId?: Guid;
  isActive?: boolean;
  skill?: string;
  city?: string;
  search?: string;
  orderByHighestSalary?: boolean;
};

export type CreateJobApplicationRequest = {
  jobAdvertisementId: Guid;
  jobSeekerNote?: string | null;
};

export type UpdateJobApplicationRequest = {
  id: Guid;
  status: JobApplicationStatus;
  employerNote?: string | null;
};

export type GetAllJobApplicationRequest = PageRequest & {
  employerId?: Guid;
  jobSeekerId?: Guid;
  jobAdvertisementId?: Guid;
  status?: JobApplicationStatus;
};

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

export type UpdateCvRequest = CreateCvRequest & {
  id: Guid;
  jobSeekerId?: Guid;
};

export type DepartmentRequest = {
  name: string;
  numberOfEmployees?: number | null;
};

export type UpdateEmployerRequest = {
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
