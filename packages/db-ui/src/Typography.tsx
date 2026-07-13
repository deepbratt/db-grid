import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from './utils/cx';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'button'
  | 'overline';

const variantMap: Record<TypographyVariant, { tag: ElementType; className: string }> = {
  h1: { tag: 'h1', className: 'text-5xl font-bold tracking-tight leading-none' },
  h2: { tag: 'h2', className: 'text-4xl font-bold tracking-tight leading-tight' },
  h3: { tag: 'h3', className: 'text-3xl font-semibold tracking-tight' },
  h4: { tag: 'h4', className: 'text-2xl font-semibold tracking-tight' },
  h5: { tag: 'h5', className: 'text-xl font-semibold' },
  h6: { tag: 'h6', className: 'text-lg font-semibold' },
  subtitle1: { tag: 'h6', className: 'text-base font-medium' },
  subtitle2: { tag: 'h6', className: 'text-sm font-semibold' },
  body1: { tag: 'p', className: 'text-base leading-relaxed' },
  body2: { tag: 'p', className: 'text-sm leading-relaxed' },
  caption: { tag: 'span', className: 'text-xs leading-normal' },
  button: { tag: 'span', className: 'text-sm font-semibold tracking-wide uppercase' },
  overline: { tag: 'span', className: 'text-[0.7rem] font-bold tracking-[0.12em] uppercase' },
};

export type TypographyProps = HTMLAttributes<HTMLElement> & {
  variant?: TypographyVariant;
  color?: 'inherit' | 'primary' | 'secondary' | 'error';
  gutterBottom?: boolean;
  children?: ReactNode;
  component?: ElementType;
};

export function Typography({
  variant = 'body1',
  color = 'inherit',
  gutterBottom,
  className,
  children,
  component,
  ...rest
}: TypographyProps) {
  const mapped = variantMap[variant];
  const Tag = component ?? mapped.tag;
  return (
    <Tag
      className={cx(
        mapped.className,
        color === 'primary' && 'text-[var(--mui-primary)]',
        color === 'secondary' && 'text-[var(--mui-text-secondary)]',
        color === 'error' && 'text-[var(--mui-error)]',
        color === 'inherit' && 'text-[var(--mui-text)]',
        gutterBottom && 'mb-2',
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
