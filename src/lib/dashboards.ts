import { UserType } from '@/contracts/enums';

export const DASHBOARD_BY_USER_TYPE: Record<string, string> = {
  [UserType.JobSeeker]: '/profile',
  [UserType.Employer]: '/company',
  [UserType.SystemStaff]: '/admin',
};
