export type CatalogBadge = 'Community' | 'Enterprise' | 'Excel' | 'New' | null;

export type CatalogItem = {
  slug: string;
  title: string;
  badge?: CatalogBadge;
  href: string;
  blurb?: string;
};

export type CatalogSection = {
  id: string;
  title: string;
  items: CatalogItem[];
};

/**
 * Grid-only catalog — Excel-like spreadsheet behavior + AG Grid feature surface.
 * No Material UI kit components.
 */
export const MUI_NAV_SECTIONS: CatalogSection[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    items: [
      {
        slug: 'installation',
        title: 'Installation',
        href: '/db-grid/installation',
        blurb: 'npm i @deepbratt55/db-grid — one package for the grid.',
      },
      {
        slug: 'db-grid',
        title: 'DbGrid overview',
        badge: 'Enterprise',
        href: '/db-grid/db-grid',
        blurb: 'Excel-like React data grid with AG Grid–class features.',
      },
      {
        slug: 'kitchen-sink',
        title: 'Kitchen sink demo',
        badge: 'New',
        href: '/demos/live',
        blurb: 'Every major grid feature enabled in one view.',
      },
    ],
  },
  {
    id: 'excel',
    title: 'Excel-like',
    items: [
      {
        slug: 'formulas',
        title: 'Formulas & formula bar',
        badge: 'Excel',
        href: '/db-grid/formulas',
        blurb: 'Cell formulas with formula bar (Excel-style).',
      },
      {
        slug: 'clipboard',
        title: 'Clipboard copy / paste',
        badge: 'Excel',
        href: '/db-grid/clipboard',
        blurb: 'Ctrl+C / Ctrl+V ranges like a spreadsheet.',
      },
      {
        slug: 'fill-handle',
        title: 'Fill handle',
        badge: 'Excel',
        href: '/db-grid/fill-handle',
        blurb: 'Drag-fill series across cells.',
      },
      {
        slug: 'cell-editing',
        title: 'Cell editing',
        badge: 'Excel',
        href: '/db-grid/cell-editing',
        blurb: 'In-cell editors, batch edit, undo/redo.',
      },
      {
        slug: 'excel-export',
        title: 'Excel import / export',
        badge: 'Excel',
        href: '/db-grid/excel-export',
        blurb: 'XLSX/CSV export and file drop import.',
      },
      {
        slug: 'range-selection',
        title: 'Range selection',
        badge: 'Excel',
        href: '/db-grid/range-selection',
        blurb: 'Multi-cell ranges, range handle, keyboard nav.',
      },
    ],
  },
  {
    id: 'columns',
    title: 'Columns',
    items: [
      { slug: 'column-definitions', title: 'Column definitions', href: '/db-grid/column-definitions' },
      { slug: 'column-pinning', title: 'Column pinning', href: '/db-grid/column-pinning' },
      { slug: 'column-sizing', title: 'Column sizing & flex', href: '/db-grid/column-sizing' },
      { slug: 'column-moving', title: 'Column moving', href: '/db-grid/column-moving' },
      { slug: 'column-state', title: 'Column state', href: '/db-grid/column-state' },
      { slug: 'tool-panels', title: 'Columns tool panel', badge: 'Enterprise', href: '/db-grid/tool-panels' },
    ],
  },
  {
    id: 'rows',
    title: 'Rows',
    items: [
      { slug: 'sorting', title: 'Sorting', href: '/db-grid/sorting' },
      { slug: 'pagination', title: 'Pagination', href: '/db-grid/pagination' },
      { slug: 'row-pinning', title: 'Row pinning', href: '/db-grid/row-pinning' },
      { slug: 'row-dragging', title: 'Row dragging', href: '/db-grid/row-dragging' },
      { slug: 'row-selection', title: 'Row selection', href: '/db-grid/row-selection' },
      { slug: 'virtualization', title: 'Virtualization', href: '/db-grid/virtualization' },
    ],
  },
  {
    id: 'filtering',
    title: 'Filtering',
    items: [
      { slug: 'filtering', title: 'Filters overview', href: '/db-grid/filtering' },
      { slug: 'floating-filters', title: 'Floating filters', href: '/db-grid/floating-filters' },
      { slug: 'set-filter', title: 'Set filter', badge: 'Enterprise', href: '/db-grid/set-filter' },
      { slug: 'advanced-filter', title: 'Advanced filter', badge: 'Enterprise', href: '/db-grid/advanced-filter' },
      { slug: 'quick-filter', title: 'Quick filter', href: '/db-grid/quick-filter' },
    ],
  },
  {
    id: 'enterprise-data',
    title: 'Grouping & data',
    items: [
      { slug: 'row-grouping', title: 'Row grouping', badge: 'Enterprise', href: '/db-grid/row-grouping' },
      { slug: 'aggregation', title: 'Aggregations', badge: 'Enterprise', href: '/db-grid/aggregation' },
      { slug: 'pivot', title: 'Pivot mode', badge: 'Enterprise', href: '/db-grid/pivot' },
      { slug: 'tree-data', title: 'Tree data', badge: 'Enterprise', href: '/db-grid/tree-data' },
      { slug: 'master-detail', title: 'Master / detail', badge: 'Enterprise', href: '/db-grid/master-detail' },
      { slug: 'ssrm', title: 'Server-side row model', badge: 'Enterprise', href: '/demos/ssrm' },
    ],
  },
  {
    id: 'presentation',
    title: 'Cell presentation',
    items: [
      {
        slug: 'sparklines',
        title: 'Sparklines',
        badge: 'Enterprise',
        href: '/db-grid/sparklines',
        blurb: 'Inline SVG sparklines in cells.',
      },
    ],
  },
  {
    id: 'styling',
    title: 'Styling & themes',
    items: [
      { slug: 'theming', title: 'Themes', href: '/theme-builder' },
      { slug: 'custom-theme', title: 'Custom theme API', href: '/db-grid/custom-theme' },
    ],
  },
];

export function findCatalogItem(slug: string): CatalogItem | undefined {
  for (const section of MUI_NAV_SECTIONS) {
    const hit = section.items.find((i) => i.slug === slug);
    if (hit) return hit;
  }
  return undefined;
}

export function findCatalogSection(slug: string): CatalogSection | undefined {
  return MUI_NAV_SECTIONS.find((s) => s.items.some((i) => i.slug === slug) || s.id === slug);
}
