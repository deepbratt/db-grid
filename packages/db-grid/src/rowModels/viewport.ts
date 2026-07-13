export class ViewportRowModel<T> {
  private rows: T[] = [];
  private rowCount = 0;

  setRowCount(count: number): void {
    this.rowCount = Math.max(0, count);
  }

  getRowCount(): number {
    return this.rowCount;
  }

  getRows(first: number, last: number): T[] {
    const start = Math.max(0, first);
    const end = Math.min(this.rows.length, last + 1);
    if (start >= end) return [];
    return this.rows.slice(start, end);
  }

  setRows(rows: T[]): void {
    this.rows = [...rows];
    if (this.rowCount < this.rows.length) {
      this.rowCount = this.rows.length;
    }
  }

  clear(): void {
    this.rows = [];
    this.rowCount = 0;
  }
}
