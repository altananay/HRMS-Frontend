import { Role } from '@/contracts/enums';
import { requireRole } from '@/server/guard';

/**
 * The company panel's real guard. `middleware.ts` only saw that a cookie existed; this checks the role
 * against a verified `/auth/me` before anything in the segment renders.
 *
 * Admins are not admitted. They moderate postings and applications from their own screens, and letting
 * one in here would show them an employer panel scoped to their own (empty) employer id — which reads
 * as data loss rather than as a wrong turn.
 */
export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  await requireRole(Role.Employer);

  return children;
}
