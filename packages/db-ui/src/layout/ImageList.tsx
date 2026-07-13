import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type ImageListProps = HTMLAttributes<HTMLUListElement> & {
  cols?: number;
  gap?: number;
  children?: ReactNode;
};

export function ImageList({ cols = 3, gap = 8, className, children, style, ...rest }: ImageListProps) {
  return (
    <ul
      className={cx('m-0 grid list-none p-0', className)}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, ...style }}
      {...rest}
    >
      {children}
    </ul>
  );
}

export type ImageListItemProps = HTMLAttributes<HTMLLIElement> & {
  children?: ReactNode;
};

export function ImageListItem({ className, children, ...rest }: ImageListItemProps) {
  return (
    <li className={cx('overflow-hidden rounded-xl', className)} {...rest}>
      {children}
    </li>
  );
}

export function ImageListItemBar({
  title,
  subtitle,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('bg-black/55 px-3 py-2 text-white', className)}>
      <div className="text-sm font-semibold">{title}</div>
      {subtitle != null && <div className="text-xs opacity-80">{subtitle}</div>}
    </div>
  );
}

export type ImageProps = ImgHTMLAttributes<HTMLImageElement>;

export function ImageListImg({ className, alt = '', ...rest }: ImageProps) {
  return <img alt={alt} className={cx('h-full w-full object-cover', className)} {...rest} />;
}
