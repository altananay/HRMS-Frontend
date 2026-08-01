import type { DateOnlyString, DateTimeString, Guid } from './envelope';
import type {
  JobApplicationStatus,
  JobType,
  LanguageLevel,
  StorageProvider,
  UserType,
} from './enums';

export type CreatedResponse = {
  id: Guid;
};

export type JobSeekerResponse = {
  id: Guid;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: DateOnlyString | null;
  isActive: boolean;
  createdAt: DateTimeString;
};

export type EmployerResponse = {
  id: Guid;
  email: string;
  companyName: string;
  companyPhone: string | null;
  webSite: string | null;
  numberOfEmployees: number | null;
  description: string | null;
  sectors: string[];
  isActive: boolean;
  createdAt: DateTimeString;
};

export type EmployerDetailResponse = EmployerResponse & {
  departments: DepartmentResponse[];
};

export type EmployerSummaryResponse = {
  id: Guid;
  companyName: string;
  webSite: string | null;
  numberOfEmployees: number | null;
  description: string | null;
  sectors: string[];
};

export type DepartmentResponse = {
  id: Guid;
  name: string;
  numberOfEmployees: number | null;
};

export type SystemStaffResponse = {
  id: Guid;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: DateTimeString;
};

export type UserSummaryResponse = {
  id: Guid;
  email: string;
  userType: UserType;
  isActive: boolean;
  createdAt: DateTimeString;
};

export type AuthenticatedUserResponse = {
  id: Guid;
  email: string;
  displayName: string;
  userType: UserType;
  roles: string[];
};

export type JobAdvertisementResponse = {
  id: Guid;
  employerId: Guid;
  companyName: string;
  companyPhone: string | null;
  webSite: string | null;
  email: string;
  jobPositionId: Guid;
  jobPositionName: string;
  title: string;
  description: string;
  experience: string | null;
  skills: string[];
  city: string | null;
  minSalary: number | null;
  maxSalary: number | null;
  currency: string | null;
  openPositions: number;
  jobType: JobType;
  deadline: DateOnlyString;
  isActive: boolean;
  createdAt: DateTimeString;
};

export type JobPositionResponse = {
  id: Guid;
  name: string;
};

export type JobApplicationResponse = {
  id: Guid;
  jobAdvertisementId: Guid;
  jobAdvertisementTitle: string;
  employerId: Guid;
  jobSeekerId: Guid;
  jobSeekerFullName: string;
  jobSeekerNote: string | null;
  employerNote: string | null;
  status: JobApplicationStatus;
  statusChangedAt: DateTimeString | null;
  createdAt: DateTimeString;
};

export type ContactResponse = {
  id: Guid;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  isHandled: boolean;
  createdAt: DateTimeString;
};

export type CvResponse = {
  id: Guid;
  jobSeekerId: Guid;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: DateOnlyString | null;
  information: string | null;
  imageUrl: string | null;
  hobbies: string | null;
  skills: string[];
  socialMedia: SocialMediaResponse | null;
  educations: EducationResponse[];
  jobExperiences: JobExperienceResponse[];
  languages: CvLanguageResponse[];
  projects: CvProjectResponse[];
  files: CvFileResponse[];
  createdAt: DateTimeString;
};

export type SocialMediaResponse = {
  github: string | null;
  linkedin: string | null;
  webSite: string | null;
};

export type EducationResponse = {
  id: Guid;
  school: string;
  major: string;
  grade: string | null;
  startYear: number | null;
  endYear: number | null;
  isGraduated: boolean;
};

export type JobExperienceResponse = {
  id: Guid;
  companyName: string;
  department: string | null;
  position: string;
  startYear: number | null;
  endYear: number | null;
  description: string | null;
};

export type CvLanguageResponse = {
  id: Guid;
  name: string;
  level: LanguageLevel;
};

export type CvProjectResponse = {
  id: Guid;
  name: string;
  description: string | null;
};

export type CvFileResponse = {
  id: Guid;
  fileName: string;
  storageProvider: StorageProvider;
  contentType: string | null;
  sizeBytes: number;
  createdAt: DateTimeString;
};
