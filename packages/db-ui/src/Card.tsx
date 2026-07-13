import type { HTMLAttributes, ReactNode } from 'react';
import { Paper } from './Paper';
import { Typography } from './Typography';
import { cx } from './utils/cx';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  elevation?: 0 | 1 | 2 | 3 | 4;
};

export function Card({ className, children, elevation = 1, ...rest }: CardProps) {
  return (
    <Paper elevation={elevation} className={cx('overflow-hidden', className)} {...rest}>
      {children}
    </Paper>
  );
}

export function CardHeader({
  title,
  subheader,
  action,
  className,
}: {
  title: ReactNode;
  subheader?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('flex items-start justify-between gap-3 px-5 pt-5', className)}>
      <div>
        <Typography variant="h6">{title}</Typography>
        {subheader != null && (
          <Typography variant="body2" color="secondary" className="mt-1">
            {subheader}
          </Typography>
        )}
      </div>
      {action}
    </div>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return <div className={cx('px-5 py-4', className)}>{children}</div>;
}

export function CardActions({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return <div className={cx('flex flex-wrap items-center gap-2 px-5 pb-5', className)}>{children}</div>;
}
