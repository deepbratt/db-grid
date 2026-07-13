import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import {
  brandDarkPalette,
  brandLightPalette,
  createUiTheme,
  type CreateUiThemeOptions,
  type UiMode,
  type UiPalette,
  type UiTheme,
} from './tokens';

export type { UiMode, UiPalette, UiTheme, CreateUiThemeOptions };
export {
  brandLightPalette,
  brandDarkPalette,
  createUiTheme,
  paletteToCssVars,
  chartColorsFromPalette,
  uiPaletteToGridOverrides,
} from './tokens';

type ThemeContextValue = {
  mode: UiMode;
  palette: UiPalette;
  theme: UiTheme;
  setMode: (mode: UiMode) => void;
};

const defaultTheme = createUiTheme({ mode: 'light' });

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  palette: brandLightPalette,
  theme: defaultTheme,
  setMode: () => undefined,
});

export function useUiTheme() {
  return useContext(ThemeContext);
}

export type ThemeProviderProps = {
  mode?: UiMode;
  onModeChange?: (mode: UiMode) => void;
  /** Partial or full palette override — highest priority after mode base */
  palette?: Partial<UiPalette>;
  /**
   * Full theme from `createUiTheme(...)`.
   * When set, overrides `mode` / `palette` for tokens (mode still used for `dark` class).
   */
  theme?: UiTheme;
  /** CSS variable prefix (default `--mui`) — white-label friendly */
  cssVarPrefix?: string;
  children: ReactNode;
};

export function ThemeProvider({
  mode = 'light',
  onModeChange,
  palette: paletteOverride,
  theme: themeProp,
  cssVarPrefix,
  children,
}: ThemeProviderProps) {
  const theme = useMemo(() => {
    if (themeProp) return themeProp;
    return createUiTheme({ mode, palette: paletteOverride, cssVarPrefix });
  }, [themeProp, mode, paletteOverride, cssVarPrefix]);

  const value = useMemo(
    () => ({
      mode: theme.mode,
      palette: theme.palette,
      theme,
      setMode: (next: UiMode) => onModeChange?.(next),
    }),
    [theme, onModeChange]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={theme.mode === 'dark' ? 'dark' : undefined}
        style={theme.style}
        data-mui-theme={theme.mode}
        data-db-theme={theme.mode}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/** @deprecated Prefer brandLightPalette — kept for older imports */
export const lightPalette = brandLightPalette;
/** @deprecated Prefer brandDarkPalette */
export const darkPalette = brandDarkPalette;
