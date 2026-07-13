import { useState, type ReactNode } from 'react';
import { Fab } from '../inputs/Fab';
import { cx } from '../utils/cx';

export function SpeedDial({
  ariaLabel,
  icon = '+',
  openIcon = '×',
  children,
  className,
}: {
  ariaLabel: string;
  icon?: ReactNode;
  openIcon?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cx('fixed bottom-6 right-6 z-40 flex flex-col-reverse items-center gap-3', className)}>
      <Fab aria-label={ariaLabel} onClick={() => setOpen((v) => !v)}>
        {open ? openIcon : icon}
      </Fab>
      {open && <div className="flex flex-col-reverse items-center gap-2">{children}</div>}
    </div>
  );
}

export function SpeedDialAction({
  icon,
  tooltipTitle,
  onClick,
}: {
  icon: ReactNode;
  tooltipTitle?: string;
  onClick?: () => void;
}) {
  return (
    <Fab size="small" color="default" title={tooltipTitle} onClick={onClick}>
      {icon}
    </Fab>
  );
}
