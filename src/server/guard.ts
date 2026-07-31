import 'server-only';

import { redirect } from 'next/navigation';

import type { AuthenticatedUserResponse } from '@/contracts/responses';

import { getSession, hasRole } from './session';

/**
 * **The real authorization check**, run in a segment layout before anything in that segment renders.
 *
 * `middleware.ts` only sees whether a cookie exists — the Edge runtime cannot verify a JWT and the
 * backend's signing key must never be copied into this app. This runs on the server with a verified
 * `/auth/me` behind it, so a forged or revoked cookie gets nothing.
 *
 * It is still not the last line: every request the panel makes goes to the API, which checks the same
 * thing again. This exists so an unauthorized visitor sees a sign-in page instead of a panel full of
 * failed requests.
 */
export async function requireRole(...roles: string[]): Promise<AuthenticatedUserResponse> {
  const user = await getSession();

  if (!user) redirect('/login');

  // Signed in as the wrong role. Sending them to their own panel rather than to a 403 screen: they
  // are not doing anything wrong, they followed a link meant for someone else.
  if (roles.length > 0 && !hasRole(user, ...roles)) redirect('/');

  return user;
}
