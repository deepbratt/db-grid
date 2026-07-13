import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

/** GitHub Pages project site needs `/repo-name/`; user/org site uses `/`. */
function resolveBase(mode: string): string {
  const env = loadEnv(mode, process.cwd(), '');
  const raw = env.VITE_BASE || process.env.VITE_BASE || '/';
  if (raw === './' || raw === '.') return './';
  return raw.endsWith('/') ? raw : `${raw}/`;
}

export default defineConfig(({ mode }) => {
  const base = resolveBase(mode);
  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@deepbratt55/db-grid/styles.css': path.resolve(
          __dirname,
          '../../packages/db-grid/src/styles/db-grid.css'
        ),
        '@deepbratt55/db-grid': path.resolve(__dirname, '../../packages/db-grid/src'),
        '@db-grid/ui': path.resolve(__dirname, '../../packages/db-ui/src'),
        '@db-grid/full/styles.css': path.resolve(__dirname, '../../packages/db-full/src/styles.css'),
        '@db-grid/full': path.resolve(__dirname, '../../packages/db-full/src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
    },
    server: {
      port: 5173,
      proxy: {
        '/api': 'http://localhost:4000',
        '/ws': { target: 'ws://localhost:4000', ws: true },
      },
    },
  };
});
