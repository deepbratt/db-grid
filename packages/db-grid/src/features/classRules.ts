export function resolveClassRules(
  rules: Record<string, (p: any) => boolean> | undefined,
  params: any
): string {
  if (!rules) return '';
  const classes: string[] = [];
  for (const [className, predicate] of Object.entries(rules)) {
    try {
      if (predicate(params)) classes.push(className);
    } catch {
      // ignore rule errors
    }
  }
  return classes.join(' ');
}
