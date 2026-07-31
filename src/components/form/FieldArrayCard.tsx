'use client';

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

/**
 * One entry in a repeating section — an education, a job, a language, a project.
 *
 * The remove button is an `IconButton` with a tooltip and a real `aria-label` rather than a bare ✕:
 * on a form where every row looks the same, "Remove" alone tells a screen-reader user nothing about
 * *which* row they are about to delete, so the label names the entry.
 */
export function FieldArrayCard({
  index,
  label,
  removeLabel,
  onRemove,
  children,
}: {
  index: number;
  label: string;
  removeLabel: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 1.5, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography variant="overline" color="text.secondary">
            {label} {index + 1}
          </Typography>

          <Tooltip title={removeLabel}>
            <IconButton
              onClick={onRemove}
              size="small"
              aria-label={`${removeLabel}: ${label} ${index + 1}`}
              sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {children}
      </CardContent>
    </Card>
  );
}

/** The empty state and add button that sit under every repeating section. */
export function FieldArraySection({
  isEmpty,
  emptyLabel,
  addLabel,
  onAdd,
  children,
}: {
  isEmpty: boolean;
  emptyLabel: string;
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={2}>
      {isEmpty ? (
        <Box
          sx={{
            py: 4,
            px: 3,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 3,
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">{emptyLabel}</Typography>
        </Box>
      ) : (
        children
      )}

      <Button onClick={onAdd} variant="outlined" sx={{ alignSelf: 'flex-start' }}>
        {addLabel}
      </Button>
    </Stack>
  );
}
