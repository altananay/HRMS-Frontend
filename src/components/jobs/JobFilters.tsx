'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';

export function JobFilters() {
  const t = useTranslations('jobs');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [city, setCity] = useState(searchParams.get('city') ?? '');

  const skill = searchParams.get('skill') ?? '';
  const hasFilters = Boolean(search || city || skill);

  const apply = (event: React.FormEvent) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (city.trim()) params.set('city', city.trim());
    if (skill) params.set('skill', skill);

    router.push(params.toString() ? `/jobs?${params}` : '/jobs');
  };

  const clear = () => {
    setSearch('');
    setCity('');
    router.push('/jobs');
  };

  return (
    <Card component="form" role="search" onSubmit={apply} sx={{ mb: 4 }}>
      <CardContent>
        <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              label={t('searchLabel')}
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label={t('cityLabel')}
              value={city}
              onChange={(event) => setCity(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnOutlinedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" size="large" sx={{ flexGrow: 1 }}>
                {t('apply')}
              </Button>
              {hasFilters ? (
                <Button onClick={clear} size="large" color="inherit">
                  {t('clear')}
                </Button>
              ) : null}
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
