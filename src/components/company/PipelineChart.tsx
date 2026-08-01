'use client';

import { BarChart } from '@mui/x-charts/BarChart';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';

import { JobApplicationStatus, jobApplicationStatusOrder } from '@/contracts/enums';

export function PipelineChart({ counts }: { counts: Record<string, number> }) {
  const t = useTranslations('applications.status');
  const theme = useTheme();

  const data = jobApplicationStatusOrder.map((status) => counts[status] ?? 0);
  const labels = jobApplicationStatusOrder.map((status) => t(status));

  const colours: Record<string, string> = {
    [JobApplicationStatus.Submitted]: theme.palette.grey[400],
    [JobApplicationStatus.UnderReview]: theme.palette.info.main,
    [JobApplicationStatus.InterviewScheduled]: theme.palette.primary.main,
    [JobApplicationStatus.Offered]: theme.palette.secondary.main,
    [JobApplicationStatus.Accepted]: theme.palette.success.main,
    [JobApplicationStatus.Rejected]: theme.palette.error.main,
    [JobApplicationStatus.Withdrawn]: theme.palette.grey[500],
  };

  return (
    <Box sx={{ width: '100%', height: 280 }}>
      <BarChart
        height={280}
        series={[{ data, id: 'applications' }]}
        xAxis={[
          {
            data: labels,
            scaleType: 'band',
            colorMap: {
              type: 'ordinal',
              values: labels,
              colors: jobApplicationStatusOrder.map((status) => colours[status] ?? theme.palette.grey[400]),
            },
          },
        ]}
        yAxis={[{ label: '', min: 0 }]}
        margin={{ left: 8, right: 8, top: 16, bottom: 8 }}
        grid={{ horizontal: true }}
        borderRadius={6}
      />
    </Box>
  );
}
