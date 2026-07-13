/** Evaluate AG-style cell expressions with `data.field` access and simple math. */
export function evaluateExpression(expr: string, data: Record<string, unknown>): unknown {
  const trimmed = expr.trim();
  if (!trimmed) return null;

  let code = trimmed;
  if (code.startsWith('=')) code = code.slice(1);

  try {
    // eslint-disable-next-line no-new-func
    return Function('data', `"use strict"; return (${code});`)(data);
  } catch {
    return null;
  }
}
