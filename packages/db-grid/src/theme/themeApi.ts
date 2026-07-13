import type { CSSProperties } from 'react';

export interface ThemeParams {
  backgroundColor: string;
  foregroundColor: string;
  borderColor: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  oddRowBackgroundColor: string;
  rowHoverColor: string;
  selectedRowBackgroundColor: string;
  rangeSelectionBackgroundColor: string;
  fontFamily: string;
  fontSize: string;
  headerFontSize: string;
  spacing: string;
  borderRadius: string;
  cellHorizontalPadding: string;
  wrapperBorder: string;
  chromeBackgroundColor: string;
  inputFocusBorder: string;
  checkboxCheckedBackgroundColor: string;
  iconSize: string;
  popupShadow: string;
  tooltipBackgroundColor: string;
  toolPanelBackgroundColor: string;
  statusBarBackgroundColor: string;
  accentColor: string;
}

const BASE_QUARTZ: ThemeParams = {
  backgroundColor: '#ffffff',
  foregroundColor: '#181d1f',
  borderColor: '#dde2eb',
  headerBackgroundColor: '#f8f9fa',
  headerTextColor: '#181d1f',
  oddRowBackgroundColor: '#fcfcfd',
  rowHoverColor: '#f1f5f9',
  selectedRowBackgroundColor: '#dbeafe',
  rangeSelectionBackgroundColor: '#bfdbfe',
  fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
  fontSize: '13px',
  headerFontSize: '12px',
  spacing: '8px',
  borderRadius: '8px',
  cellHorizontalPadding: '12px',
  wrapperBorder: '1px solid #dde2eb',
  chromeBackgroundColor: '#ffffff',
  inputFocusBorder: '2px solid #3b82f6',
  checkboxCheckedBackgroundColor: '#3b82f6',
  iconSize: '16px',
  popupShadow: '0 12px 32px rgba(24, 29, 31, 0.16)',
  tooltipBackgroundColor: '#181d1f',
  toolPanelBackgroundColor: '#f8f9fa',
  statusBarBackgroundColor: '#f8f9fa',
  accentColor: '#3b82f6',
};

export const themeQuartz: ThemeParams = { ...BASE_QUARTZ };

export const themeAlpine: ThemeParams = {
  ...BASE_QUARTZ,
  backgroundColor: '#f8f9fa',
  headerBackgroundColor: '#3949ab',
  headerTextColor: '#ffffff',
  borderColor: '#bdc3c7',
  borderRadius: '4px',
  accentColor: '#3949ab',
  checkboxCheckedBackgroundColor: '#3949ab',
  inputFocusBorder: '2px solid #3949ab',
  selectedRowBackgroundColor: '#e8eaf6',
  rangeSelectionBackgroundColor: '#c5cae9',
  rowHoverColor: '#eceff1',
  oddRowBackgroundColor: '#ffffff',
  chromeBackgroundColor: '#ffffff',
  toolPanelBackgroundColor: '#ffffff',
  statusBarBackgroundColor: '#ffffff',
};

export const themeBalham: ThemeParams = {
  ...BASE_QUARTZ,
  backgroundColor: '#ffffff',
  headerBackgroundColor: '#f5f7f7',
  headerTextColor: '#000000',
  borderColor: '#bdc3c7',
  borderRadius: '2px',
  fontSize: '12px',
  headerFontSize: '11px',
  spacing: '4px',
  cellHorizontalPadding: '8px',
  accentColor: '#0091ea',
  checkboxCheckedBackgroundColor: '#0091ea',
  inputFocusBorder: '1px solid #0091ea',
  selectedRowBackgroundColor: '#b3e5fc',
  rangeSelectionBackgroundColor: '#81d4fa',
  rowHoverColor: '#e0f7fa',
  oddRowBackgroundColor: '#fcfcfc',
  wrapperBorder: '1px solid #bdc3c7',
  chromeBackgroundColor: '#f5f7f7',
  toolPanelBackgroundColor: '#f5f7f7',
  statusBarBackgroundColor: '#f5f7f7',
};

export const themeMaterial: ThemeParams = {
  ...BASE_QUARTZ,
  backgroundColor: '#ffffff',
  headerBackgroundColor: '#ffffff',
  headerTextColor: '#212121',
  borderColor: '#e0e0e0',
  borderRadius: '4px',
  fontFamily: '"Roboto", "Segoe UI", sans-serif',
  fontSize: '13px',
  headerFontSize: '12px',
  spacing: '8px',
  cellHorizontalPadding: '16px',
  accentColor: '#3f51b5',
  checkboxCheckedBackgroundColor: '#3f51b5',
  inputFocusBorder: '2px solid #3f51b5',
  selectedRowBackgroundColor: '#e8eaf6',
  rangeSelectionBackgroundColor: '#c5cae9',
  rowHoverColor: '#f5f5f5',
  oddRowBackgroundColor: '#fafafa',
  wrapperBorder: 'none',
  chromeBackgroundColor: '#ffffff',
  popupShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  tooltipBackgroundColor: '#616161',
  toolPanelBackgroundColor: '#fafafa',
  statusBarBackgroundColor: '#fafafa',
};

