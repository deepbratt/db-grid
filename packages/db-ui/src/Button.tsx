import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from './utils/cx';

export type ButtonVariant = 'contained' | 'outlined' | 'text';
export type ButtonColor = 'primary' | 'secondary' | 'error' | 'inherit';
export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

const sizeClass: Record<ButtonSize, string> = {
  small: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  medium: 'h-10 px-4 text-sm gap-2 rounded-lg',
  large: 'h-12 px-5 text-base gap-2.5 rounded-xl',
};

const contained: Record<ButtonColor, string> = {
  primary:
    'bg-[var(--mui-primary)] text-[var(--mui-primary-contrast)] shadow-sm hover:brightness-110 active:brightness-95',
  secondary:
    'bg-[var(--mui-secondary)] text-white shadow-sm hover:brightness-110 active:brightness-95',
  error: 'bg-[var(--mui-error)] text-white shadow-sm hover:brightness-110 active:brightness-95',
  inherit: 'bg-[var(--mui-text)] text-[var(--mui-paper)] shadow-sm hover:opacity-90',
};

const outlined: Record<ButtonColor, string> = {
  primary:
    'border border-[var(--mui-primary)] text-[var(--mui-primary)] bg-transparent hover:bg-[color-mix(in_srgb,var(--mui-primary)_10%,transparent)]',
  secondary:
    'border border-[var(--mui-secondary)] text-[var(--mui-secondary)] bg-transparent hover:bg-[color-mix(in_srgb,var(--mui-secondary)_10%,transparent)]',
  error:
    'border border-[var(--mui-error)] text-[var(--mui-error)] bg-transparent hover:bg-[color-mix(in_srgb,var(--mui-error)_10%,transparent)]',
  inherit:
    'border border-[var(--mui-divider)] text-[var(--mui-text)] bg-transparent hover:bg-[color-mix(in_srgb,var(--mui-text)_6%,transparent)]',
};

const textVar: Record<ButtonColor, string> = {
  primary:
    'text-[var(--mui-primary)] bg-transparent hover:bg-[color-mix(in_srgb,var(--mui-primary)_10%,transparent)]',
  secondary:
    'text-[var(--mui-secondary)] bg-transparent hover:bg-[color-mix(in_srgb,var(--mui-secondary)_10%,transparent)]',
  error:
    'text-[var(--mui-error)] bg-transparent hover:bg-[color-mix(in_srgb,var(--mui-error)_10%,transparent)]',
  inherit:
    'text-[var(--mui-text)] bg-transparent hover:bg-[color-mix(in_srgb,var(--mui-text)_6%,transparent)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'contained',
    color = 'primary',
    size = 'medium',
    fullWidth,
    startIcon,
    endIcon,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref
) {
  const variantClass =
    variant === 'contained' ? contained[color] : variant === 'outlined' ? outlined[color] : textVar[color];

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cx(
        'inline-flex items-center justify-center font-semibold tracking-wide transition duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mui-primary)] focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-45',
        sizeClass[size],
        variantClass,
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {startIcon}
      <span>{children}</span>
      {endIcon}
    </button>
  );
});
