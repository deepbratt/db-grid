export interface InfiniteBlock<T> {
  start: number;
  end: number;
  data: T[];
  loadedAt: number;
}

export class InfiniteCache<T> {
  private blocks = new Map<string, InfiniteBlock<T>>();

  private key(start: number, end: number): string {
    return `${start}:${end}`;
  }

  getBlock(start: number, end: number): InfiniteBlock<T> | undefined {
    return this.blocks.get(this.key(start, end));
  }

  setBlock(start: number, end: number, data: T[]): InfiniteBlock<T> {
    const block: InfiniteBlock<T> = {
      start,
      end,
      data: [...data],
      loadedAt: Date.now(),
    };
    this.blocks.set(this.key(start, end), block);
    return block;
  }

  clear(): void {
    this.blocks.clear();
  }

  hasBlock(start: number, end: number): boolean {
    return this.blocks.has(this.key(start, end));
  }

  getLoadedRanges(): Array<{ start: number; end: number }> {
    return [...this.blocks.values()].map((b) => ({ start: b.start, end: b.end }));
  }

  invalidateFrom(rowIndex: number): void {
    for (const [key, block] of this.blocks) {
      if (block.end > rowIndex) this.blocks.delete(key);
    }
  }
}
