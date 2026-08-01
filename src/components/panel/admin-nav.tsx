import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { getTranslations } from 'next-intl/server';

import type { PanelNavItem } from './PanelNav';

export async function adminNav(): Promise<PanelNavItem[]> {
  const t = await getTranslations('admin.nav');

  return [
    { href: '/admin', label: t('overview'), icon: <DashboardOutlinedIcon />, exact: true },
    { href: '/admin/users', label: t('users'), icon: <GroupOutlinedIcon /> },
    { href: '/admin/job-seekers', label: t('jobSeekers'), icon: <PersonSearchRoundedIcon /> },
    { href: '/admin/employers', label: t('employers'), icon: <ApartmentRoundedIcon /> },
    { href: '/admin/system-staff', label: t('systemStaff'), icon: <BadgeOutlinedIcon /> },
    { href: '/admin/job-positions', label: t('jobPositions'), icon: <WorkspacePremiumOutlinedIcon /> },
    { href: '/admin/job-advertisements', label: t('jobAdvertisements'), icon: <WorkOutlineRoundedIcon /> },
    { href: '/admin/job-applications', label: t('jobApplications'), icon: <SendOutlinedIcon /> },
    { href: '/admin/cvs', label: t('cvs'), icon: <ArticleOutlinedIcon /> },
    { href: '/admin/contacts', label: t('contacts'), icon: <EmailOutlinedIcon /> },
  ];
}
