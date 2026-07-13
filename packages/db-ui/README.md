# @db-grid/ui

Material UI–style React components (Tailwind) plus MUI X–inspired clones.

Default brand: **orange + yellow on white**. Fully overridable.

```bash
npm i @db-grid/ui
```

## Theming

```tsx
import {
  ThemeProvider,
  createUiTheme,
  brandLightPalette,
} from '@db-grid/ui';

// Option A — partial palette
<ThemeProvider palette={{ primary: '#FF6B00', accent: '#FFD60A' }}>
  <App />
</ThemeProvider>

// Option B — full theme object (custom CSS var prefix for white-label)
const theme = createUiTheme({
  mode: 'light',
  cssVarPrefix: '--myapp',
  palette: { ...brandLightPalette, primary: '#FF6B00' },
});

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

Components read CSS variables (`--mui-primary`, `--mui-accent`, …). Change `cssVarPrefix` and they follow.

Bridge to the grid:

```tsx
import { uiPaletteToGridOverrides } from '@db-grid/ui';
import { createTheme } from '@deepbratt55/db-grid';

const grid = createTheme('db-light', uiPaletteToGridOverrides(theme.palette));
```
