import { UserType } from '@/contracts/enums';

/**
 * Where each role's own area lives.
 *
 * Defined once because three places need it — the sign-in redirect, the account menu and the mobile
 * drawer — and three copies would drift the moment a route moved.
 */
export const DASHBOARD_BY_USER_TYPE: Record<string, string> = {
  [UserType.JobSeeker]: '/profile',
  [UserType.Employer]: '/company',
  [UserType.SystemStaff]: '/admin',
};
