'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { AuthenticatedUserResponse } from '@/contracts/responses';
import { auth } from '@/lib/http';

type SessionValue = {
  user: AuthenticatedUserResponse | null;
  isSigningOut: boolean;
  signOut: () => Promise<void>;
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
    } finally {
      setIsSigningOut(false);
      router.replace('/');
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

export function useHasRole(...roles: string[]): boolean {
  const { user } = useSession();

  return Boolean(user && roles.some((role) => user.roles.includes(role)));
}
