import Chip, { type ChipProps } from '@mui/material/Chip';
import { getTranslations } from 'next-intl/server';

import { JobApplicationStatus } from '@/contracts/enums';

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
