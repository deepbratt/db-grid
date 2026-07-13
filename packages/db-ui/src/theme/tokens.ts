import type { CSSProperties } from 'react';

export type UiMode = 'light' | 'dark';

export type UiPalette = {
  primary: string;
  primaryContrast: string;
  secondary: string;
  accent: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  background: string;
  paper: string;
  text: string;
  textSecondary: string;
  divider: string;
};

/** Default db-grid brand — grey / white surfaces, orange primary for actions. */
export const brandLightPalette: UiPalette = {
  primary: '#F97316',
  primaryContrast: '#FFFFFF',
  secondary: '#C2410C',
  accent: '#EAB308',
  error: '#DC2626',
  warning: '#EAB308',
  success: '#16A34A',
  info: '#6B7280',
  background: '#F4F5F7',
  paper: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  divider: '#E5E7EB',
};

export const brandDarkPalette: UiPalette = {
  primary: '#FB923C',
  primaryContrast: '#111827',
  secondary: '#FDBA74',
  accent: '#FDE047',
  error: '#F87171',
  warning: '#FACC15',
  success: '#4ADE80',
  info: '#9CA3AF',
  background: '#111827',
  paper: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  divider: '#374151',
};

export type UiTheme = {
  mode: UiMode;
  palette: UiPalette;
  /** CSS custom properties, e.g. `--mui-primary` */
  cssVars: Record<string, string>;
  /** Inline style object ready for React */
  style: CSSProperties;
  /** Semicolon-joined CSS text for non-React hosts */
  cssText: string;
  cssVarPrefix: string;
};

export type CreateUiThemeOptions = {
  mode?: UiMode;
  /** Override any palette keys — merge onto the mode default */
  palette?: Partial<UiPalette>;
  /**
   * Prefix for CSS variables (default `--mui`).
   * Change this to white-label without colliding with host apps.
   */
  cssVarPrefix?: string;
};

const PALETTE_VAR_KEYS: (keyof UiPalette)[] = [
  'primary',
  'primaryContrast',
  'secondary',
  'accent',
  'error',
  'warning',
  'success',
  'info',
  'background',
  'paper',
  'text',
  'textSecondary',
  'divider',
];

function kebab(key: string): string {
  return key.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function paletteToCssVars(
  palette: UiPalette,
  cssVarPrefix = '--mui'
): Record<string, string> {
  const prefix = cssVarPrefix.endsWith('-') ? cssVarPrefix.slice(0, -1) : cssVarPrefix;
  const vars: Record<string, string> = {};
  for (const key of PALETTE_VAR_KEYS) {
    const name =
      key === 'background'
        ? `${prefix}-bg`
        : key === 'primaryContrast'
          ? `${prefix}-primary-contrast`
          : key === 'textSecondary'
            ? `${prefix}-text-secondary`
            : `${prefix}-${kebab(key)}`;
    vars[name] = palette[key];
  }
  return vars;
}

/** Build a fully customizable UI theme. Pass partial palette to rebrand. */
export function createUiTheme(options: CreateUiThemeOptions = {}): UiTheme {
  const mode = options.mode ?? 'light';
  const cssVarPrefix = options.cssVarPrefix ?? '--mui';
  const base = mode === 'dark' ? brandDarkPalette : brandLightPalette;
  const palette: UiPalette = { ...base, ...options.palette };
  const cssVars = paletteToCssVars(palette, cssVarPrefix);
  const style = cssVars as CSSProperties;
  let cssText = '';
  for (const [k, v] of Object.entries(cssVars)) {
    cssText += `${k}:${v};`;
  }
  return { mode, palette, cssVars, style, cssText, cssVarPrefix };
}

/** Chart / sparkline series colors derived from a palette (fully overridable). */
export function chartColorsFromPalette(palette: UiPalette): string[] {
  return [
    palette.primary,
    palette.accent,
    palette.secondary,
    palette.warning,
    palette.info,
    palette.success,
    palette.error,
    '#FBBF24',
  ];
}

/**
 * Map a UI palette onto grid ThemeParams overrides so one brand drives both stacks.
 * Import ThemeParams type from `@deepbratt55/db-grid` when applying.
 */
export function uiPaletteToGridOverrides(palette: UiPalette): Record<string, string> {
  return {
    accentColor: palette.primary,
    checkboxCheckedBackgroundColor: palette.primary,
    inputFocusBorder: `2px solid ${palette.primary}`,
    backgroundColor: palette.paper,
    chromeBackgroundColor: palette.paper,
    foregroundColor: palette.text,
    borderColor: palette.divider,
    headerBackgroundColor: palette.primary,
    headerTextColor: palette.primaryContrast,
    oddRowBackgroundColor: palette.background,
    rowHoverColor: palette.background,
    selectedRowBackgroundColor: '#FFEDD5',
    rangeSelectionBackgroundColor: '#FED7AA',
    toolPanelBackgroundColor: palette.paper,
    statusBarBackgroundColor: palette.paper,
    tooltipBackgroundColor: palette.secondary,
  };
}
