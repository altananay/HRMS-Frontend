import { createTheme, type Shadows } from '@mui/material/styles';

import { LinkBehavior } from './LinkBehavior';
import { accent, brand, error, info, neutral, success, warning } from './palette';
import { bodyFontFamily, displayFontFamily } from './tokens';

/**
 * Opts into MUI's CSS-variable theme. Without this augmentation `createTheme` rejects
 * `colorSchemes` and `theme.vars` stays optional. Declaration merging only works on an
 * `interface` — this is the one place the no-`interface` rule cannot apply.
 */
declare module '@mui/material/styles' {
  interface CssThemeVariables {
    enabled: true;
  }
}

/**
 * The stacks arrive from `tokens.ts` as plain strings rather than from `next/font` directly:
 * `next/font` is a build-time transform only Next can perform, and this module is also loaded by
 * Vitest. `src/theme/fonts.ts` defines the CSS variables and `layout.tsx` puts them on `<html>`.
 */
const display = displayFontFamily;
const body = bodyFontFamily;

/**
 * MUI's stock shadows are single-layer and quite dark, which makes every surface look stamped on.
 * These are two-layer (a tight contact shadow plus a wide soft one) and tinted with the brand's
 * blue rather than black — the difference is subtle per element and obvious across a page.
 */
const softShadows = [
  'none',
  '0 1px 2px 0 rgba(16, 30, 66, 0.06), 0 1px 3px 0 rgba(16, 30, 66, 0.08)',
  '0 1px 3px 0 rgba(16, 30, 66, 0.07), 0 2px 6px -1px rgba(16, 30, 66, 0.08)',
  '0 2px 4px -1px rgba(16, 30, 66, 0.06), 0 4px 10px -2px rgba(16, 30, 66, 0.10)',
  '0 3px 6px -2px rgba(16, 30, 66, 0.07), 0 8px 18px -4px rgba(16, 30, 66, 0.12)',
  '0 4px 8px -3px rgba(16, 30, 66, 0.08), 0 12px 26px -6px rgba(16, 30, 66, 0.14)',
  '0 6px 12px -4px rgba(16, 30, 66, 0.09), 0 18px 36px -8px rgba(16, 30, 66, 0.16)',
  '0 8px 16px -6px rgba(16, 30, 66, 0.10), 0 24px 48px -12px rgba(16, 30, 66, 0.18)',
];

// Slots 8-24 are rarely used; repeat the deepest rather than inventing 17 more values.
const shadows = [
  ...softShadows,
  ...Array.from({ length: 25 - softShadows.length }, () => softShadows[softShadows.length - 1]),
] as unknown as Shadows;

