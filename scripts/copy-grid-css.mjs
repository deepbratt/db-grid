import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'packages/db-grid/src/styles/db-grid.css');
const destDir = join(root, 'packages/db-grid/dist/styles');
const dest = join(destDir, 'db-grid.css');

if (!existsSync(src)) {
  console.error('Missing', src);
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log('Copied styles → packages/db-grid/dist/styles/db-grid.css');
