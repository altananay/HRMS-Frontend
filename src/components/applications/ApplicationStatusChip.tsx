import Chip, { type ChipProps } from '@mui/material/Chip';
import { getTranslations } from 'next-intl/server';

import { JobApplicationStatus } from '@/contracts/enums';

/**
 * An application's status, coloured by what it means to the applicant.
 *
 * The colours carry meaning, so they are never the only signal — the label is always there. Someone
 * who cannot distinguish the greens from the reds still reads "Rejected".
 */
const COLOURS: Record<JobApplicationStatus, ChipProps['color']> = {
  [JobApplicationStatus.Submitted]: 'default',
  [JobApplicationStatus.UnderReview]: 'info',
  [JobApplicationStatus.InterviewScheduled]: 'primary',
  [JobApplicationStatus.Offered]: 'secondary',
  [JobApplicationStatus.Accepted]: 'success',
  [JobApplicationStatus.Rejected]: 'error',
  [JobApplicationStatus.Withdrawn]: 'default',
};

export async function ApplicationStatusChip({
  status,
  size = 'small',
}: {
  status: JobApplicationStatus;
  size?: ChipProps['size'];
}) {
  const t = await getTranslations('applications.status');

  return <Chip label={t(status)} color={COLOURS[status]} size={size} />;
}
