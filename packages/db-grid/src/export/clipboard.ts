/** Parse tab-separated clipboard text into a 2D string array (Excel-style). */
export function parseClipboardTsv(text: string): string[][] {
  if (!text) return [];
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  return lines.map((line) => line.split('\t'));
}

/** Format a 2D string array as tab-separated values for clipboard export. */
export function formatRangeAsTsv(rows: string[][]): string {
  return rows.map((row) => row.join('\t')).join('\n');
}
