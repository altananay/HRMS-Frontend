'use client';

import { useState } from 'react';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { useSession } from '@/components/providers/SessionProvider';
import { DASHBOARD_BY_USER_TYPE } from '@/lib/dashboards';

export function AccountMenu() {
  const t = useTranslations();
  const { user, signOut, isSigningOut } = useSession();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  if (!user) {
    return (
      <>
        <Button
          href="/login"
          color="inherit"
          sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: 'text.primary' }}
        >
          {t('nav.signIn')}
        </Button>
        <Button
          href="/register"
          variant="contained"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          {t('nav.signUp')}
        </Button>
      </>
    );
  }

  const dashboard = DASHBOARD_BY_USER_TYPE[user.userType] ?? '/';
  const initial = user.displayName.trim().charAt(0).toLocaleUpperCase('tr') || '?';

  return (
    <>
      <Tooltip title={user.displayName}>
        <IconButton
          onClick={(event) => setAnchor(event.currentTarget)}
          aria-label={t('auth.account')}
          aria-haspopup="menu"
          sx={{ ml: 0.5 }}
        >
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 15 }}>
            {initial}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 240 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack spacing={0.25}>
            <Typography variant="subtitle2" noWrap>
              {user.displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Stack>
        </Box>

        <Divider />

        <MenuItem href={dashboard} component="a" onClick={() => setAnchor(null)}>
          <ListItemIcon>
            <DashboardOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('auth.dashboard')}</ListItemText>
        </MenuItem>

        <MenuItem
          disabled={isSigningOut}
          onClick={() => {
            setAnchor(null);
            void signOut();
          }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('auth.signOut')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
