'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { AuthenticatedUserResponse } from '@/contracts/responses';
import { auth } from '@/lib/http';

/**
 * The signed-in user, as client components see it.
 *
 * Seeded from the server on every render — the root layout calls `getSession()`, which verifies
 * against `/auth/me` — rather than fetched on mount. That means no authenticated flash of the
 * signed-out header, and no client-side decoding of a token the browser cannot even read.
 *
 * There is no setter. The session is server state; the only ways it changes are signing in, signing
 * out, or the server saying otherwise, and all three end in a router refresh so the server re-renders
 * with the truth.
 */

type SessionValue = {
  user: AuthenticatedUserResponse | null;
  /** True while a sign-out is in flight, so a button can disable itself. */
  isSigningOut: boolean;
  signOut: () => Promise<void>;
  /** Re-asks the server who is signed in. For after a change made elsewhere in the app. */
  reload: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: AuthenticatedUserResponse | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = useCallback(async () => {
    setIsSigningOut(true);

    try {
      await auth('logout', { method: 'POST' });
    } catch {
      // The handler clears the cookies whatever the API says, so there is nothing to recover from and
      // nothing useful to tell the user. Navigating away is the correct end state either way.
    } finally {
      setIsSigningOut(false);
      router.replace('/');
      // `replace` alone would serve the cached signed-in render of `/`.
      router.refresh();
    }
  }, [router]);

  const value = useMemo<SessionValue>(
    () => ({ user, isSigningOut, signOut, reload: () => router.refresh() }),
    [user, isSigningOut, signOut, router],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);

  if (!value) {
    throw new Error('useSession must be used inside <SessionProvider>.');
  }

  return value;
}

/**
 * Whether the user holds any of the given roles. **For display only** — showing or hiding a menu
 * item. Every one of these checks is also enforced by a segment layout and, finally, by the API.
 */
export function useHasRole(...roles: string[]): boolean {
  const { user } = useSession();

  return Boolean(user && roles.some((role) => user.roles.includes(role)));
}
