import { Role } from '@/contracts/enums';
import { requireRole } from '@/server/guard';

/**
 * **The real guard for the job seeker panel.**
 *
 * `middleware.ts` only checked that a cookie exists — it cannot verify a JWT on the Edge runtime. This
 * runs on the server against a verified `/auth/me`, so a forged cookie gets a redirect rather than a
 * panel. The API checks the same thing again on every request it receives; this exists so the wrong
 * visitor sees the sign-in page instead of a screen full of 403s.
 *
 * Admins are deliberately **not** allowed in here. They have their own screens for moderating a
 * résumé, and letting them wander into "my applications" would show them somebody else's — or, worse,
 * their own empty one, which looks like data loss.
 */
export default async function JobSeekerLayout({ children }: { children: React.ReactNode }) {
  await requireRole(Role.JobSeeker);

  return children;
}
