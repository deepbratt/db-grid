export interface ExportExcelAdvancedOptions {
  fileName?: string;
  sheetName?: string;
  freezeHeader?: boolean;
  title?: string;
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

const STYLES_XML = `
 <Styles>
  <Style ss:ID="Default">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10"/>
  </Style>
  <Style ss:ID="Title">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:Bold="1" ss:Size="14"/>
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
 </Styles>`;

function buildFreezeOptions(freezeRowIndex: number): string {
  if (freezeRowIndex <= 0) return '';
  return `<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <Selected/>
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>${freezeRowIndex}</SplitHorizontal>
   <TopRowBottomPane>${freezeRowIndex}</TopRowBottomPane>
   <ActivePane>2</ActivePane>
   <ProtectObjects>False</ProtectObjects>
   <ProtectScenarios>False</ProtectScenarios>
  </WorksheetOptions>`;
}

/** SpreadsheetML export with optional title row and frozen header pane. */
export async function exportExcelAdvanced(
  rows: string[][],
  opts: ExportExcelAdvancedOptions = {}
): Promise<void> {
  const sheet = opts.sheetName ?? 'Sheet1';
  const fileName = opts.fileName ?? 'db-grid-export.xls';
  const colCount = rows.reduce((max, row) => Math.max(max, row.length), 0);

  const xmlRows: string[] = [];
  let dataHeaderRowIndex = 0;

  if (opts.title) {
    const mergeAcross = Math.max(0, colCount - 1);
    const mergeAttr = mergeAcross > 0 ? ` ss:MergeAcross="${mergeAcross}"` : '';
    xmlRows.push(
      `<Row ss:StyleID="Title"><Cell ss:StyleID="Title"${mergeAttr}><Data ss:Type="String">${xmlEscape(opts.title)}</Data></Cell></Row>`
    );
    dataHeaderRowIndex = 1;
  }

  rows.forEach((rowCells, rowIndex) => {
    const isHeader = rowIndex === 0;
    const absoluteRow = rowIndex + (opts.title ? 1 : 0);
    const rowStyle = !isHeader && absoluteRow % 2 === 0 ? 'RowEven' : undefined;
    const cells = rowCells
      .map((raw) => {
        const value = raw ?? '';
        const type = inferType(value);
        const styleId = isHeader ? 'Header' : type === 'Number' ? 'Number' : rowStyle;
        return cellXml(value, type, styleId);
      })
      .join('');
    xmlRows.push(`<Row ss:StyleID="${isHeader ? 'Header' : 'Default'}">${cells}</Row>`);
  });

  const freezeRowIndex =
    opts.freezeHeader !== false ? dataHeaderRowIndex + 1 : 0;

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
   ${xmlRows.join('')}
  </Table>
  ${buildFreezeOptions(freezeRowIndex)}
 </Worksheet>
</Workbook>`;

  downloadBlob(new Blob([xml], { type: 'application/vnd.ms-excel' }), fileName);
}
