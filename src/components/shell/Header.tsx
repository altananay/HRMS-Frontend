'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { useTranslations } from 'next-intl';

import { Logo } from '@/components/ui/Logo';

import { ColorSchemeToggle } from './ColorSchemeToggle';
import { LocaleSwitcher } from './LocaleSwitcher';

const NAV = [
  { href: '/jobs', key: 'jobs' },
  { href: '/companies', key: 'companies' },
  { href: '/#how-it-works', key: 'howItWorks' },
  { href: '/contact', key: 'contact' },
] as const;

/**
 * The site header: transparent over the hero, then frosted once the page scrolls.
 *
 * `useScrollTrigger` rather than a `scroll` listener — MUI throttles it through
 * `requestAnimationFrame`, so dragging the scrollbar does not re-render this on every pixel.
 */
export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 8 });

  const isActive = (href: string) => href !== '/' && pathname.startsWith(href.split('#')[0] ?? '');

  return (
    <AppBar
      position="sticky"
      sx={(theme) => ({
        // The blur is what makes a translucent bar read as glass rather than as a faded rectangle.
        backdropFilter: scrolled ? 'saturate(180%) blur(12px)' : 'none',
        backgroundColor: scrolled ? 'rgba(255,255,255,0.74)' : 'transparent',
        borderBottom: '1px solid',
        borderColor: scrolled ? theme.vars.palette.divider : 'transparent',
        transition: 'background-color .25s, border-color .25s, backdrop-filter .25s',
        // The light tint would read as grey haze over the dark background.
        ...theme.applyStyles('dark', {
          backgroundColor: scrolled ? 'rgba(10, 19, 32, 0.74)' : 'transparent',
        }),
        // Where the blur is unsupported the translucency has nothing behind it to soften, so fall
        // back to a solid bar instead of letting content show through.
        ...(scrolled && {
          '@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))': {
            backgroundColor: theme.vars.palette.background.default,
          },
        }),
      })}
    >
      <Container>
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 76 }, gap: 1 }}>
          {/* A Box has no href semantics of its own, so this one still needs `component`. Everything
              else in this file is ButtonBase-derived and picks up `LinkBehavior` from the theme. */}
          <Box
            component={Link}
            href="/"
            aria-label="HRMS"
            sx={{ display: 'flex', textDecoration: 'none', color: 'text.primary', mr: 2 }}
          >
            <Logo />
          </Box>

          <Stack
            component="nav"
            aria-label={t('primaryNavigation')}
            direction="row"
            spacing={0.5}
            sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}
          >
            {NAV.map((item) => (
              <Button
                key={item.href}
                href={item.href}
                color="inherit"
                sx={{
                  fontWeight: 500,
                  color: isActive(item.href) ? 'primary.main' : 'text.secondary',
                  '&:hover': { color: 'text.primary', backgroundColor: 'action.hover' },
                }}
              >
                {t(item.key)}
              </Button>
            ))}
          </Stack>

          <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <LocaleSwitcher />
            <ColorSchemeToggle />

            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, my: 1.5, display: { xs: 'none', sm: 'block' } }}
            />

            <Button
              href="/login"
              color="inherit"
              sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: 'text.primary' }}
            >
              {t('signIn')}
            </Button>

            <Button
              href="/register"
              variant="contained"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              {t('signUp')}
            </Button>

            <IconButton
              onClick={() => setDrawerOpen(true)}
              aria-label={t('openMenu')}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 300, p: 2 } } }}
      >
        <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size={28} />
          <IconButton onClick={() => setDrawerOpen(false)} aria-label={t('closeMenu')}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <List component="nav" aria-label={t('primaryNavigation')}>
          {NAV.map((item) => (
            <ListItemButton
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              selected={isActive(item.href)}
              sx={{ borderRadius: 2 }}
            >
              <ListItemText primary={t(item.key)} slotProps={{ primary: { sx: { fontWeight: 500 } } }} />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1}>
          <Button
            href="/login"
            variant="outlined"
            size="large"
            onClick={() => setDrawerOpen(false)}
          >
            {t('signIn')}
          </Button>
          <Button
            href="/register"
            variant="contained"
            size="large"
            onClick={() => setDrawerOpen(false)}
          >
            {t('signUp')}
          </Button>
        </Stack>
      </Drawer>
    </AppBar>
  );
}
