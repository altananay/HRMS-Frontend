'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Chip from '@mui/material/Chip';
import { useTranslations } from 'next-intl';

import { useToasts } from '@/components/ui/ToastProvider';
import { isApiError } from '@/contracts/api-error';
import type { ContactResponse } from '@/contracts/responses';
import { apiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/http';

export function ContactHandledToggle({ contact }: { contact: ContactResponse }) {
  const t = useTranslations('admin');
  const tRoot = useTranslations();
  const router = useRouter();
  const toasts = useToasts();
  const [isSaving, startSaving] = useTransition();

  const toggle = useCallback(() => {
    startSaving(async () => {
      try {
        await api(`Contacts/${contact.id}`, {
          method: 'PUT',
          body: {
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            subject: contact.subject,
            message: contact.message,
            isHandled: !contact.isHandled,
          },
        });

        toasts.success(t('contactSaved'));
        router.refresh();
      } catch (error) {
        toasts.error(
          isApiError(error) ? apiErrorMessage(error, (key) => tRoot(key)) : tRoot('errors.unknown'),
        );
      }
    });
  }, [contact, router, t, tRoot, toasts]);

  return (
    <Chip
      label={contact.isHandled ? t('handled') : t('unhandled')}
      size="small"
      color={contact.isHandled ? 'success' : 'warning'}
      variant={contact.isHandled ? 'filled' : 'outlined'}
      onClick={(event) => {
        event.stopPropagation();
        toggle();
      }}
      disabled={isSaving}
      aria-label={contact.isHandled ? t('markUnhandled') : t('markHandled')}
    />
  );
}
