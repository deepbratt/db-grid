export type AggFunc = (values: any[]) => any;

const defaultAggFuncs: Record<string, AggFunc> = {
  sum: (values) => {
    const nums = values.filter((v) => v != null && !Number.isNaN(Number(v))).map(Number);
    return nums.reduce((a, b) => a + b, 0);
  },
  avg: (values) => {
    const nums = values.filter((v) => v != null && !Number.isNaN(Number(v))).map(Number);
    return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  },
  min: (values) => {
    const nums = values.filter((v) => v != null && !Number.isNaN(Number(v))).map(Number);
    return nums.length ? Math.min(...nums) : null;
  },
  max: (values) => {
    const nums = values.filter((v) => v != null && !Number.isNaN(Number(v))).map(Number);
    return nums.length ? Math.max(...nums) : null;
  },
  count: (values) => values.filter((v) => v != null && v !== '').length,
  first: (values) => values[0] ?? null,
  last: (values) => values[values.length - 1] ?? null,
};

const registry = { ...defaultAggFuncs };

export function registerAggFunc(name: string, fn: AggFunc): void {
  registry[name] = fn;
}

export function getAggFunc(name: string): AggFunc | undefined {
  return registry[name];
}

export { defaultAggFuncs, registry as aggFuncRegistry };
