'use client';

import { usePathname } from 'next/navigation';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

export type PanelNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
};

export function PanelNav({ items }: { items: readonly PanelNavItem[] }) {
  const pathname = usePathname();

  const isActive = (item: PanelNavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Card sx={{ position: { md: 'sticky' }, top: { md: 96 }, overflow: 'hidden' }}>
      <List component="nav" sx={{ p: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.href}
            href={item.href}
            selected={isActive(item)}
            sx={{
              borderRadius: 2,
              mb: 0.25,
              '&.Mui-selected': {
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'primary.main' },
                '&:hover': { bgcolor: 'primary.lighter' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { sx: { fontWeight: 500, fontSize: '0.9375rem' } } }}
            />
          </ListItemButton>
        ))}
      </List>
    </Card>
  );
}
