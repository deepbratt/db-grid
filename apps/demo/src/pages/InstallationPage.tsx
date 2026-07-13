import { Link } from 'react-router-dom';
import { Alert, Paper, Stack, Typography } from '@db-grid/ui';

const PACKAGES = [
  {
    name: '@deepbratt55/db-grid',
    need: 'Excel-like data grid',
    install: 'npm i @deepbratt55/db-grid',
    importHint: `import { DbGrid } from '@deepbratt55/db-grid';\nimport '@deepbratt55/db-grid/styles.css';\n\n<DbGrid\n  rowData={rows}\n  columnDefs={cols}\n  enableRangeSelection\n  enableFillHandle\n  enableFormulaBar\n/>`,
  },
] as const;

export function InstallationPage() {
  return (
    <article className="mui-doc-page">
      <nav className="mui-doc-crumbs">
        <Link to="/material-ui/all-components">Grid features</Link>
        <span>/</span>
        <strong>Installation</strong>
      </nav>
      <header className="mui-doc-hero">
        <h1>Installation</h1>
        <span className="mui-badge mui-badge-excel">Excel-like</span>
      </header>
      <p className="mui-doc-intro">
        Install <strong>@deepbratt55/db-grid</strong> for the Excel-like React grid — formulas, clipboard, fill
        handle, grouping, pivot, and SSRM in one focused package.
      </p>

      <Alert severity="info">
        One package. Grid-only. Built to be the best spreadsheet-grade React data grid.
      </Alert>

      <h2>Package</h2>
      <div className="mui-install-grid">
        {PACKAGES.map((pkg) => (
          <Paper key={pkg.name} elevation={0} className="mui-install-card">
            <Typography variant="overline">{pkg.need}</Typography>
            <Typography variant="h6" component="h3">
              {pkg.name}
            </Typography>
            <pre className="mui-code">{pkg.install}</pre>
            <pre className="mui-code">{pkg.importHint}</pre>
          </Paper>
        ))}
      </div>

      <h2>Next</h2>
      <Stack direction="row" spacing={2} className="mui-doc-actions">
        <Link to="/demos/live" className="btn primary">
          Kitchen sink demo
        </Link>
        <Link to="/material-ui/all-components" className="btn">
          Feature catalog
        </Link>
      </Stack>
    </article>
  );
}
