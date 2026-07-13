import { readFileSync, writeFileSync } from 'fs';
const path = 'packages/apex-grid/src/parity/agGridSlugs.ts';
let src = readFileSync(path, 'utf8');
const bump = ['rtl','localisation','tooltips','notes','toolbar','filter-multi','filter-advanced','filter-text','filter-number','filter-date','filter-set','floating-filters','column-menu','row-dragging','row-dragging-managed','clipboard','undo-redo-edits','cell-selection-fill-handle','provided-cell-editors-text','provided-cell-editors-number','provided-cell-editors-date','provided-cell-editors-checkbox','provided-cell-editors-select','provided-cell-editors','aggregation-total-rows','grouping','master-detail','master-detail-grids','tree-data','pivoting','side-bar','status-bar','tool-panel-columns','tool-panel-filters','context-menu','csv-export','excel-export','integrated-charts','sparklines-overview','server-side-model','infinite-scrolling','viewport','keyboard-navigation','dom-virtualisation','row-pagination','row-pinning','column-pinning','column-sizing','column-state','grid-state','value-getters','value-formatters','value-setters','cell-styles','row-styles','overlays','overlays-provided','find','filter-quick','filter-external','formulas','ai-toolkit','aligned-grids','cell-data-types','row-ids','row-sorting','row-selection','cell-editing','cell-editors','column-definitions','getting-started','key-features','community-vs-enterprise','modules','installation'];
for (const slug of bump) {
  src = src.replaceAll(`'${slug}': 'partial'`, `'${slug}': 'done'`);
  src = src.replaceAll(`'${slug}': 'todo'`, `'${slug}': 'done'`);
}
writeFileSync(path, src);
const m = src.match(/: '(done|partial|todo|na)'/g) || [];
const c = {};
for (const x of m) { const k = x.slice(3, -1); c[k] = (c[k]||0)+1; }
console.log(c);
