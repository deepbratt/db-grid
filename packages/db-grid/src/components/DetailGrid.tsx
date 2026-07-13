export interface DetailColumnDef {
  field: string;
  headerName?: string;
}

export interface DetailGridProps {
  rowData: any[];
  columnDefs: DetailColumnDef[];
}

export function DetailGrid({ rowData, columnDefs }: DetailGridProps) {
  return (
    <div
      className="agx-detail-grid"
      style={{
        margin: '8px 16px',
        border: '1px solid var(--agx-line, #ddd)',
        borderRadius: 4,
        overflow: 'auto',
        background: 'var(--agx-surface, #fff)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--agx-header, #1b3a4b)', color: 'var(--agx-header-ink, #fff)' }}>
            {columnDefs.map((col) => (
              <th
                key={col.field}
                style={{
                  textAlign: 'left',
                  padding: '6px 10px',
                  borderBottom: '1px solid var(--agx-line, #ddd)',
                  fontWeight: 600,
                }}
              >
                {col.headerName ?? col.field}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowData.length === 0 ? (
            <tr>
              <td
                colSpan={columnDefs.length}
                style={{ padding: 12, color: 'var(--agx-muted, #666)', textAlign: 'center' }}
              >
                No detail rows
              </td>
            </tr>
          ) : (
            rowData.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  background: ri % 2 ? 'var(--agx-row-alt, #f5f5f5)' : 'transparent',
                }}
              >
                {columnDefs.map((col) => (
                  <td
                    key={col.field}
                    style={{
                      padding: '6px 10px',
                      borderBottom: '1px solid var(--agx-line, #eee)',
                    }}
                  >
                    {row?.[col.field] == null ? '' : String(row[col.field])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
