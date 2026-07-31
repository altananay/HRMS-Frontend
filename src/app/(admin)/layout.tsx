import { Role } from '@/contracts/enums';
import { requireRole } from '@/server/guard';

/**
 * The admin panel's real guard, run before anything in the segment renders.
 *
 * `proxy.ts` only saw that a cookie existed — it does not verify the JWT. The API
 * checks the same role again on every request; this exists so the wrong visitor gets the sign-in page
 * rather than ten screens of 403s.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(Role.Admin);

  return children;
}
