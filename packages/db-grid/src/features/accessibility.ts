import type { SortDirection } from '../types';

const LIVE_REGION_ID = 'agx-live-region';

function getLiveRegion(): HTMLElement {
  if (typeof document === 'undefined') {
    return { textContent: '' } as HTMLElement;
  }

  let region = document.getElementById(LIVE_REGION_ID);
  if (!region) {
    region = document.createElement('div');
    region.id = LIVE_REGION_ID;
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    Object.assign(region.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    });
    document.body.appendChild(region);
  }
  return region;
}

/** Announce a message to screen readers via a polite live region. */
export function announce(message: string): void {
  if (!message || typeof document === 'undefined') return;
  const region = getLiveRegion();
  region.textContent = '';
  window.requestAnimationFrame(() => {
    region.textContent = message;
  });
}

/** Map grid sort direction to the aria-sort attribute value. */
export function getAriaSort(sort: SortDirection): 'none' | 'ascending' | 'descending' {
  if (sort === 'asc') return 'ascending';
  if (sort === 'desc') return 'descending';
  return 'none';
}

export interface GridAriaProps {
  rowCount?: number;
  colCount?: number;
  label?: string;
  multiselectable?: boolean;
  activeDescendantId?: string;
}

/** Apply baseline ARIA attributes expected on the grid root element. */
export function ensureGridAria(el: HTMLElement, props: GridAriaProps = {}): void {
  const {
    rowCount,
    colCount,
    label = 'Data grid',
    multiselectable = false,
    activeDescendantId,
  } = props;

  el.setAttribute('role', 'grid');
  el.setAttribute('aria-label', label);
  el.setAttribute('aria-rowcount', String(rowCount ?? -1));
  el.setAttribute('aria-colcount', String(colCount ?? -1));

  if (multiselectable) {
    el.setAttribute('aria-multiselectable', 'true');
  } else {
    el.removeAttribute('aria-multiselectable');
  }

  if (activeDescendantId) {
    el.setAttribute('aria-activedescendant', activeDescendantId);
  } else {
    el.removeAttribute('aria-activedescendant');
  }
}
