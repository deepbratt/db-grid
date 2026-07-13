# @db-grid/full

Complete db-grid suite — Excel-like grid + MUI-like UI kit.

```bash
npm i @db-grid/full
```

```tsx
import {
  DbGrid,
  Button,
  ThemeProvider,
  createUiTheme,
} from '@db-grid/full';
import '@db-grid/full/styles.css';

const theme = createUiTheme({
  palette: { primary: '#FF6B00', accent: '#FFD60A' },
});

<ThemeProvider theme={theme}>
  <Button variant="contained">Hello</Button>
  <DbGrid theme="db-light" rowData={rows} columnDefs={cols} />
</ThemeProvider>
```

## Lightweight alternatives

| Need | Install |
|------|---------|
| Data grid only | `npm i @deepbratt55/db-grid` |
| MUI-like UI only | `npm i @db-grid/ui` |
| Everything | `npm i @db-grid/full` |

Grid `Toolbar` / `Tooltip` keep default names from core; UI versions are `UiToolbar` / `UiTooltip`.
