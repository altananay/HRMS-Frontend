'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import CheckIcon from '@mui/icons-material/Check';
import TranslateIcon from '@mui/icons-material/Translate';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { useLocale, useTranslations } from 'next-intl';

import { locales, type AppLocale } from '@/i18n/config';
import { setLocaleCookie } from '@/i18n/locale';

/**
 * Language switch. Writes the cookie through the one Server Action in the codebase, then calls
 * `router.refresh()`.
 *
 * The refresh is required, not belt-and-braces: setting a cookie does not invalidate the router
 * cache, so without it the current page keeps rendering the previous locale's messages and the
 * change only appears on the next navigation.
 */
export function LocaleSwitcher() {
  const t = useTranslations('locale');
  const active = useLocale();
  const router = useRouter();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [isPending, startTransition] = useTransition();

  const select = (locale: AppLocale) => {
    setAnchor(null);
    if (locale === active) return;

    startTransition(async () => {
      await setLocaleCookie(locale);
      router.refresh();
    });
  };

  return (
    <>
      <Tooltip title={t('change')}>
        <IconButton
          size="small"
          onClick={(event) => setAnchor(event.currentTarget)}
          aria-label={t('change')}
          aria-haspopup="menu"
          disabled={isPending}
          sx={{ width: 36, height: 36 }}
        >
          <TranslateIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {locales.map((locale) => (
          <MenuItem key={locale} selected={locale === active} onClick={() => select(locale)}>
            <ListItemIcon>
              {locale === active ? <CheckIcon fontSize="small" /> : <Box sx={{ width: 20 }} />}
            </ListItemIcon>
            <ListItemText>{t(locale)}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
