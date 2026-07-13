const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape HTML special characters for safe cell rendering. */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => HTML_ESCAPE[ch] ?? ch);
}
