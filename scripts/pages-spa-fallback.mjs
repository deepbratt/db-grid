import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = join(root, 'apps/demo/dist/index.html');
const notFoundHtml = join(root, 'apps/demo/dist/404.html');

if (!existsSync(indexHtml)) {
  console.error('Missing apps/demo/dist/index.html — run the demo build first.');
  process.exit(1);
}

copyFileSync(indexHtml, notFoundHtml);
console.log('Wrote apps/demo/dist/404.html (GitHub Pages SPA fallback)');
