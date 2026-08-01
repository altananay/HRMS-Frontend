import 'server-only';

import { redirect } from 'next/navigation';

import type { AuthenticatedUserResponse } from '@/contracts/responses';

import { getSession, hasRole } from './session';

export async function requireRole(...roles: string[]): Promise<AuthenticatedUserResponse> {
  const user = await getSession();

  if (!user) redirect('/login');

  if (roles.length > 0 && !hasRole(user, ...roles)) redirect('/');

  return user;
}