const LEGACY_BASE_THEMES: Record<string, ThemeParams> = {
  'db-light': {
    ...themeQuartz,
    backgroundColor: '#FFFFFF',
    foregroundColor: '#1F2937',
    borderColor: '#E5E7EB',
    headerBackgroundColor: '#F3F4F6',
    headerTextColor: '#374151',
    oddRowBackgroundColor: '#FAFAFA',
    rowHoverColor: '#F3F4F6',
    selectedRowBackgroundColor: '#E5E7EB',
    rangeSelectionBackgroundColor: '#D1D5DB',
    chromeBackgroundColor: '#FFFFFF',
    accentColor: '#6B7280',
    checkboxCheckedBackgroundColor: '#6B7280',
    inputFocusBorder: '2px solid #6B7280',
    toolPanelBackgroundColor: '#F9FAFB',
    statusBarBackgroundColor: '#F3F4F6',
    tooltipBackgroundColor: '#374151',
    wrapperBorder: '1px solid #E5E7EB',
    popupShadow: '0 12px 32px rgba(31, 41, 55, 0.12)',
  },
  'db-dark': {
    ...themeQuartz,
    backgroundColor: '#111827',
    foregroundColor: '#F9FAFB',
    borderColor: '#374151',
    headerBackgroundColor: '#1F2937',
    headerTextColor: '#E5E7EB',
    oddRowBackgroundColor: '#151C2A',
    rowHoverColor: '#1F2937',
    selectedRowBackgroundColor: '#374151',
    rangeSelectionBackgroundColor: '#4B5563',
    chromeBackgroundColor: '#1F2937',
    accentColor: '#9CA3AF',
    checkboxCheckedBackgroundColor: '#9CA3AF',
    inputFocusBorder: '2px solid #9CA3AF',
    toolPanelBackgroundColor: '#1F2937',
    statusBarBackgroundColor: '#1F2937',
    tooltipBackgroundColor: '#0B1220',
    wrapperBorder: '1px solid #374151',
    popupShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
  },
  quartz: themeQuartz,
  alpine: themeAlpine,
  balham: themeBalham,
  material: themeMaterial,
};

/** Brand default — yellow/orange accents on white */
export const themeDbLight: ThemeParams = { ...LEGACY_BASE_THEMES['db-light'] };
export const themeDbDark: ThemeParams = { ...LEGACY_BASE_THEMES['db-dark'] };

export function resolveBaseTheme(base: string): ThemeParams {
  return LEGACY_BASE_THEMES[base] ?? themeQuartz;
}

export function listThemeNames(): string[] {
  return Object.keys(LEGACY_BASE_THEMES);
}

const THEME_PARAM_KEYS: (keyof ThemeParams)[] = [
  'backgroundColor',
  'foregroundColor',
  'borderColor',
  'headerBackgroundColor',
  'headerTextColor',
  'oddRowBackgroundColor',
  'rowHoverColor',
  'selectedRowBackgroundColor',
  'rangeSelectionBackgroundColor',
  'fontFamily',
  'fontSize',
  'headerFontSize',
  'spacing',
  'borderRadius',
  'cellHorizontalPadding',
  'wrapperBorder',
  'chromeBackgroundColor',
  'inputFocusBorder',
  'checkboxCheckedBackgroundColor',
  'iconSize',
  'popupShadow',
  'tooltipBackgroundColor',
  'toolPanelBackgroundColor',
  'statusBarBackgroundColor',
  'accentColor',
];

