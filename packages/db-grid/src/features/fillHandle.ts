export function fillSeries(values: any[], targetCount: number): any[] {
  if (targetCount <= 0) return [];
  if (values.length === 0) return Array(targetCount).fill(null);
  if (values.length >= targetCount) return values.slice(0, targetCount);

  const out = [...values];
  const nums = values.filter((v) => typeof v === 'number' && !Number.isNaN(v)) as number[];

  if (nums.length >= 2 && nums.length === values.length) {
    const step = nums[nums.length - 1] - nums[nums.length - 2];
    let last = nums[nums.length - 1];
    while (out.length < targetCount) {
      last += step;
      out.push(last);
    }
    return out;
  }

  const last = values[values.length - 1];
  while (out.length < targetCount) out.push(last);
  return out;
}
