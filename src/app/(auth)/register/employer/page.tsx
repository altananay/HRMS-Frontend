import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { AuthCard } from '@/components/auth/AuthCard';
import { RegisterEmployerForm } from '@/components/auth/RegisterEmployerForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.register');
  return { title: t('employerFormTitle') };
}

export default async function RegisterEmployerPage() {
  const t = await getTranslations('auth.register');

  return (
    <AuthCard title={t('employerFormTitle')} subtitle={t('employerBody')}>
      <RegisterEmployerForm />
    </AuthCard>
  );
}
