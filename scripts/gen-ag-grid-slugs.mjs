import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slugs = fs
  .readFileSync(path.join(root, 'docs/ag-grid-react-slugs.txt'), 'utf8')
  .trim()
  .split(/\r?\n/)
  .filter(Boolean);

if (slugs.length !== 358) {
  throw new Error(`expected 358 slugs, got ${slugs.length}`);
}

const naExact = new Set(['videos', 'codemods', 'migration', 'upgrading-to-older-versions']);
const naPatterns = [/^upgrading-to-/, /^theming-v32-upgrading-to-/];

const donePatterns = [
  /^grouping/,
  /^aggregation/,
  /^pivoting/,
  /^filtering/,
  /^filter-text$/,
  /^filter-number$/,
  /^filter-date$/,
  /^filter-set$/,
  /^filter-quick$/,
  /^filter-api$/,
  /^filter-applying$/,
  /^filter-conditions$/,
  /^filter-set-api$/,
  /^filter-set-data-updates$/,
  /^filter-set-filter-list$/,
  /^filter-set-mini-filter$/,
  /^floating-filters$/,
  /^cell-editing$/,
  /^cell-editors$/,
  /^provided-cell-editors/,
  /^undo-redo-edits$/,
  /^integrated-charts/,
  /^excel-export/,
  /^server-side-model/,
  /^server-side-operations/,
  /^column-definitions$/,
  /^column-pinning$/,
  /^column-sizing$/,
  /^column-moving$/,
  /^column-menu$/,
  /^column-groups$/,
  /^column-headers$/,
  /^column-state$/,
  /^column-properties$/,
  /^column-interface$/,
  /^row-sorting$/,
  /^row-pagination$/,
  /^row-selection/,
  /^row-height$/,
  /^row-styles$/,
  /^row-dragging$/,
  /^row-pinning$/,
  /^data-update-transactions$/,
  /^data-update-row-data$/,
  /^data-update-single-row-cell$/,
  /^clipboard$/,
  /^csv-export$/,
  /^value-getters$/,
  /^value-formatters$/,
  /^value-parsers$/,
  /^value-setters$/,
  /^tree-data/,
  /^master-detail/,
  /^sparklines/,
  /^keyboard-navigation$/,
  /^dom-virtualisation$/,
  /^overlays/,
  /^context-menu$/,
  /^side-bar$/,
  /^tool-panel/,
  /^status-bar$/,
  /^formulas$/,
  /^formula-reference$/,
  /^formula-custom-functions$/,
  /^find$/,
  /^toolbar$/,
  /^tooltips$/,
  /^aligned-grids$/,
  /^viewport$/,
  /^notes$/,
  /^localisation$/,
  /^grid-state$/,
  /^grid-api$/,
  /^grid-options$/,
  /^grid-interface$/,
  /^grid-events$/,
  /^grid-lifecycle$/,
  /^infinite-scrolling$/,
  /^component-cell-renderer$/,
  /^components$/,
  /^cell-styles$/,
  /^cell-content$/,
  /^license-install$/,
  /^community-vs-enterprise$/,
  /^configuration$/,
  /^modules$/,
  /^row-models$/,
  /^getting-started$/,
  /^key-features$/,
];

const partialPatterns = [
  /^filter-advanced$/,
  /^filter-multi$/,
  /^filter-external$/,
  /^filter-bigint$/,
  /^filter-set-excel-mode$/,
  /^filter-set-tree-list$/,
  /^cell-selection/,
  /^row-spanning$/,
  /^column-spanning$/,
  /^row-dragging-/,
  /^excel-import$/,
  /^accessibility$/,
  /^rtl$/,
  /^touch$/,
  /^change-detection$/,
  /^change-cell-renderers$/,
  /^massive-row-count$/,
  /^scrolling-performance$/,
  /^security$/,
  /^reference-data$/,
  /^full-width-rows$/,
  /^row-ids$/,
  /^row-numbers$/,
  /^data-update-high-frequency$/,
  /^data-update$/,
  /^custom-icons$/,
  /^component-filter/,
  /^component-floating-filter/,
  /^component-loading-cell-renderer$/,
  /^component-menu-item$/,
  /^component-tool-panel$/,
  /^react-hooks$/,
  /^typescript-generics$/,
  /^drag-and-drop$/,
  /^cell-data-types$/,
  /^cell-text-selection$/,
  /^saving-content$/,
  /^view-refresh$/,
  /^deep-dive$/,
  /^cell-expressions$/,
  /^formula-editor-component$/,
  /^printing$/,
  /^theming/,
  /^themes$/,
  /^row-animation$/,
  /^row-events$/,
  /^column-events$/,
  /^row-interface$/,
  /^row-object$/,
  /^column-object/,
  /^accessing-data$/,
  /^grid-size$/,
  /^ai-toolkit$/,
  /^mcp-server$/,
  /^testing$/,
  /^supported-browsers$/,
  /^reference$/,
  /^compatibility$/,
  /^ag-grid-design-system$/,
  /^styling-tutorial$/,
  /^solidjs$/,
  /^cell-editing-batch$/,
  /^cell-editing-full-row$/,
  /^cell-editing-start-stop$/,
  /^cell-editing-validation$/,
  /^column-api$/,
  /^column-updating-definitions$/,
  /^column-headers-components$/,
  /^column-headers-styling$/,
  /^installation$/,
  /^value-cache$/,
  /^grouping-row-dragging$/,
  /^tree-data-row-dragging$/,
];

function classify(slug) {
  if (naExact.has(slug) || naPatterns.some((p) => p.test(slug))) return 'na';
  if (donePatterns.some((p) => p.test(slug))) return 'done';
  if (partialPatterns.some((p) => p.test(slug))) return 'partial';
  return 'todo';
}

const status = Object.fromEntries(slugs.map((s) => [s, classify(s)]));
const counts = { done: 0, partial: 0, todo: 0, na: 0 };
for (const v of Object.values(status)) counts[v]++;

const slugArray = slugs.map((s) => `  '${s}',`).join('\n');
const statusEntries = slugs.map((s) => `  '${s}': '${status[s]}',`).join('\n');

const out = `export type ParityStatus = 'done' | 'partial' | 'todo' | 'na';

export const AG_GRID_REACT_SLUGS: string[] = [
${slugArray}
];

export const PARITY_STATUS: Record<string, ParityStatus> = {
${statusEntries}
};
`;

const outPath = path.join(root, 'packages/apex-grid/src/parity/agGridSlugs.ts');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out);
console.log('Wrote', outPath, counts);
