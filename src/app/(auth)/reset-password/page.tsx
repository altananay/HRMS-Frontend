import type { Metadata } from 'next';
import { Suspense } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { getTranslations } from 'next-intl/server';

import { AuthCard } from '@/components/auth/AuthCard';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.reset');
  // Reset links get pasted into chat apps, which fetch the page to build a preview card. Keeping it
  // out of any index is the least we can do for a URL that carries a single-use credential.
  return { title: t('title'), robots: { index: false, follow: false } };
}

export default async function ResetPasswordPage() {
  const t = await getTranslations('auth.reset');

  return (
    <AuthCard title={t('title')} subtitle={t('subtitle')}>
      <Suspense fallback={<Skeleton variant="rounded" height={220} />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
