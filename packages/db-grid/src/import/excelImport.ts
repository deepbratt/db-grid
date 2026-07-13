function splitDelimitedLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && ch === delimiter) {
      cells.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return tabs >= commas ? '\t' : ',';
}

/** Parse TSV or CSV text into a 2D string array. */
export function parseTsvOrCsv(text: string): string[][] {
  if (!text) return [];
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(normalized);
  return lines.map((line) => splitDelimitedLine(line, delimiter));
}

/** Read a dropped or selected file as parsed rows. */
export function parseDroppedFile(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      resolve(parseTsvOrCsv(text));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
