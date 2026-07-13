export type LocaleText = Record<string, string>;

export const EN_US: LocaleText = {
  page: 'Page',
  more: 'More',
  to: 'to',
  of: 'of',
  next: 'Next',
  previous: 'Previous',
  loadingOoo: 'Loading…',
  noRowsToShow: 'No Rows To Show',
  filterOoo: 'Filter…',
  equals: 'Equals',
  notEqual: 'Not equal',
  contains: 'Contains',
  notContains: 'Not contains',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  blanks: 'Blanks',
  notBlank: 'Not blank',
  applyFilter: 'Apply',
  clearFilter: 'Clear',
  resetFilter: 'Reset',
  pinColumn: 'Pin Column',
  pinLeft: 'Pin Left',
  pinRight: 'Pin Right',
  noPin: 'No Pin',
  autosizeThiscolumn: 'Autosize This Column',
  autosizeAllColumns: 'Autosize All Columns',
  groupBy: 'Group by',
  ungroupBy: 'Ungroup by',
  copy: 'Copy',
  copyWithHeaders: 'Copy with Headers',
  paste: 'Paste',
  export: 'Export',
  csvExport: 'CSV Export',
  excelExport: 'Excel Export',
  chartRange: 'Chart Range',
  pivotChart: 'Pivot Chart',
  sum: 'Sum',
  min: 'Min',
  max: 'Max',
  avg: 'Avg',
  count: 'Count',
  first: 'First',
  last: 'Last',
  searchOoo: 'Search…',
  selectAll: 'Select All',
  selectAllSearchResults: 'Select All Search Results',
};

/** Default locale strings for toolbar buttons, overlays, and pagination labels. */
export const DEFAULT_LOCALE_TEXT: LocaleText = {
  ...EN_US,
  previous: 'Prev',
  csvExportLabel: 'CSV',
  excelExportLabel: 'Excel',
  chartLabel: 'Chart',
  expandAllLabel: 'Expand All',
  collapseAllLabel: 'Collapse All',
  addNote: 'Add note',
  editNote: 'Edit note',
  removeNote: 'Remove note',
  totalLabel: 'Total',
  grandTotalLabel: 'Grand Total',
  columnsLabel: 'Columns',
  filtersLabel: 'Filters',
  pivotLabel: 'Pivot',
  quickFilterPlaceholder: 'Quick filter…',
  findPlaceholder: 'Find…',
  rowsLabel: 'Rows',
  selectedLabel: 'Selected',
  filteredLabel: 'Filtered',
  allDataLabel: 'All data',
};

export type LocaleKey = keyof typeof DEFAULT_LOCALE_TEXT;

export function translate(
  locale: LocaleText | undefined,
  key: string,
  defaultText?: string
): string {
  if (locale && key in locale) {
    return locale[key];
  }
  if (defaultText !== undefined) {
    return defaultText;
  }
  if (key in DEFAULT_LOCALE_TEXT) {
    return DEFAULT_LOCALE_TEXT[key];
  }
  if (key in EN_US) {
    return EN_US[key];
  }
  return key;
}

/** Builds a translate() helper that prefers user-supplied localeText, falling back to English defaults. */
export function createTranslate(localeText?: LocaleText) {
  return (key: string, fallback?: string): string => translate(localeText, key, fallback);
}

export type Translate = ReturnType<typeof createTranslate>;
