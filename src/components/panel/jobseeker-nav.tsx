import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { getTranslations } from 'next-intl/server';

import type { PanelNavItem } from './PanelNav';

export async function jobSeekerNav(): Promise<PanelNavItem[]> {
  const t = await getTranslations('profile.nav');

  return [
    { href: '/profile', label: t('overview'), icon: <DashboardOutlinedIcon />, exact: true },
    { href: '/profile/edit', label: t('profile'), icon: <PersonOutlineRoundedIcon /> },
    { href: '/profile/cv', label: t('cv'), icon: <ArticleOutlinedIcon />, exact: true },
    { href: '/profile/cv/files', label: t('files'), icon: <FolderOutlinedIcon /> },
    { href: '/profile/applications', label: t('applications'), icon: <SendOutlinedIcon /> },
    { href: '/profile/security', label: t('security'), icon: <LockOutlinedIcon /> },
  ];
}
