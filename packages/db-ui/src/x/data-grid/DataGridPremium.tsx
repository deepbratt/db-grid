import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { Chip } from '../../Chip';
import { Paper } from '../../Paper';
import { Stack } from '../../Stack';
import { TextField } from '../../TextField';
import { Typography } from '../../Typography';
import { cx } from '../../utils/cx';

export type GridColDef<T = Record<string, unknown>> = {
  field: keyof T & string;
  headerName?: string;
  width?: number;
  type?: 'string' | 'number' | 'boolean' | 'date';
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  aggregable?: boolean;
  pinnable?: boolean;
  valueFormatter?: (value: unknown, row: T) => ReactNode;
};

export type DataGridPremiumProps<T extends Record<string, unknown> = Record<string, unknown>> = {
  rows: T[];
  columns: GridColDef<T>[];
  getRowId?: (row: T) => string | number;
  checkboxSelection?: boolean;
  /** Pro */
  disableColumnPinning?: boolean;
  /** Pro */
  multiSort?: boolean;
  /** Premium */
  rowGrouping?: boolean;
  /** Premium */
  aggregation?: boolean;
  /** Premium */
  excelExport?: boolean;
  density?: 'compact' | 'standard' | 'comfortable';
  pageSizeOptions?: number[];
  className?: string;
  /** Premium watermark-free in this clone */
  premium?: boolean;
};

type SortItem = { field: string; dir: 'asc' | 'desc' };

