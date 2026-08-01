import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';

import type { AuthenticatedUserResponse } from '@/contracts/responses';

import { apiFetch, readData } from './api-client';
import { API_BASE_URL, SESSION_COOKIE_SECURE } from './env';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  needsRefresh,
  refreshOnce,
  type SessionTokens,
} from './tokens';

const BASE_COOKIE = {
  httpOnly: true,
  sameSite: 'lax',
  secure: SESSION_COOKIE_SECURE,
  path: '/',
} as const;

export async function writeSession(tokens: SessionTokens): Promise<void> {
  const store = await cookies();
  const expires = parseExpiry(tokens.refreshTokenExpiresAt);

  store.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, { ...BASE_COOKIE, ...expires });
  store.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, { ...BASE_COOKIE, ...expires });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();

  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

export async function readTokens(): Promise<{ access?: string; refresh?: string }> {
  const store = await cookies();

  return {
    access: store.get(ACCESS_TOKEN_COOKIE)?.value,
    refresh: store.get(REFRESH_TOKEN_COOKIE)?.value,
  };
}

export async function ensureAccessToken(): Promise<string | undefined> {
  const { access, refresh } = await readTokens();

  if (!needsRefresh(access)) return access;
  if (!refresh) return undefined;

  const outcome = await refreshOnce(refresh, API_BASE_URL);

  if (outcome.status === 'refreshed') {
    await writeSession(outcome.tokens);
    return outcome.tokens.accessToken;
  }

  if (outcome.status === 'rejected') {
    await clearSession();
    return undefined;
  }

  return access;
}

export const getSession = cache(async (): Promise<AuthenticatedUserResponse | null> => {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) return null;

  try {
    const response = await apiFetch({ path: 'auth/me', accessToken });

    if (!response.ok) return null;

    return await readData<AuthenticatedUserResponse>(response);
  } catch {
    return null;
  }
});

export function hasRole(user: AuthenticatedUserResponse | null, ...roles: string[]): boolean {
  if (!user) return false;
  return roles.some((role) => user.roles.includes(role));
}

function parseExpiry(value: string): { expires?: Date } {
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? {} : { expires: parsed };
}
