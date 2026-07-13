import { useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  BarChart,
  CandlestickChart,
  Chip,
  Container,
  DataGridPremium,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  DigitalClock,
  FunnelChart,
  Grid,
  HeatmapChart,
  LineChart,
  PieChart,
  RichTreeView,
  SankeyChart,
  ScatterChart,
  Scheduler,
  Stack,
  Switch,
  ThemeProvider,
  TimePicker,
  TimeRangePicker,
  Toolbar,
  Typography,
  type DateRange,
  type GridColDef,
  type SchedulerEvent,
  type UiMode,
} from '@db-grid/ui';

type Row = {
  id: number;
  ticker: string;
  region: string;
  price: number;
  qty: number;
};

const GRID_ROWS: Row[] = [
  { id: 1, ticker: 'AAPL', region: 'US', price: 198, qty: 120 },
  { id: 2, ticker: 'MSFT', region: 'US', price: 420, qty: 80 },
  { id: 3, ticker: 'SAP', region: 'EU', price: 180, qty: 40 },
  { id: 4, ticker: 'NESN', region: 'EU', price: 95, qty: 200 },
  { id: 5, ticker: 'SONY', region: 'APAC', price: 88, qty: 150 },
  { id: 6, ticker: 'TSM', region: 'APAC', price: 142, qty: 90 },
  { id: 7, ticker: 'NVDA', region: 'US', price: 900, qty: 30 },
  { id: 8, ticker: 'ASML', region: 'EU', price: 710, qty: 25 },
];

const GRID_COLS: GridColDef<Row>[] = [
  { field: 'ticker', headerName: 'Ticker', width: 110, groupable: true },
  { field: 'region', headerName: 'Region', width: 110, groupable: true },
  { field: 'price', headerName: 'Price', type: 'number', width: 100, aggregable: true },
  { field: 'qty', headerName: 'Qty', type: 'number', width: 90, aggregable: true },
];

const TREE = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'ui', label: 'db-ui' },
      { id: 'grid', label: 'db-grid' },
      {
        id: 'x',
        label: 'x (premium)',
        children: [
          { id: 'pickers', label: 'date-pickers' },
          { id: 'charts', label: 'charts' },
        ],
      },
    ],
  },
  { id: 'apps', label: 'apps', children: [{ id: 'demo', label: 'demo' }] },
];