function exportCsv(filename: string, rows: Record<string, unknown>[], fields: string[]) {
  const lines = [
    fields.join(','),
    ...rows.map((r) =>
      fields
        .map((f) => {
          const v = r[f];
          const s = v == null ? '' : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** SpreadsheetML-ish Excel export (Premium) */
function exportExcel(filename: string, rows: Record<string, unknown>[], fields: string[]) {
  const header = fields.map((f) => `<Cell><Data ss:Type="String">${f}</Data></Cell>`).join('');
  const body = rows
    .map((r) => {
      const cells = fields
        .map((f) => {
          const v = r[f];
          const type = typeof v === 'number' ? 'Number' : 'String';
          return `<Cell><Data ss:Type="${type}">${v == null ? '' : String(v)}</Data></Cell>`;
        })
        .join('');
      return `<Row>${cells}</Row>`;
    })
    .join('');
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Sheet1"><Table>
  <Row>${header}</Row>
  ${body}
 </Table></Worksheet>
</Workbook>`;
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * MUI X Data Grid Premium clone (Tailwind) —
 * multi-sort, pin, filter, row grouping, aggregation, Excel export.
 */
export function DataGridPremium<T extends Record<string, unknown>>({
  rows,
  columns,
  getRowId = (r) => String((r as { id?: string | number }).id ?? JSON.stringify(r)),
  checkboxSelection,
  disableColumnPinning,
  multiSort = true,
  rowGrouping = true,
  aggregation = true,
  excelExport = true,
  density = 'standard',
  pageSizeOptions = [5, 10, 25],
  className,
}: DataGridPremiumProps<T>) {
  const [sortModel, setSortModel] = useState<SortItem[]>([]);
  const [filter, setFilter] = useState('');
  const [pinned, setPinned] = useState<string[]>([]);
  const [groupField, setGroupField] = useState<string | null>(null);
  const [aggField, setAggField] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0] ?? 10);

  const rowH = density === 'compact' ? 'h-9 text-xs' : density === 'comfortable' ? 'h-14 text-sm' : 'h-11 text-sm';

  const processed = useMemo(() => {
    let list = [...rows];
    if (filter.trim()) {
      const q = filter.toLowerCase();
      list = list.filter((r) =>
        columns.some((c) => String(r[c.field] ?? '').toLowerCase().includes(q))
      );
    }
    for (const s of [...sortModel].reverse()) {
      list.sort((a, b) => {
        const av = a[s.field];
        const bv = b[s.field];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (av < bv) return s.dir === 'asc' ? -1 : 1;
        if (av > bv) return s.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [rows, filter, sortModel, columns]);

  const grouped = useMemo(() => {
    if (!groupField) return null;
    const map = new Map<string, T[]>();
    for (const r of processed) {
      const key = String(r[groupField] ?? '(blank)');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [processed, groupField]);

  const pageRows = useMemo(() => {
    if (grouped) return processed;
    const start = page * pageSize;
    return processed.slice(start, start + pageSize);
  }, [processed, page, pageSize, grouped]);

  const toggleSort = (field: string) => {
    setSortModel((prev) => {
      const idx = prev.findIndex((s) => s.field === field);
      if (idx >= 0) {
        const cur = prev[idx];
        if (cur.dir === 'asc') {
          const next = [...prev];
          next[idx] = { field, dir: 'desc' };
          return next;
        }
        return prev.filter((_, i) => i !== idx);
      }
      const item = { field, dir: 'asc' as const };
      return multiSort ? [...prev, item] : [item];
    });
  };

  const togglePin = (field: string) => {
    if (disableColumnPinning) return;
    setPinned((p) => (p.includes(field) ? p.filter((f) => f !== field) : [...p, field]));
  };

  const orderedCols = useMemo(() => {
    const pinnedCols = columns.filter((c) => pinned.includes(c.field));
    const rest = columns.filter((c) => !pinned.includes(c.field));
    return [...pinnedCols, ...rest];
  }, [columns, pinned]);

  const aggValue = useMemo(() => {
    if (!aggregation || !aggField) return null;
    const nums = processed.map((r) => Number(r[aggField])).filter((n) => Number.isFinite(n));
    if (!nums.length) return null;
    return {
      sum: nums.reduce((a, b) => a + b, 0),
      avg: nums.reduce((a, b) => a + b, 0) / nums.length,
      min: Math.min(...nums),
      max: Math.max(...nums),
      count: nums.length,
    };
  }, [aggregation, aggField, processed]);

  const renderCell = (col: GridColDef<T>, row: T) => {
    const raw = row[col.field];
    if (col.valueFormatter) return col.valueFormatter(raw, row);
    return raw == null ? '' : String(raw);
  };

  return (
    <Paper elevation={1} className={cx('overflow-hidden', className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--mui-divider)] px-3 py-2">
        <Chip label="DataGridPremium" color="warning" size="small" />
        <TextField
          size="small"
          placeholder="Quick filter…"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(0);
          }}
          className="!w-48"
        />
        {rowGrouping && (
          <select
            className="h-9 rounded-lg border border-[var(--mui-divider)] bg-[var(--mui-paper)] px-2 text-sm"
            value={groupField ?? ''}
            onChange={(e) => setGroupField(e.target.value || null)}
          >
            <option value="">No grouping</option>
            {columns.filter((c) => c.groupable !== false).map((c) => (
              <option key={c.field} value={c.field}>
                Group: {c.headerName ?? c.field}
              </option>
            ))}
          </select>
        )}
        {aggregation && (
          <select
            className="h-9 rounded-lg border border-[var(--mui-divider)] bg-[var(--mui-paper)] px-2 text-sm"
            value={aggField ?? ''}
            onChange={(e) => setAggField(e.target.value || null)}
          >
            <option value="">No aggregation</option>
            {columns
              .filter((c) => c.type === 'number' || c.aggregable)
              .map((c) => (
                <option key={c.field} value={c.field}>
                  Agg: {c.headerName ?? c.field}
                </option>
              ))}
          </select>
        )}
        <div className="ml-auto flex gap-2">
          <Button
            size="small"
            variant="outlined"
            onClick={() =>
              exportCsv(
                'grid-export.csv',
                processed as Record<string, unknown>[],
                columns.map((c) => c.field)
              )
            }
          >
            CSV
          </Button>
          {excelExport && (
            <Button
              size="small"
              variant="contained"
              onClick={() =>
                exportExcel(
                  'grid-export.xls',
                  processed as Record<string, unknown>[],
                  columns.map((c) => c.field)
                )
              }
            >
              Excel
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[color-mix(in_srgb,var(--mui-text)_4%,var(--mui-paper))]">
              {checkboxSelection && <th className="w-10 px-2" />}
              {orderedCols.map((col) => {
                const sort = sortModel.find((s) => s.field === col.field);
                const isPinned = pinned.includes(col.field);
                return (
                  <th
                    key={col.field}
                    className={cx(
                      'border-b border-[var(--mui-divider)] px-3 py-2 text-left text-xs font-bold uppercase tracking-wide',
                      isPinned && 'sticky left-0 z-10 bg-[var(--mui-paper)] shadow-sm'
                    )}
                    style={{ minWidth: col.width ?? 120 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <button
                        type="button"
                        className="hover:text-[var(--mui-primary)]"
                        onClick={() => col.sortable !== false && toggleSort(col.field)}
                      >
                        {col.headerName ?? col.field}
                        {sort ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''}
                        {sort && multiSort ? ` ${sortModel.indexOf(sort) + 1}` : ''}
                      </button>
                      {!disableColumnPinning && col.pinnable !== false && (
                        <button
                          type="button"
                          title="Pin column (Pro)"
                          className={cx('text-[0.65rem]', isPinned && 'text-[var(--mui-primary)]')}
                          onClick={() => togglePin(col.field)}
                        >
                          📌
                        </button>
                      )}
                    </Stack>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {grouped
              ? [...grouped.entries()].map(([key, groupRows]) => (
                  <Fragment key={`g-${key}`}>
                    <tr className="bg-[color-mix(in_srgb,var(--mui-primary)_10%,transparent)]">
                      <td
                        colSpan={orderedCols.length + (checkboxSelection ? 1 : 0)}
                        className="px-3 py-2 text-xs font-bold"
                      >
                        {groupField}: {key} ({groupRows.length})
                        {aggField && (
                          <span className="ml-3 font-medium text-[var(--mui-text-secondary)]">
                            Σ{' '}
                            {groupRows
                              .map((r) => Number(r[aggField]))
                              .filter((n) => Number.isFinite(n))
                              .reduce((a, b) => a + b, 0)
                              .toLocaleString()}
                          </span>
                        )}
                      </td>
                    </tr>
                    {groupRows.map((row) => {
                      const id = String(getRowId(row));
                      return (
                        <tr key={id} className={cx('border-b border-[var(--mui-divider)]', rowH)}>
                          {checkboxSelection && (
                            <td className="px-2">
                              <Checkbox
                                checked={selected.has(id)}
                                onChange={() => {
                                  setSelected((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(id)) next.delete(id);
                                    else next.add(id);
                                    return next;
                                  });
                                }}
                              />
                            </td>
                          )}
                          {orderedCols.map((col) => (
                            <td
                              key={col.field}
                              className={cx(
                                'px-3',
                                pinned.includes(col.field) && 'sticky left-0 bg-[var(--mui-paper)]'
                              )}
                            >
                              {renderCell(col, row)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </Fragment>
                ))
              : pageRows.map((row) => {
                  const id = String(getRowId(row));
                  return (
                    <tr key={id} className={cx('border-b border-[var(--mui-divider)] hover:bg-[color-mix(in_srgb,var(--mui-primary)_5%,transparent)]', rowH)}>
                      {checkboxSelection && (
                        <td className="px-2">
                          <Checkbox
                            checked={selected.has(id)}
                            onChange={() => {
                              setSelected((prev) => {
                                const next = new Set(prev);
                                if (next.has(id)) next.delete(id);
                                else next.add(id);
                                return next;
                              });
                            }}
                          />
                        </td>
                      )}
                      {orderedCols.map((col) => (
                        <td
                          key={col.field}
                          className={cx(
                            'px-3',
                            pinned.includes(col.field) && 'sticky left-0 bg-[var(--mui-paper)]'
                          )}
                        >
                          {renderCell(col, row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {aggValue && (
        <div className="border-t border-[var(--mui-divider)] bg-[color-mix(in_srgb,var(--mui-text)_3%,var(--mui-paper))] px-3 py-2 text-xs">
          <Typography variant="caption" color="secondary">
            Aggregation · sum {aggValue.sum.toLocaleString()} · avg {aggValue.avg.toFixed(2)} · min{' '}
            {aggValue.min} · max {aggValue.max} · count {aggValue.count}
          </Typography>
        </div>
      )}

      {!grouped && (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--mui-divider)] px-3 py-2 text-sm">
          <select
            className="rounded-md border border-[var(--mui-divider)] bg-[var(--mui-paper)] px-2 py-1"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
          <span className="text-[var(--mui-text-secondary)]">
            {processed.length === 0 ? 0 : page * pageSize + 1}–
            {Math.min(processed.length, (page + 1) * pageSize)} of {processed.length}
          </span>
          <Button size="small" variant="text" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <Button
            size="small"
            variant="text"
            disabled={(page + 1) * pageSize >= processed.length}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </Paper>
  );
}

/** Pro subset — same grid without Excel/grouping defaults off unless enabled */
export function DataGridPro<T extends Record<string, unknown>>(
  props: Omit<DataGridPremiumProps<T>, 'excelExport' | 'rowGrouping' | 'aggregation'> & {
    excelExport?: boolean;
    rowGrouping?: boolean;
    aggregation?: boolean;
  }
) {
  return (
    <DataGridPremium
      {...props}
      excelExport={props.excelExport ?? false}
      rowGrouping={props.rowGrouping ?? false}
      aggregation={props.aggregation ?? false}
    />
  );
}

export function DataGrid<T extends Record<string, unknown>>(
  props: Omit<DataGridPremiumProps<T>, 'excelExport' | 'rowGrouping' | 'aggregation' | 'multiSort'>
) {
  return (
    <DataGridPremium
      {...props}
      multiSort={false}
      excelExport={false}
      rowGrouping={false}
      aggregation={false}
      disableColumnPinning
    />
  );
}
