import type { ColumnDef } from '../types';
import { formatCellValue, getCellValue, resolveColId } from '../utils/dataOps';

export interface ExcelXlsxColumn<T = any> {
  field?: string;
  headerName?: string;
  colDef?: ColumnDef<T>;
}

export interface ExportExcelXlsxOptions<T = any> {
  fileName?: string;
  sheetName?: string;
  /** Pre-formatted rows: first row may be headers if includeHeaders is false */
  formattedRows?: string[][];
  includeHeaders?: boolean;
  columns?: ColumnDef<T>[] | ExcelXlsxColumn<T>[];
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function cellXml(value: string, type: 'String' | 'Number', styleId?: string): string {
  const style = styleId ? ` ss:StyleID="${styleId}"` : '';
  return `<Cell${style}><Data ss:Type="${type}">${xmlEscape(value)}</Data></Cell>`;
}

function inferType(value: string): 'String' | 'Number' {
  if (value !== '' && !Number.isNaN(Number(value)) && /^-?\d+(\.\d+)?$/.test(value.trim())) {
    return 'Number';
  }
  return 'String';
}

function buildRowsFromData<T>(
  rows: T[],
  columns: ColumnDef<T>[],
  includeHeaders: boolean
): string[][] {
  const visible = columns.filter((c) => !c.hide);
  const out: string[][] = [];

  if (includeHeaders) {
    out.push(visible.map((c, i) => c.headerName ?? resolveColId(c, i)));
  }

  for (const row of rows) {
    out.push(
      visible.map((col, i) => {
        const node = {
          id: i,
          data: row,
          level: 0,
          group: false,
          expanded: false,
          parent: null,
        };
        const value = getCellValue(row, col, node as any, null);
        return formatCellValue(value, row, col, node as any, null);
      })
    );
  }

  return out;
}

const STYLES_XML = `
 <Styles>
  <Style ss:ID="Default">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="10"/>
   <Interior ss:Color="#1B3A4B" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F2430"/>
   </Borders>
  </Style>
  <Style ss:ID="RowEven">
   <Interior ss:Color="#F0EBE3" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Number">
   <NumberFormat ss:Format="General"/>
   <Alignment ss:Horizontal="Right"/>
  </Style>
  <Style ss:ID="Date">
   <NumberFormat ss:Format="yyyy-mm-dd"/>
  </Style>
 </Styles>`;

/** SpreadsheetML export with styled headers, zebra rows, and typed cells (.xls compatible XML) */
export async function exportExcelXlsx<T = any>(
  rows: T[] | string[][],
  columns?: ColumnDef<T>[] | ExcelXlsxColumn<T>[],
  opts: ExportExcelXlsxOptions<T> = {}
): Promise<void> {
  const sheet = opts.sheetName ?? 'Sheet1';
  const fileName = opts.fileName ?? 'db-grid-export.xls';

  let matrix: string[][];

  if (opts.formattedRows) {
    matrix = opts.formattedRows;
  } else if (Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0])) {
    matrix = rows as string[][];
  } else if (columns && columns.length > 0) {
    const colDefs = columns.map((c) =>
      'colDef' in c && c.colDef ? c.colDef : (c as ColumnDef<T>)
    );
    matrix = buildRowsFromData(rows as T[], colDefs, opts.includeHeaders !== false);
  } else {
    matrix = [];
  }

  const body = matrix
    .map((rowCells, rowIndex) => {
      const isHeader = rowIndex === 0 && opts.includeHeaders !== false;
      const rowStyle = !isHeader && rowIndex % 2 === 0 ? 'RowEven' : undefined;
      const cells = rowCells
        .map((raw) => {
          const value = raw ?? '';
          const type = inferType(value);
          const styleId = isHeader ? 'Header' : type === 'Number' ? 'Number' : rowStyle;
          return cellXml(value, type, styleId);
        })
        .join('');
      return `<Row ss:StyleID="${isHeader ? 'Header' : 'Default'}">${cells}</Row>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
 <Author>db-grid</Author>
 <Created>${new Date().toISOString()}</Created>
</DocumentProperties>
${STYLES_XML}
 <Worksheet ss:Name="${xmlEscape(sheet)}">
  <Table ss:DefaultColumnWidth="88" ss:DefaultRowHeight="18">
   ${body}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <Selected/>
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>1</SplitHorizontal>
   <TopRowBottomPane>1</TopRowBottomPane>
   <ActivePane>2</ActivePane>
   <ProtectObjects>False</ProtectObjects>
   <ProtectScenarios>False</ProtectScenarios>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;

  downloadBlob(new Blob([xml], { type: 'application/vnd.ms-excel' }), fileName);
}

export { getCellValue, formatCellValue } from '../utils/dataOps';
