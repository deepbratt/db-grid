import type { ColumnDef } from '../types';
import { formatCellValue, getCellValue, resolveColId } from '../utils/dataOps';

export function exportCsv<T>(
  rows: T[],
  columns: ColumnDef<T>[],
  opts?: { fileName?: string }
): void {
  const visible = columns.filter((c) => !c.hide);
  const headers = visible.map((c, i) => c.headerName ?? resolveColId(c, i));
  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) =>
      visible
        .map((col, i) => {
          const node = {
            id: i,
            data: row,
            level: 0,
            group: false,
            expanded: false,
            parent: null,
          };
          const value = getCellValue(row, col, node as any, null);
          return escapeCsv(formatCellValue(value, row, col, node as any, null));
        })
        .join(',')
    ),
  ];
  downloadBlob(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }), opts?.fileName ?? 'db-grid-export.csv');
}

function escapeCsv(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/** Minimal XLSX (SpreadsheetML) export — opens in Excel without extra deps */
export async function exportExcel<T>(
  rows: T[],
  columns: ColumnDef<T>[],
  opts?: { fileName?: string; sheetName?: string }
): Promise<void> {
  const visible = columns.filter((c) => !c.hide);
  const sheet = opts?.sheetName ?? 'Sheet1';
  const headerCells = visible
    .map((c, i) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(c.headerName ?? resolveColId(c, i))}</Data></Cell>`)
    .join('');

  const body = rows
    .map((row) => {
      const cells = visible
        .map((col, i) => {
          const node = {
            id: i,
            data: row,
            level: 0,
            group: false,
            expanded: false,
            parent: null,
          };
          const value = getCellValue(row, col, node as any, null);
          const formatted = formatCellValue(value, row, col, node as any, null);
          const isNum = typeof value === 'number' && !Number.isNaN(value);
          return `<Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${xmlEscape(isNum ? String(value) : formatted)}</Data></Cell>`;
        })
        .join('');
      return `<Row>${cells}</Row>`;
    })
    .join('');

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#1B3A4B" ss:Pattern="Solid"/><Font ss:Color="#FFFFFF"/></Style>
 </Styles>
 <Worksheet ss:Name="${xmlEscape(sheet)}">
  <Table>
   <Row>${headerCells}</Row>
   ${body}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadBlob(
    new Blob([xml], { type: 'application/vnd.ms-excel' }),
    opts?.fileName ?? 'db-grid-export.xls'
  );
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
