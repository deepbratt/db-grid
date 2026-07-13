export class ValueCache {
  private store = new Map<string, unknown>();
  private enabled = true;

  get(key: string): unknown {
    if (!this.enabled) return undefined;
    return this.store.get(key);
  }

  set(key: string, value: unknown): void {
    if (!this.enabled) return;
    this.store.set(key, value);
  }

  clear(): void {
    this.store.clear();
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
