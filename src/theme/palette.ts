export const brand = {
  50: '#EFF4FF',
  100: '#DBE6FE',
  200: '#BFD3FE',
  300: '#93B4FD',
  400: '#608EFA',
  500: '#3B6AF5',
  600: '#2551EA',
  700: '#1D3ED7',
  800: '#1E37AE',
  900: '#1E3389',
  950: '#172255',
} as const;

export const accent = {
  50: '#FFF8EB',
  100: '#FFECC6',
  200: '#FFD788',
  300: '#FFBC4A',
  400: '#FFA31F',
  500: '#F98107',
  600: '#DD5D02',
  700: '#B74006',
  800: '#94310C',
  900: '#7A290D',
  950: '#461302',
} as const;

export const neutral = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E4EAF1',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#111C2E',
  950: '#0A1320',
} as const;

export const success = {
  light: '#34D399',
  main: '#0A7F57',
  dark: '#04563E',
  contrastText: '#FFFFFF',
} as const;

export const warning = {
  light: '#FBBF24',
  main: '#B45309',
  dark: '#7C3D06',
  contrastText: '#FFFFFF',
} as const;

export const error = {
  light: '#F87171',
  main: '#DC2626',
  dark: '#991B1B',
  contrastText: '#FFFFFF',
} as const;

export const info = {
  light: '#38BDF8',
  main: '#0369A1',
  dark: '#0B4A6F',
  contrastText: '#FFFFFF',
} as const;

export const successDark = {
  light: '#6EE7B7',
  main: '#34D399',
  dark: '#0F9D6B',
  contrastText: '#04231A',
} as const;

export const warningDark = {
  light: '#FCD34D',
  main: '#FBBF24',
  dark: '#D97706',
  contrastText: '#2A1603',
} as const;

export const errorDark = {
  light: '#FCA5A5',
  main: '#F87171',
  dark: '#DC2626',
  contrastText: '#2A0A0A',
} as const;

export const infoDark = {
  light: '#7DD3FC',
  main: '#38BDF8',
  dark: '#0284C7',
  contrastText: '#042536',
} as const;

export const gradients = {
  heroLight: `radial-gradient(at 18% 12%, ${brand[100]} 0px, transparent 55%),
              radial-gradient(at 82% 8%, ${accent[100]} 0px, transparent 50%),
              radial-gradient(at 55% 85%, ${brand[50]} 0px, transparent 55%)`,
  heroDark: `radial-gradient(at 18% 12%, ${brand[950]} 0px, transparent 55%),
             radial-gradient(at 82% 8%, ${accent[950]} 0px, transparent 50%),
             radial-gradient(at 55% 85%, #10203F 0px, transparent 55%)`,
  brandText: `linear-gradient(120deg, ${brand[600]}, ${brand[400]} 55%, ${accent[400]})`,
  brandTextDark: `linear-gradient(120deg, ${brand[300]}, ${brand[200]} 55%, ${accent[300]})`,
} as const;