export function MuiXPremiumPage() {
  const [mode, setMode] = useState<UiMode>('light');
  const [date, setDate] = useState<string | null>('2026-07-13');
  const [time, setTime] = useState<string | null>('14:30');
  const [dt, setDt] = useState<string | null>('2026-07-13T14:30');
  const [range, setRange] = useState<DateRange>({ start: '2026-07-01', end: '2026-07-20' });
  const [timeRange, setTimeRange] = useState<{ start: string | null; end: string | null }>({
    start: '09:00',
    end: '17:00',
  });
  const [treeSel, setTreeSel] = useState<string[]>([]);
  const [clock, setClock] = useState('09:15');

  const events = useMemo<SchedulerEvent[]>(
    () => [
      { id: '1', title: 'Sprint planning', start: '2026-07-13', color: '#0d7377' },
      { id: '2', title: 'License review', start: '2026-07-15', color: '#0288d1' },
      { id: '3', title: 'Chart polish', start: '2026-07-15', color: '#ed6c02' },
      { id: '4', title: 'Ship UI kit', start: '2026-07-18', color: '#2e7d32' },
    ],
    []
  );

  const chartDataset = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    series: [
      { label: 'Revenue', data: [12, 18, 14, 22, 26] },
      { label: 'Costs', data: [8, 9, 11, 10, 12] },
    ],
  };

  return (
    <ThemeProvider mode={mode} onModeChange={setMode}>
      <main className="!bg-[var(--mui-bg)] !text-[var(--mui-text)]">
        <AppBar position="sticky" color="default">
          <Toolbar dense>
            <Typography variant="h6" className="!mr-auto">
              MUI X Premium
            </Typography>
            <Chip label="Tailwind clones · Pro + Premium" color="warning" size="small" />
            <Switch
              className="ml-3"
              label={mode === 'dark' ? 'Dark' : 'Light'}
              checked={mode === 'dark'}
              onChange={(e) => setMode(e.target.checked ? 'dark' : 'light')}
            />
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" className="py-8">
          <Stack spacing={2} className="mb-8">
            <Typography variant="overline" color="primary">
              @db-grid/ui · x/*
            </Typography>
            <Typography variant="h3" className="!font-[family-name:var(--display)]">
              MUI X Premium features
            </Typography>
            <Typography variant="body1" color="secondary" className="max-w-3xl">
              Tailwind reimplementations of MUI X Pro/Premium: Date & Time Range Pickers, Rich Tree
              View, advanced Charts, DataGridPremium, and Scheduler.
            </Typography>
            <Alert severity="info">
              Inspired by MUI X feature surface — independent open implementation for db-grid.
            </Alert>
          </Stack>

          <Stack spacing={6}>
            <section>
              <Typography variant="h5" gutterBottom>
                Date & Time Pickers
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <DatePicker label="DatePicker" fullWidth value={date} onChange={setDate} />
                    <TimePicker label="TimePicker" fullWidth value={time} onChange={setTime} />
                    <DateTimePicker label="DateTimePicker" fullWidth value={dt} onChange={setDt} />
                    <DigitalClock value={clock} onChange={setClock} />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <DateRangePicker
                      label="DateRangePicker (Pro)"
                      fullWidth
                      value={range}
                      onChange={setRange}
                    />
                    <TimeRangePicker
                      label="TimeRangePicker (Pro)"
                      fullWidth
                      value={timeRange}
                      onChange={setTimeRange}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </section>

            <section>
              <Typography variant="h5" gutterBottom>
                Rich Tree View (Pro)
              </Typography>
              <RichTreeView
                items={TREE}
                checkboxSelection
                multiSelect
                itemsReordering
                defaultExpandedItems={['src', 'x']}
                selectedItems={treeSel}
                onSelectedItemsChange={(ids) =>
                  setTreeSel(Array.isArray(ids) ? ids : ids ? [ids] : [])
                }
              />
            </section>

            <section>
              <Typography variant="h5" gutterBottom>
                Charts
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <BarChart title="BarChart" dataset={chartDataset} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <LineChart title="LineChart" dataset={chartDataset} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PieChart
                    title="PieChart"
                    innerRadius={18}
                    series={[
                      { label: 'Grid', value: 40 },
                      { label: 'Charts', value: 25 },
                      { label: 'UI', value: 20 },
                      { label: 'API', value: 15 },
                    ]}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ScatterChart
                    title="ScatterChart"
                    points={[
                      { x: 10, y: 20 },
                      { x: 20, y: 35 },
                      { x: 30, y: 28 },
                      { x: 40, y: 50 },
                      { x: 55, y: 44 },
                    ]}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FunnelChart
                    title="FunnelChart (Pro)"
                    data={[
                      { label: 'Visits', value: 1000 },
                      { label: 'Signups', value: 420 },
                      { label: 'Trials', value: 180 },
                      { label: 'Paid', value: 64 },
                    ]}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SankeyChart
                    title="SankeyChart (Pro)"
                    nodes={['Web', 'API', 'Grid', 'Charts']}
                    links={[
                      { source: 'Web', target: 'API', value: 40 },
                      { source: 'API', target: 'Grid', value: 28 },
                      { source: 'API', target: 'Charts', value: 12 },
                    ]}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <HeatmapChart
                    title="HeatmapChart (Premium)"
                    rows={['Mon', 'Tue', 'Wed']}
                    cols={['AM', 'Mid', 'PM']}
                    data={[
                      [2, 5, 3],
                      [4, 1, 6],
                      [3, 4, 2],
                    ]}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CandlestickChart
                    title="CandlestickChart (Premium)"
                    data={[
                      { label: 'M', open: 20, high: 28, low: 18, close: 26 },
                      { label: 'T', open: 26, high: 30, low: 22, close: 23 },
                      { label: 'W', open: 23, high: 27, low: 21, close: 25 },
                      { label: 'T', open: 25, high: 32, low: 24, close: 31 },
                      { label: 'F', open: 31, high: 33, low: 27, close: 28 },
                    ]}
                  />
                </Grid>
              </Grid>
            </section>

            <section>
              <Typography variant="h5" gutterBottom>
                DataGridPremium
              </Typography>
              <Typography variant="body2" color="secondary" className="mb-3">
                Multi-sort · pin · filter · row grouping · aggregation · Excel export
              </Typography>
              <DataGridPremium
                rows={GRID_ROWS}
                columns={GRID_COLS}
                checkboxSelection
                multiSort
                rowGrouping
                aggregation
                excelExport
                pageSizeOptions={[5, 10]}
              />
            </section>

            <section>
              <Typography variant="h5" gutterBottom>
                Scheduler (Premium)
              </Typography>
              <Scheduler events={events} />
            </section>
          </Stack>
        </Container>
      </main>
    </ThemeProvider>
  );
}
