const PRINT_CLASS = 'agx-print';
const PRINT_PREP_CLASS = 'agx-print-prep';

interface PrintSnapshot {
  element: HTMLElement;
  style: string;
  className: string;
}

/**
 * Prepare a grid root for printing by expanding rows and disabling virtualization
 * constraints. Returns a cleanup function that restores the previous layout.
 */
export function preparePrintLayout(root: HTMLElement): () => void {
  const snapshots: PrintSnapshot[] = [];
  const touched: HTMLElement[] = [];

  const capture = (el: HTMLElement) => {
    snapshots.push({
      element: el,
      style: el.getAttribute('style') ?? '',
      className: el.className,
    });
    touched.push(el);
  };

  capture(root);
  root.classList.add(PRINT_CLASS, PRINT_PREP_CLASS);

  const viewport = root.querySelector<HTMLElement>('.agx-viewport');
  if (viewport) {
    capture(viewport);
    viewport.style.overflow = 'visible';
    viewport.style.height = 'auto';
    viewport.style.maxHeight = 'none';
  }

  const spacers = root.querySelectorAll<HTMLElement>('.agx-spacer');
  spacers.forEach((spacer) => {
    capture(spacer);
    spacer.style.height = 'auto';
    spacer.style.minHeight = '0';
  });

  const rowContainers = root.querySelectorAll<HTMLElement>('.agx-rows');
  rowContainers.forEach((rows) => {
    capture(rows);
    rows.style.transform = 'none';
    rows.style.position = 'static';
    rows.style.willChange = 'auto';
  });

  const pinnedSections = root.querySelectorAll<HTMLElement>('.agx-pinned-top, .agx-pinned-bottom');
  pinnedSections.forEach((section) => {
    capture(section);
    section.style.overflow = 'visible';
    section.style.maxHeight = 'none';
  });

  const sidebars = root.querySelectorAll<HTMLElement>('.agx-sidebar, .agx-toolbar, .agx-qat');
  sidebars.forEach((el) => {
    capture(el);
    el.style.display = 'none';
  });

  const overlays = root.querySelectorAll<HTMLElement>('.agx-overlay, .agx-watermark');
  overlays.forEach((el) => {
    capture(el);
    el.style.display = 'none';
  });

  root.setAttribute('data-agx-print-expanded', 'true');

  return () => {
    for (const snap of snapshots) {
      if (snap.style) {
        snap.element.setAttribute('style', snap.style);
      } else {
        snap.element.removeAttribute('style');
      }
      snap.element.className = snap.className;
    }

    root.classList.remove(PRINT_CLASS, PRINT_PREP_CLASS);
    root.removeAttribute('data-agx-print-expanded');
    touched.length = 0;
  };
}
