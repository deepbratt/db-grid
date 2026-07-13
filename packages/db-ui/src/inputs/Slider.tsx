import type { InputHTMLAttributes } from 'react';
import { cx } from '../utils/cx';

export type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  valueLabelDisplay?: 'auto' | 'on' | 'off';
  marks?: boolean;
};

export function Slider({ className, disabled, valueLabelDisplay = 'off', ...rest }: SliderProps) {
  return (
    <div className={cx('flex w-full flex-col gap-1', className)}>
      <input
        type="range"
        disabled={disabled}
        className={cx(
          'w-full accent-[var(--mui-primary)] disabled:opacity-50',
          'h-2 cursor-pointer appearance-none rounded-full bg-[var(--mui-divider)]'
        )}
        {...rest}
      />
      {valueLabelDisplay !== 'off' && rest.value != null && (
        <span className="text-xs text-[var(--mui-text-secondary)]">{String(rest.value)}</span>
      )}
    </div>
  );
}