function paramToCssVarKey(key: keyof ThemeParams): string {
  return `--agx-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
}

export function themeWithParams(base: ThemeParams, overrides: Partial<ThemeParams>): ThemeParams {
  return { ...base, ...overrides };
}

export function themeToCssVars(params: ThemeParams): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const key of THEME_PARAM_KEYS) {
    vars[paramToCssVarKey(key)] = params[key];
  }

  // Legacy aliases used by existing CSS.
  vars['--agx-bg'] = params.backgroundColor;
  vars['--agx-surface'] = params.chromeBackgroundColor;
  vars['--agx-ink'] = params.foregroundColor;
  vars['--agx-line'] = params.borderColor;
  vars['--agx-accent'] = params.accentColor;
  vars['--agx-header'] = params.headerBackgroundColor;
  vars['--agx-header-ink'] = params.headerTextColor;
  vars['--agx-row-alt'] = params.oddRowBackgroundColor;
  vars['--agx-selected'] = params.selectedRowBackgroundColor;
  vars['--agx-range'] = params.rangeSelectionBackgroundColor;
  vars['--agx-font'] = params.fontFamily;
  vars['--agx-row-hover'] = params.rowHoverColor;

  return vars;
}

export function applyThemeToElement(el: HTMLElement, params: ThemeParams): void {
  const vars = themeToCssVars(params);
  for (const [key, value] of Object.entries(vars)) {
    el.style.setProperty(key, value);
  }
}

export type ThemeVariables = Record<string, string | number>;

export interface ThemeResult {
  variables: ThemeVariables;
  className: string;
  style: CSSProperties;
  cssText: string;
  params: ThemeParams;
}

function normalizeVarKey(key: string): string {
  return key.startsWith('--') ? key : `--agx-${key.replace(/^agx-/, '')}`;
}

function legacyParamsToThemeOverrides(
  params: Record<string, string | number>
): Partial<ThemeParams> {
  const overrides: Partial<ThemeParams> = {};
  const legacyMap: Record<string, keyof ThemeParams> = {
    '--agx-bg': 'backgroundColor',
    '--agx-surface': 'chromeBackgroundColor',
    '--agx-ink': 'foregroundColor',
    '--agx-line': 'borderColor',
    '--agx-accent': 'accentColor',
    '--agx-header': 'headerBackgroundColor',
    '--agx-header-ink': 'headerTextColor',
    '--agx-row-alt': 'oddRowBackgroundColor',
    '--agx-selected': 'selectedRowBackgroundColor',
    '--agx-range': 'rangeSelectionBackgroundColor',
    '--agx-font': 'fontFamily',
    '--agx-row-hover': 'rowHoverColor',
    backgroundColor: 'backgroundColor',
    foregroundColor: 'foregroundColor',
    borderColor: 'borderColor',
    headerBackgroundColor: 'headerBackgroundColor',
    headerTextColor: 'headerTextColor',
    oddRowBackgroundColor: 'oddRowBackgroundColor',
    rowHoverColor: 'rowHoverColor',
    selectedRowBackgroundColor: 'selectedRowBackgroundColor',
    rangeSelectionBackgroundColor: 'rangeSelectionBackgroundColor',
    fontFamily: 'fontFamily',
    fontSize: 'fontSize',
    headerFontSize: 'headerFontSize',
    spacing: 'spacing',
    borderRadius: 'borderRadius',
    cellHorizontalPadding: 'cellHorizontalPadding',
    wrapperBorder: 'wrapperBorder',
    chromeBackgroundColor: 'chromeBackgroundColor',
    inputFocusBorder: 'inputFocusBorder',
    checkboxCheckedBackgroundColor: 'checkboxCheckedBackgroundColor',
    iconSize: 'iconSize',
    popupShadow: 'popupShadow',
    tooltipBackgroundColor: 'tooltipBackgroundColor',
    toolPanelBackgroundColor: 'toolPanelBackgroundColor',
    statusBarBackgroundColor: 'statusBarBackgroundColor',
    accentColor: 'accentColor',
  };

  for (const [key, value] of Object.entries(params)) {
    const normalized = normalizeVarKey(key);
    const themeKey = legacyMap[normalized] ?? legacyMap[key.replace(/^--agx-/, '')];
    if (themeKey) {
      overrides[themeKey] = String(value);
    } else if ((THEME_PARAM_KEYS as string[]).includes(key)) {
      overrides[key as keyof ThemeParams] = String(value);
    }
  }

  return overrides;
}

export function createTheme(
  base: string,
  params: Record<string, string | number> = {}
): ThemeResult {
  const baseParams = resolveBaseTheme(base);
  const mergedParams = themeWithParams(baseParams, legacyParamsToThemeOverrides(params));
  const merged = themeToCssVars(mergedParams);

  for (const [key, value] of Object.entries(params)) {
    merged[normalizeVarKey(key)] = String(value);
  }

  const style: CSSProperties = {};
  let cssText = '';
  for (const [key, value] of Object.entries(merged)) {
    const v = String(value);
    (style as Record<string, string>)[key] = v;
    cssText += `${key}:${v};`;
  }

  return {
    variables: merged,
    className: `agx-theme-${base}`,
    style,
    cssText,
    params: mergedParams,
  };
}

export function createThemeStyleString(
  base: string,
  params: Record<string, string | number> = {}
): string {
  return createTheme(base, params).cssText;
}
