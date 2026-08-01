import Avatar from '@mui/material/Avatar';

import { brand } from '@/theme/palette';

const TONES = [brand[600], '#0F9D6B', '#B74006', '#7C3AED', '#0E7490', '#BE123C'] as const;

export function CompanyAvatar({ name, size = 48 }: { name: string; size?: number }) {
  const trimmed = name.trim();
  const initials =
    trimmed
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toLocaleUpperCase('tr') || '?';

  const tone = TONES[[...trimmed].reduce((sum, char) => sum + char.codePointAt(0)!, 0) % TONES.length];

  return (
    <Avatar
      variant="rounded"
      aria-hidden
      sx={{
        width: size,
        height: size,
        bgcolor: tone,
        color: '#FFFFFF',
        fontWeight: 700,
        fontSize: size * 0.36,
        borderRadius: 2.5,
        flexShrink: 0,
      }}
    >
      {initials}
    </Avatar>
  );
}
