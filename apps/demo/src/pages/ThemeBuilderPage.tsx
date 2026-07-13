import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import {
  DbGrid,
  type ColumnDef,
  themeQuartz,
  themeAlpine,
  themeBalham,
  themeMaterial,
  themeDbLight,
  themeDbDark,
  themeWithParams,
  themeToCssVars,
  type ThemeParams,
} from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';
import { DEMO_LICENSE_KEY, generateInstruments, type Instrument } from '../data/instruments';

type PresetKey = 'db-light' | 'db-dark' | 'quartz' | 'alpine' | 'balham' | 'material';

const PRESETS: Record<PresetKey, ThemeParams> = {
  'db-light': themeDbLight,
  'db-dark': themeDbDark,
  quartz: themeQuartz,
  alpine: themeAlpine,
  balham: themeBalham,
  material: themeMaterial,
};

const DENSITY = {
  tiny: { spacing: '2px', fontSize: '11px', headerFontSize: '10px' },
  normal: { spacing: '4px', fontSize: '13px', headerFontSize: '12px' },
  large: { spacing: '8px', fontSize: '14px', headerFontSize: '13px' },
} as const;

type DensityKey = keyof typeof DENSITY;

function parsePx(value: string, fallback: number): number {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function formatCssVars(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
}

export function ThemeBuilderPage() {
  const [preset, setPreset] = useState<PresetKey>('db-light');
  const [density, setDensity] = useState<DensityKey>('normal');
  const [overrides, setOverrides] = useState<Partial<ThemeParams>>({});
  const [copyNote, setCopyNote] = useState('');
  const [rowData] = useState(() => generateInstruments(80));

  const params = useMemo(
    () =>
      themeWithParams(PRESETS[preset], {
        ...DENSITY[density],
        ...overrides,
      }),
    [preset, density, overrides]
  );

  const cssVars = useMemo(() => themeToCssVars(params), [params]);
  const cssText = useMemo(() => `:root {\n${formatCssVars(cssVars)}\n}`, [cssVars]);

  const columnDefs = useMemo<ColumnDef<Instrument>[]>(
    () => [
      { field: 'ticker', headerName: 'Ticker', width: 110, pinned: 'left' },
      { field: 'name', headerName: 'Name', flex: 1.2, minWidth: 160 },
      {
        field: 'price',
        headerName: 'Price',
        width: 120,
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
      {
        field: 'pnl',
        headerName: 'P&L',
        width: 120,
        valueFormatter: (p) => {
          const v = Number(p.value) || 0;
          return `${v >= 0 ? '+' : ''}${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        },
      },
    ],
    []
  );

  const patch = useCallback((patch: Partial<ThemeParams>) => {
    setOverrides((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    setOverrides({});
  };

  const applyDensity = (key: DensityKey) => {
    setDensity(key);
    patch(DENSITY[key]);
  };

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(cssText);
      setCopyNote('Copied!');
      window.setTimeout(() => setCopyNote(''), 2000);
    } catch {
      setCopyNote('Copy failed');
    }
  };

  const spacingNum = parsePx(params.spacing, 4);
  const fontSizeNum = parsePx(params.fontSize, 13);
  const borderRadiusNum = parsePx(params.borderRadius, 8);

  return (
    <main className="page page-wide theme-builder">
      <header className="page-hero compact">
        <p className="eyebrow">Layout & Styling</p>
        <h1>Theme Builder</h1>
        <p className="lede">
          Start from Quartz, Alpine, Balham, or Material — tune colours, spacing, and typography.
          Live preview uses <code>themeToCssVars</code> on an <code>agx-root</code> wrapper.
        </p>
      </header>

      <div className="tb-layout">
        <aside className="tb-panel">
          <section className="tb-section">
            <h3>Presets</h3>
            <div className="tb-btn-row">
              {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`btn ${preset === key ? 'primary' : ''}`}
                  onClick={() => applyPreset(key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section className="tb-section">
            <h3>Density</h3>
            <div className="tb-btn-row">
              <button
                type="button"
                className={`btn ${density === 'tiny' ? 'primary' : ''}`}
                onClick={() => applyDensity('tiny')}
              >
                Tiny
              </button>
              <button
                type="button"
                className={`btn ${density === 'normal' ? 'primary' : ''}`}
                onClick={() => applyDensity('normal')}
              >
                Normal
              </button>
              <button
                type="button"
                className={`btn ${density === 'large' ? 'primary' : ''}`}
                onClick={() => applyDensity('large')}
              >
                Large
              </button>
            </div>
          </section>

          <section className="tb-section">
            <h3>Colours</h3>
            <div className="tb-fields">
              <label>
                Background
                <input
                  type="color"
                  value={params.backgroundColor}
                  onChange={(e) => patch({ backgroundColor: e.target.value })}
                />
              </label>
              <label>
                Foreground
                <input
                  type="color"
                  value={params.foregroundColor}
                  onChange={(e) => patch({ foregroundColor: e.target.value })}
                />
              </label>
              <label>
                Header background
                <input
                  type="color"
                  value={params.headerBackgroundColor}
                  onChange={(e) => patch({ headerBackgroundColor: e.target.value })}
                />
              </label>
              <label>
                Header text
                <input
                  type="color"
                  value={params.headerTextColor}
                  onChange={(e) => patch({ headerTextColor: e.target.value })}
                />
              </label>
              <label>
                Accent
                <input
                  type="color"
                  value={params.accentColor}
                  onChange={(e) =>
                    patch({
                      accentColor: e.target.value,
                      selectedRowBackgroundColor: e.target.value + '33',
                      checkboxCheckedBackgroundColor: e.target.value,
                    })
                  }
                />
              </label>
            </div>
          </section>

          <section className="tb-section">
            <h3>Layout & type</h3>
            <div className="tb-sliders">
              <label>
                Spacing ({spacingNum}px)
                <input
                  type="range"
                  min={0}
                  max={16}
                  step={1}
                  value={spacingNum}
                  onChange={(e) => patch({ spacing: `${e.target.value}px` })}
                />
              </label>
              <label>
                Font size ({fontSizeNum}px)
                <input
                  type="range"
                  min={10}
                  max={18}
                  step={1}
                  value={fontSizeNum}
                  onChange={(e) => patch({ fontSize: `${e.target.value}px` })}
                />
              </label>
              <label>
                Border radius ({borderRadiusNum}px)
                <input
                  type="range"
                  min={0}
                  max={16}
                  step={1}
                  value={borderRadiusNum}
                  onChange={(e) => patch({ borderRadius: `${e.target.value}px` })}
                />
              </label>
            </div>
          </section>

          <section className="tb-section">
            <div className="tb-css-head">
              <h3>Generated CSS</h3>
              <button type="button" className="btn" onClick={() => void copyCss()}>
                Copy CSS
              </button>
              {copyNote && <span className="tb-copy-note">{copyNote}</span>}
            </div>
            <pre className="tb-css-pre">{cssText}</pre>
          </section>
        </aside>

        <section className="tb-preview">
          <div
            className="agx-root tb-grid-wrap"
            style={{ ...themeToCssVars(params), height: 560 } as CSSProperties}
          >
            <DbGrid<Instrument>
              rowData={rowData}
              columnDefs={columnDefs}
              licenseKey={DEMO_LICENSE_KEY}
              theme={params}
              pagination
              paginationPageSize={25}
              sideBar
              defaultColDef={{ sortable: true, filter: true, resizable: true }}
              getRowId={(d) => d.id ?? d.ticker}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
