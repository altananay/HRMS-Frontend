'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase from '@mui/material/InputBase';
import { useTranslations } from 'next-intl';

/**
 * The hero search. Two fields in one bordered shell rather than two `TextField`s: at hero scale a
 * pair of separate outlined inputs reads as a form, and this should read as a search bar.
 *
 * Submitting navigates to `/jobs` with the query in the URL — the listing page owns the actual
 * filtering, and the URL stays shareable and back-button friendly. Blank fields are dropped instead
 * of sent as empty parameters.
 */
export function JobSearchForm() {
  const t = useTranslations('home.hero');
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (city.trim()) params.set('city', city.trim());

    const query = params.toString();
    router.push(query ? `/jobs?${query}` : '/jobs');
  };

  return (
    <Box
      component="form"
      role="search"
      onSubmit={submit}
      sx={(theme) => ({
        display: 'flex',
        gap: 1,
        p: 1,
        pl: { xs: 1, sm: 2 },
        borderRadius: { xs: 3, sm: 999 },
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: theme.shadows[4],
        transition: 'box-shadow .2s, border-color .2s',
        '&:focus-within': {
          borderColor: 'primary.main',
          boxShadow: `0 0 0 4px rgba(59, 106, 245, 0.14), ${theme.shadows[5]}`,
        },
      })}
    >
      <InputBase
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t('searchPlaceholder')}
        inputProps={{ 'aria-label': t('searchPlaceholder') }}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon fontSize="small" color="action" />
          </InputAdornment>
        }
        sx={{ flex: 2, py: { xs: 1, sm: 0.5 } }}
      />

      <Divider
        orientation="vertical"
        flexItem
        sx={{ display: { xs: 'none', sm: 'block' }, my: 0.5 }}
      />

      <InputBase
        value={city}
        onChange={(event) => setCity(event.target.value)}
        placeholder={t('searchCityPlaceholder')}
        inputProps={{ 'aria-label': t('searchCityPlaceholder') }}
        startAdornment={
          <InputAdornment position="start">
            <LocationOnOutlinedIcon fontSize="small" color="action" />
          </InputAdornment>
        }
        sx={{ flex: 1, py: { xs: 1, sm: 0.5 } }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        sx={{ borderRadius: { xs: 2, sm: 999 }, px: 3, flexShrink: 0 }}
      >
        {t('searchSubmit')}
      </Button>
    </Box>
  );
}
