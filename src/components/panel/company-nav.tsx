import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import { getTranslations } from 'next-intl/server';

import type { PanelNavItem } from './PanelNav';

/** `/company` is `exact` because it prefixes every other entry and would otherwise stay selected. */
export async function companyNav(): Promise<PanelNavItem[]> {
  const t = await getTranslations('company.nav');

  return [
    { href: '/company', label: t('overview'), icon: <DashboardOutlinedIcon />, exact: true },
    { href: '/company/jobs', label: t('jobs'), icon: <WorkOutlineRoundedIcon /> },
    { href: '/company/applications', label: t('applications'), icon: <InboxOutlinedIcon /> },
    { href: '/company/profile', label: t('profile'), icon: <ApartmentRoundedIcon /> },
    { href: '/company/security', label: t('security'), icon: <LockOutlinedIcon /> },
  ];
}
