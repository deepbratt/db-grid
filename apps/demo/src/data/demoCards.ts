export type DemoCard = {
  id: string;
  title: string;
  blurb: string;
  to: string;
  tag: string;
};

/** Use-case + feature demos shown on home & /demos */
export const DEMO_CARDS: DemoCard[] = [
  {
    id: 'trading',
    title: 'Trading',
    blurb: 'Live blotter — streaming prices, P&L, sparklines, action toolbar.',
    to: '/demos/trading',
    tag: 'Live',
  },
  {
    id: 'finance',
    title: 'Finance',
    blurb: 'Portfolio marks, formula notional, winners filter, Excel export.',
    to: '/demos/finance',
    tag: 'Live',
  },
  {
    id: 'live',
    title: 'Kitchen sink',
    blurb: 'Every grid capability in one place.',
    to: '/demos/live',
    tag: 'All',
  },
  {
    id: 'excel',
    title: 'Excel-like',
    blurb: 'Formulas, clipboard, fill handle, formula bar.',
    to: '/db-grid/formulas',
    tag: 'Excel',
  },
  {
    id: 'inventory',
    title: 'Inventory',
    blurb: 'Editable stock, filters, Excel export.',
    to: '/demos/inventory',
    tag: 'Use case',
  },
  {
    id: 'hr',
    title: 'HR / tree data',
    blurb: 'Org chart with tree data.',
    to: '/demos/hr',
    tag: 'Use case',
  },
  {
    id: 'ssrm',
    title: 'Server-side',
    blurb: 'SSRM with PostgreSQL.',
    to: '/demos/ssrm',
    tag: 'Enterprise',
  },
  {
    id: 'grouping',
    title: 'Grouping & pivot',
    blurb: 'Row groups, aggregations, pivot.',
    to: '/db-grid/row-grouping',
    tag: 'Enterprise',
  },
  {
    id: 'features',
    title: 'Feature catalog',
    blurb: 'Every grid capability, documented.',
    to: '/material-ui/all-components',
    tag: 'Docs',
  },
  {
    id: 'theme',
    title: 'Theme builder',
    blurb: 'Live theme on a real grid.',
    to: '/theme-builder',
    tag: 'Style',
  },
];
