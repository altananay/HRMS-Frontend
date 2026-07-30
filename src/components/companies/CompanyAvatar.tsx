import Avatar from '@mui/material/Avatar';

import { brand } from '@/theme/palette';

/**
 * A company's monogram, coloured deterministically from its name.
 *
 * There are no logo uploads in this system, so the alternative is either a grey box on every card or
 * a placeholder image. A stable colour per company gives a list of openings something to scan by —
 * and because the hue comes from the name, the same company looks the same everywhere without
 * storing anything.
 */
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

  // A sum of code points, not `hashCode`-style arithmetic: this only has to be stable and spread, and
  // an obvious one-liner is easier to trust than a clever hash.
  const tone = TONES[[...trimmed].reduce((sum, char) => sum + char.codePointAt(0)!, 0) % TONES.length];

  return (
    <Avatar
      variant="rounded"
      // Decorative: the company name is always rendered next to it, so announcing the initials again
      // would just be noise for a screen reader.
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
