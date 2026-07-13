import type { ColId, RowId } from '../types';

export interface StagedChange {
  rowId: RowId;
  colId: ColId;
  value: unknown;
}

export class BatchEditManager {
  private pending = new Map<string, StagedChange>();
  private active = false;

  startBatch(): void {
    this.active = true;
    this.pending.clear();
  }

  stageChange(rowId: RowId, colId: ColId, value: unknown): void {
    if (!this.active) this.startBatch();
    this.pending.set(`${rowId}::${colId}`, { rowId, colId, value });
  }

  commitAll(applyFn: (changes: StagedChange[]) => void): void {
    applyFn([...this.pending.values()]);
    this.pending.clear();
    this.active = false;
  }

  discardAll(): void {
    this.pending.clear();
    this.active = false;
  }

  getPendingCount(): number {
    return this.pending.size;
  }

  getPendingChanges(): StagedChange[] {
    return [...this.pending.values()];
  }

  isActive(): boolean {
    return this.active;
  }
}
