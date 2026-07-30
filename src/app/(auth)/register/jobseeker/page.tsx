import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { AuthCard } from '@/components/auth/AuthCard';
import { RegisterJobSeekerForm } from '@/components/auth/RegisterJobSeekerForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.register');
  return { title: t('seekerFormTitle') };
}

export default async function RegisterJobSeekerPage() {
  const t = await getTranslations('auth.register');

  return (
    <AuthCard title={t('seekerFormTitle')} subtitle={t('seekerBody')}>
      <RegisterJobSeekerForm />
    </AuthCard>
  );
}
