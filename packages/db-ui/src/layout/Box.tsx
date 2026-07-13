import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type BoxProps = HTMLAttributes<HTMLElement> & {
  component?: ElementType;
  children?: ReactNode;
};

export function Box({ component: Tag = 'div', className, children, ...rest }: BoxProps) {
  return (
    <Tag className={cx(className)} {...rest}>
      {children}
    </Tag>
  );
}
