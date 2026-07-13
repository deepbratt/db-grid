import { useState } from 'react';
import { cx } from '../utils/cx';

export type RatingProps = {
  value?: number;
  defaultValue?: number;
  max?: number;
  precision?: 0.5 | 1;
  readOnly?: boolean;
  onChange?: (value: number) => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
};

export function Rating({
  value: controlled,
  defaultValue = 0,
  max = 5,
  readOnly,
  onChange,
  size = 'medium',
  className,
}: RatingProps) {
  const [inner, setInner] = useState(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  const value = controlled ?? inner;
  const display = hover ?? value;
  const text = size === 'small' ? 'text-base' : size === 'large' ? 'text-3xl' : 'text-2xl';

  return (
    <div className={cx('inline-flex items-center gap-0.5', text, className)} role="img" aria-label={`${value} stars`}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = display >= starValue;
        return (
          <button
            key={starValue}
            type="button"
            disabled={readOnly}
            className={cx(
              'leading-none transition',
              filled ? 'text-amber-400' : 'text-[var(--mui-divider)]',
              !readOnly && 'cursor-pointer hover:scale-110'
            )}
            onMouseEnter={() => !readOnly && setHover(starValue)}
            onMouseLeave={() => setHover(null)}
            onClick={() => {
              if (readOnly) return;
              setInner(starValue);
              onChange?.(starValue);
            }}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
