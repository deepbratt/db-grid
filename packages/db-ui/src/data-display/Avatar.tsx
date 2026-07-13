import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  src?: string;
  alt?: string;
  children?: ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'rounded' | 'square';
};

const sizes = { small: 'h-8 w-8 text-xs', medium: 'h-10 w-10 text-sm', large: 'h-14 w-14 text-lg' };

export function Avatar({ src, alt, children, size = 'medium', variant = 'circular', className, ...rest }: AvatarProps) {
  return (
    <div
      className={cx(
        'inline-flex items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--mui-primary)_20%,transparent)] text-[var(--mui-primary)] font-semibold',
        sizes[size],
        variant === 'circular' && 'rounded-full',
        variant === 'rounded' && 'rounded-xl',
        variant === 'square' && 'rounded-none',
        className
      )}
      {...rest}
    >
      {src ? <img src={src} alt={alt ?? ''} className="h-full w-full object-cover" /> : children}
    </div>
  );
}

export function AvatarGroup({ max = 3, children, className }: { max?: number; children: ReactNode; className?: string }) {
  const items = Array.isArray(children) ? children : [children];
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return (
    <div className={cx('flex -space-x-2', className)}>
      {shown}
      {extra > 0 && <Avatar size="small">+{extra}</Avatar>}
    </div>
  );
}

export type AvatarImgProps = ImgHTMLAttributes<HTMLImageElement>;
