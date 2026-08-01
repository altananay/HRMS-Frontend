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
