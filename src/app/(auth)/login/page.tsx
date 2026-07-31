import type { Metadata } from 'next';
import { Suspense } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { getTranslations } from 'next-intl/server';

import { AuthCard } from '@/components/auth/AuthCard';
import { LoginForm } from '@/components/auth/LoginForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.login');
  return { title: t('title') };
}

/**
 * `Suspense` is required, not decorative: `LoginForm` calls `useSearchParams()` to read the `next`
 * parameter the proxy sets, and Next refuses to build a page that does so outside a boundary.
 */
export default async function LoginPage() {
  const t = await getTranslations('auth.login');

  return (
    <AuthCard title={t('title')} subtitle={t('subtitle')}>
      <Suspense fallback={<Skeleton variant="rounded" height={280} />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
