'use client';

import { useState } from 'react';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useColorScheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';

const MODES = ['light', 'dark', 'system'] as const;

const ICONS = {
  light: LightModeOutlinedIcon,
  dark: DarkModeOutlinedIcon,
  system: SettingsBrightnessOutlinedIcon,
} as const;

export function ColorSchemeToggle() {
  const t = useTranslations('colorScheme');
  const { mode, setMode } = useColorScheme();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  if (!mode) {
    return (
      <IconButton size="small" disabled aria-hidden sx={{ width: 36, height: 36 }}>
        <SettingsBrightnessOutlinedIcon fontSize="small" />
      </IconButton>
    );
  }

  const CurrentIcon = ICONS[mode];

  return (
    <>
      <Tooltip title={t('label')}>
        <IconButton
          size="small"
          onClick={(event) => setAnchor(event.currentTarget)}
          aria-label={t('label')}
          aria-haspopup="menu"
          sx={{ width: 36, height: 36 }}
        >
          <CurrentIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {MODES.map((option) => {
          const Icon = ICONS[option];

          return (
            <MenuItem
              key={option}
              selected={option === mode}
              onClick={() => {
                setMode(option);
                setAnchor(null);
              }}
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t(option)}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
