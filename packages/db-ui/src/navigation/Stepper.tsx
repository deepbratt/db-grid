import type { ReactNode } from 'react';
import { cx } from '../utils/cx';

export function Stepper({
  activeStep = 0,
  alternativeLabel,
  children,
  className,
}: {
  activeStep?: number;
  alternativeLabel?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const steps = Array.isArray(children) ? children : children != null ? [children] : [];
  return (
    <div className={cx('flex w-full', alternativeLabel ? 'justify-between' : 'items-center gap-2', className)}>
      {steps.map((child, i) => (
        <div key={i} className={cx('flex items-center gap-2', alternativeLabel && 'flex-1 flex-col text-center')}>
          <div
            className={cx(
              'grid h-8 w-8 place-items-center rounded-full text-sm font-bold',
              i <= activeStep
                ? 'bg-[var(--mui-primary)] text-[var(--mui-primary-contrast)]'
                : 'bg-[var(--mui-divider)] text-[var(--mui-text-secondary)]'
            )}
          >
            {i + 1}
          </div>
          <div className="text-sm">{child}</div>
          {!alternativeLabel && i < steps.length - 1 && (
            <div className="mx-2 h-px flex-1 bg-[var(--mui-divider)]" />
          )}
        </div>
      ))}
    </div>
  );
}

export function Step({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function StepLabel({ children }: { children?: ReactNode }) {
  return <span className="font-medium text-[var(--mui-text)]">{children}</span>;
}

export function StepContent({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cx('ml-4 border-l border-[var(--mui-divider)] py-2 pl-4 text-sm', className)}>{children}</div>;
}