export const theme = createTheme({
  cssVariables: {
    // Class-based rather than the default data attribute so `.dark`-scoped CSS is possible and the
    // selector stays readable in devtools.
    colorSchemeSelector: 'class',
  },

  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          lighter: brand[100],
          light: brand[400],
          main: brand[600],
          dark: brand[800],
          contrastText: '#FFFFFF',
        },
        secondary: {
          lighter: accent[100],
          light: accent[300],
          main: accent[600],
          dark: accent[800],
          contrastText: '#FFFFFF',
        },
        success,
        warning,
        error,
        info,
        grey: neutral,
        divider: neutral[200],
        text: {
          primary: neutral[900],
          secondary: neutral[600],
          disabled: neutral[400],
        },
        background: {
          default: '#FFFFFF',
          paper: '#FFFFFF',
          // Not a MUI key by default — added via augmentation below. Used for page sections that
          // need to separate from the surrounding white without a border.
          subtle: neutral[50],
        },
        action: {
          hover: 'rgba(29, 62, 215, 0.04)',
          selected: 'rgba(29, 62, 215, 0.08)',
        },
      },
    },

    dark: {
      palette: {
        mode: 'dark',
        primary: {
          lighter: brand[950],
          light: brand[300],
          main: brand[400],
          dark: brand[600],
          contrastText: '#08122A',
        },
        secondary: {
          lighter: accent[950],
          light: accent[200],
          main: accent[300],
          dark: accent[500],
          contrastText: '#2A1603',
        },
        success,
        warning,
        error,
        info,
        grey: neutral,
        divider: 'rgba(148, 163, 184, 0.18)',
        text: {
          primary: '#E8EEF8',
          secondary: '#A3B1C6',
          disabled: '#64748B',
        },
        background: {
          default: neutral[950],
          paper: neutral[900],
          subtle: '#0D1728',
        },
        action: {
          hover: 'rgba(147, 180, 253, 0.08)',
          selected: 'rgba(147, 180, 253, 0.14)',
        },
      },
    },
  },

  shape: { borderRadius: 12 },

  shadows,

  typography: {
    fontFamily: body,
    // 15px base rather than 16: at 16px MUI's body1 next to a dense DataGrid looks oversized, and
    // every heading below scales off this.
    fontSize: 15,
    h1: {
      fontFamily: display,
      fontWeight: 800,
      fontSize: 'clamp(2.5rem, 1.5rem + 3.2vw, 4rem)',
      lineHeight: 1.05,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontFamily: display,
      fontWeight: 700,
      fontSize: 'clamp(1.875rem, 1.2rem + 2.2vw, 2.75rem)',
      lineHeight: 1.15,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontFamily: display,
      fontWeight: 700,
      fontSize: 'clamp(1.5rem, 1.1rem + 1.2vw, 1.875rem)',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: display,
      fontWeight: 700,
      fontSize: '1.375rem',
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
    },
    h5: { fontFamily: display, fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.35 },
    h6: { fontFamily: display, fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
    subtitle1: { fontWeight: 500, fontSize: '1.0625rem', lineHeight: 1.55 },
    subtitle2: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.5 },
    body1: { fontSize: '1rem', lineHeight: 1.65 },
    body2: { fontSize: '0.9375rem', lineHeight: 1.6 },
    button: { fontWeight: 600, fontSize: '0.9375rem', letterSpacing: 0, textTransform: 'none' },
    caption: { fontSize: '0.8125rem', lineHeight: 1.5 },
    overline: {
      fontWeight: 700,
      fontSize: '0.75rem',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      lineHeight: 1.4,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { WebkitFontSmoothing: 'antialiased', textSizeAdjust: '100%' },
        // Deliberately no `body { overflow-x: hidden }`. Setting one axis to `hidden` computes the
        // other to `auto`, which makes <body> the scroll container instead of the viewport — and
        // scroll events on a non-viewport container do not reach `window`. Everything that listens
        // for page scroll then silently stops working, `useScrollTrigger` included: the header simply
        // never frosts and there is no error anywhere. Anything too wide gets its own
        // `overflow-x: auto` wrapper instead.
        // Anchor targets sit below the sticky header without a scroll-margin hack per section.
        ':target': { scrollMarginTop: '96px' },
        '::selection': { backgroundColor: brand[200], color: brand[950] },
      },
    },

    /**
     * Routing for every button, icon button, menu item and tab in one place. `ButtonBase` uses
     * `LinkComponent` whenever an `href` is present, so `<Button href="/jobs">` navigates through the
     * Next router — including from a server component, where `component={Link}` is not allowed.
     */
    MuiButtonBase: {
      defaultProps: { LinkComponent: LinkBehavior },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 18,
          transition: 'background-color .18s, box-shadow .18s, transform .18s, border-color .18s',
          '&:hover': { transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
        },
        sizeLarge: { paddingBlock: 11, paddingInline: 26, fontSize: '1rem' },
        sizeSmall: { paddingInline: 12 },
        contained: ({ theme }) => ({
          boxShadow: 'none',
          '&:hover': { boxShadow: theme.shadows[4] },
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.vars.palette.divider,
          '&:hover': { borderColor: theme.vars.palette.primary.main, background: 'transparent' },
        }),
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },

    MuiPaper: {
      styleOverrides: {
        // MUI paints an alpha overlay via background-image in dark mode; with our own paper tone it
        // just washes the surface out.
        root: { backgroundImage: 'none' },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          border: `1px solid ${theme.vars.palette.divider}`,
          backgroundColor: theme.vars.palette.background.paper,
        }),
      },
    },

    MuiCardContent: {
      styleOverrides: { root: { padding: 24, '&:last-child': { paddingBottom: 24 } } },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
        sizeSmall: { height: 24 },
        outlined: ({ theme }) => ({ borderColor: theme.vars.palette.divider }),
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          backgroundColor: theme.vars.palette.background.paper,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.vars.palette.divider },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.vars.palette.grey[400],
          },
          // A 3px ring instead of MUI's 2px border swap: the field no longer shifts by a pixel on
          // focus, which is visible when several sit in a column.
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px rgba(59, 106, 245, 0.16)`,
            '& .MuiOutlinedInput-notchedOutline': { borderWidth: 1 },
          },
        }),
      },
    },

    MuiInputLabel: { styleOverrides: { root: { fontSize: '0.9375rem' } } },

    MuiFormHelperText: { styleOverrides: { root: { marginLeft: 2, fontSize: '0.8125rem' } } },

    MuiLink: {
      // `Link` does not extend ButtonBase, so it needs its own default component.
      defaultProps: { underline: 'hover', component: LinkBehavior },
      styleOverrides: { root: { fontWeight: 500 } },
    },

    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'transparent' },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 8, fontSize: '0.8125rem', paddingInline: 10, paddingBlock: 6 },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 12,
          border: `1px solid ${theme.vars.palette.divider}`,
          boxShadow: theme.shadows[5],
        }),
      },
    },

    MuiMenuItem: { styleOverrides: { root: { borderRadius: 8, margin: '2px 6px' } } },

    MuiDialog: { styleOverrides: { paper: { borderRadius: 18 } } },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12, alignItems: 'center' },
        standard: { fontWeight: 500 },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({ borderColor: theme.vars.palette.divider }),
        head: ({ theme }) => ({
          fontWeight: 600,
          color: theme.vars.palette.text.secondary,
          backgroundColor: theme.vars.palette.background.subtle,
        }),
      },
    },

    MuiSkeleton: { defaultProps: { animation: 'wave' } },

    MuiContainer: { defaultProps: { maxWidth: 'lg' } },
  },
});

/**
 * Extra palette slots used above. `lighter` gives tinted backgrounds a named home instead of an
 * `alpha()` call at every call site; `background.subtle` is the alternating section tone.
 */
declare module '@mui/material/styles' {
  interface PaletteColor {
    lighter: string;
  }
  interface SimplePaletteColorOptions {
    lighter?: string;
  }
  interface TypeBackground {
    subtle: string;
  }
}
