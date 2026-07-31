'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Stepper from '@mui/material/Stepper';
import { useTranslations } from 'next-intl';

import { Form, SubmitButton } from '@/components/form/Form';
import { useApiForm } from '@/components/form/useApiForm';
import type { CvResponse } from '@/contracts/responses';
import { api } from '@/lib/http';
import {
  cvSchema,
  emptyCv,
  fromCvResponse,
  toCreateCvRequest,
  toUpdateCvRequest,
  type CvInput,
  type CvValues,
} from '@/schemas/cv';

import { CvBasicsStep } from './CvBasicsStep';
import { CvEducationStep } from './CvEducationStep';
import { CvExperienceStep } from './CvExperienceStep';
import { CvExtrasStep } from './CvExtrasStep';

const STEPS = ['basics', 'education', 'experience', 'extras'] as const;

/**
 * The résumé editor: **one** form spread across four steps.
 *
 * The screen it replaces was 1,074 lines and only looked like a wizard — it held six independent
 * Formik forms whose `onSubmit` handlers pushed into local arrays, so nothing was validated together
 * and a half-finished step was indistinguishable from a finished one. Here there is a single
 * `useForm`, the steps are views onto it, and every step's fields stay mounted in state whether or not
 * they are on screen.
 *
 * ⚠ **Saving replaces the whole résumé.** `UpdateCvCommand` clears each collection and re-inserts what
 * it receives, and answers 200 either way. That is why an edit starts from `fromCvResponse(cv)` — the
 * complete existing record — rather than from a blank form. Loading a subset here would delete
 * everything the user is not currently looking at, with no error anywhere. `schemas/cv.test.ts` pins
 * the round trip.
 */
export function CvForm({ cv }: { cv: CvResponse | null }) {
  const t = useTranslations('cv');
  // The schema speaks `validation.*`, the labels speak `cv.*` — two scopes, two translators.
  const tRoot = useTranslations();
  const router = useRouter();
  const [step, setStep] = useState(0);

  const schema = useMemo(() => cvSchema(tRoot), [tRoot]);
  const defaultValues = useMemo<CvInput>(() => (cv ? fromCvResponse(cv) : emptyCv()), [cv]);

  const submit = useCallback(
    async (values: CvValues) => {
      if (cv) {
        await api('Cvs/update', { method: 'PUT', body: toUpdateCvRequest(values, cv) });
      } else {
        await api('Cvs/add', { method: 'POST', body: toCreateCvRequest(values) });
      }

      router.push('/profile/cv');
      router.refresh();
    },
    [cv, router],
  );

  const form = useApiForm<CvInput, CvValues>({
    schema,
    defaultValues,
    onSubmit: submit,
    successMessage: t('saved'),
  });

  return (
    <Form form={form}>
      {/*
        Steps are freely navigable rather than gated on validation. Every field lives in one form and
        is submitted together, so blocking step 2 until step 1 is perfect would only stop someone from
        filling in what they can remember now and coming back — and the server validates the whole
        thing anyway.
      */}
      <Stepper nonLinear activeStep={step} sx={{ mb: 4 }}>
        {STEPS.map((name, index) => (
          <Step key={name} completed={false}>
            <StepButton onClick={() => setStep(index)}>{t(`steps.${name}`)}</StepButton>
          </Step>
        ))}
      </Stepper>

      {cv ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('replaceWarning')}
        </Alert>
      ) : null}

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          {/*
            All four steps stay mounted, hidden with CSS rather than unmounted. Unmounting an RHF
            field array drops its values, so a user who filled in their education, went to experience
            and came back would find the education gone — and would rightly blame the save.
          */}
          <StepPanel active={step === 0}>
            <CvBasicsStep />
          </StepPanel>
          <StepPanel active={step === 1}>
            <CvEducationStep />
          </StepPanel>
          <StepPanel active={step === 2}>
            <CvExperienceStep />
          </StepPanel>
          <StepPanel active={step === 3}>
            <CvExtrasStep />
          </StepPanel>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: 'space-between' }}>
        <Button
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0}
          color="inherit"
        >
          {t('back')}
        </Button>

        <Stack direction="row" spacing={1.5}>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((current) => current + 1)} variant="outlined">
              {t('next')}
            </Button>
          ) : null}

          {/* Available on every step: the form is one submission, and someone who has finished editing
              on step 2 should not have to click through to step 4 to save. */}
          <SubmitButton busy={form.formState.isSubmitting}>{t('save')}</SubmitButton>
        </Stack>
      </Stack>
    </Form>
  );
}

function StepPanel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <Box hidden={!active} sx={{ display: active ? 'block' : 'none' }}>
      {children}
    </Box>
  );
}
