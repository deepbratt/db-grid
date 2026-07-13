/**
 * Generates MUI-like Tailwind components for @db-grid/ui
 * Run: node scripts/gen-mui-ui.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'packages', 'db-ui', 'src');

function w(rel, content) {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content.trimStart());
  console.log('wrote', rel);
}

// ——— layout ———
w(
  'layout/Box.tsx',
  `import type { ElementType, HTMLAttributes, ReactNode } from 'react';
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
`
);

w(
  'layout/Container.tsx',
  `import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  children?: ReactNode;
};

const maxMap = {
  xs: 'max-w-sm',
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
};

export function Container({
  maxWidth = 'lg',
  disableGutters,
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={cx(
        'mx-auto w-full',
        !disableGutters && 'px-4 sm:px-6',
        maxWidth !== false && maxMap[maxWidth],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
`
);

w(
  'layout/Grid.tsx',
  `import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  container?: boolean;
  item?: boolean;
  spacing?: number;
  columns?: number;
  xs?: number | 'auto';
  sm?: number | 'auto';
  md?: number | 'auto';
  lg?: number | 'auto';
  children?: ReactNode;
};

function spanClass(prefix: string, n?: number | 'auto') {
  if (n == null) return undefined;
  if (n === 'auto') return \`\${prefix}:col-auto\`;
  return \`\${prefix}:col-span-\${n}\`;
}

export function Grid({
  container,
  item,
  spacing = 2,
  columns = 12,
  xs,
  sm,
  md,
  lg,
  className,
  children,
  style,
  ...rest
}: GridProps) {
  if (container) {
    return (
      <div
        className={cx('grid w-full', className)}
        style={{
          gridTemplateColumns: \`repeat(\${columns}, minmax(0, 1fr))\`,
          gap: \`\${spacing * 0.5}rem\`,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      className={cx(
        item && 'min-w-0',
        xs != null && (xs === 'auto' ? 'col-auto' : \`col-span-\${xs}\`),
        spanClass('sm', sm),
        spanClass('md', md),
        spanClass('lg', lg),
        className
      )}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}
`
);

w(
  'layout/ImageList.tsx',
  `import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';
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
      style={{ gridTemplateColumns: \`repeat(\${cols}, 1fr)\`, gap, ...style }}
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
`
);

// ——— inputs ———
w(
  'inputs/ButtonGroup.tsx',
  `import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'contained' | 'outlined' | 'text';
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  children?: ReactNode;
};

export function ButtonGroup({
  orientation = 'horizontal',
  fullWidth,
  className,
  children,
  ...rest
}: ButtonGroupProps) {
  return (
    <div
      role="group"
      className={cx(
        'inline-flex overflow-hidden rounded-lg border border-[var(--mui-divider)]',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
`
);

w(
  'inputs/Fab.tsx',
  `import type { ButtonHTMLAttributes, ReactNode } from 'react';
  import { cx } from '../utils/cx';

export type FabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: 'primary' | 'secondary' | 'default';
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'extended';
  children?: ReactNode;
};

const sizes = {
  small: 'h-10 min-w-10 px-0 text-sm',
  medium: 'h-14 min-w-14 px-0 text-base',
  large: 'h-16 min-w-16 px-0 text-lg',
};

export function Fab({
  color = 'primary',
  size = 'medium',
  variant = 'circular',
  className,
  children,
  type = 'button',
  ...rest
}: FabProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 font-semibold shadow-lg transition hover:brightness-110',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mui-primary)]',
        variant === 'circular' ? 'rounded-full' : 'rounded-full px-5',
        variant === 'extended' && size === 'medium' && 'h-12 min-w-[auto] px-5',
        sizes[size],
        color === 'primary' && 'bg-[var(--mui-primary)] text-[var(--mui-primary-contrast)]',
        color === 'secondary' && 'bg-[var(--mui-secondary)] text-white',
        color === 'default' && 'bg-[var(--mui-paper)] text-[var(--mui-text)] border border-[var(--mui-divider)]',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
`
);

w(
  'inputs/Radio.tsx',
  `import { createContext, useContext, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';

const RadioCtx = createContext<{ name?: string; value?: string; onChange?: (v: string) => void }>({});

export function RadioGroup({
  name,
  value,
  onChange,
  row,
  children,
  className,
}: {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  row?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <RadioCtx.Provider value={{ name, value, onChange }}>
      <div role="radiogroup" className={cx('flex gap-3', row ? 'flex-row flex-wrap' : 'flex-col', className)}>
        {children}
      </div>
    </RadioCtx.Provider>
  );
}

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  label?: ReactNode;
  value: string;
};

export function Radio({ label, value, className, disabled, ...rest }: RadioProps) {
  const ctx = useContext(RadioCtx);
  const checked = ctx.value != null ? ctx.value === value : rest.checked;
  return (
    <label className={cx('inline-flex items-center gap-2 text-sm cursor-pointer', disabled && 'opacity-50', className)}>
      <input
        type="radio"
        name={ctx.name}
        value={value}
        checked={checked}
        disabled={disabled}
        className="accent-[var(--mui-primary)]"
        onChange={() => ctx.onChange?.(value)}
        {...rest}
      />
      {label}
    </label>
  );
}
`
);

w(
  'inputs/Rating.tsx',
  `import { useState } from 'react';
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
    <div className={cx('inline-flex items-center gap-0.5', text, className)} role="img" aria-label={\`\${value} stars\`}>
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
`
);

w(
  'inputs/Slider.tsx',
  `import type { InputHTMLAttributes } from 'react';
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
`
);

w(
  'inputs/ToggleButton.tsx',
  `import { createContext, useContext, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';

type ToggleCtx = {
  value?: string | string[];
  exclusive?: boolean;
  onChange?: (value: string | string[] | null) => void;
};

const Ctx = createContext<ToggleCtx>({});

export function ToggleButtonGroup({
  value,
  exclusive,
  onChange,
  children,
  className,
}: {
  value?: string | string[];
  exclusive?: boolean;
  onChange?: (value: string | string[] | null) => void;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Ctx.Provider value={{ value, exclusive, onChange }}>
      <div role="group" className={cx('inline-flex overflow-hidden rounded-lg border border-[var(--mui-divider)]', className)}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export type ToggleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
  children?: ReactNode;
};

export function ToggleButton({ value, className, children, ...rest }: ToggleButtonProps) {
  const ctx = useContext(Ctx);
  const selected = Array.isArray(ctx.value) ? ctx.value.includes(value) : ctx.value === value;

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        'px-3 py-2 text-sm font-semibold transition border-r border-[var(--mui-divider)] last:border-r-0',
        selected
          ? 'bg-[color-mix(in_srgb,var(--mui-primary)_18%,transparent)] text-[var(--mui-primary)]'
          : 'bg-[var(--mui-paper)] text-[var(--mui-text)] hover:bg-[color-mix(in_srgb,var(--mui-text)_6%,transparent)]',
        className
      )}
      onClick={(e) => {
        rest.onClick?.(e);
        if (!ctx.onChange) return;
        if (ctx.exclusive) {
          ctx.onChange(selected ? null : value);
        } else {
          const cur = Array.isArray(ctx.value) ? ctx.value : ctx.value ? [ctx.value] : [];
          ctx.onChange(selected ? cur.filter((v) => v !== value) : [...cur, value]);
        }
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
`
);

w(
  'inputs/FormControl.tsx',
  `import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

export function FormControl({
  fullWidth,
  error,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { fullWidth?: boolean; error?: boolean; children?: ReactNode }) {
  return (
    <div
      className={cx('flex flex-col gap-1.5', fullWidth && 'w-full', error && 'text-[var(--mui-error)]', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function FormLabel({ className, children, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cx('text-xs font-semibold tracking-wide text-[var(--mui-text-secondary)]', className)} {...rest}>
      {children}
    </label>
  );
}

export function FormHelperText({
  error,
  className,
  children,
}: {
  error?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <p className={cx('m-0 text-xs', error ? 'text-[var(--mui-error)]' : 'text-[var(--mui-text-secondary)]', className)}>
      {children}
    </p>
  );
}

export function FormGroup({
  row,
  className,
  children,
}: {
  row?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return <div className={cx('flex gap-2', row ? 'flex-row flex-wrap' : 'flex-col', className)}>{children}</div>;
}

export function FormControlLabel({
  control,
  label,
  className,
}: {
  control: ReactNode;
  label: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx('inline-flex items-center gap-2 text-sm text-[var(--mui-text)] cursor-pointer', className)}>
      {control}
      <span>{label}</span>
    </label>
  );
}
`
);

w(
  'inputs/Autocomplete.tsx',
  `import { useMemo, useState, type ReactNode } from 'react';
import { TextField } from '../TextField';
import { Paper } from '../Paper';
import { cx } from '../utils/cx';

export type AutocompleteOption = string | { label: string; value: string };

function labelOf(o: AutocompleteOption) {
  return typeof o === 'string' ? o : o.label;
}
function valueOf(o: AutocompleteOption) {
  return typeof o === 'string' ? o : o.value;
}

export type AutocompleteProps = {
  options: AutocompleteOption[];
  value?: string;
  onChange?: (value: string | null) => void;
  label?: ReactNode;
  placeholder?: string;
  fullWidth?: boolean;
  freeSolo?: boolean;
  className?: string;
};

export function Autocomplete({
  options,
  value,
  onChange,
  label,
  placeholder = 'Search…',
  fullWidth,
  freeSolo,
  className,
}: AutocompleteProps) {
  const [query, setQuery] = useState(value ?? '');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 8);
    return options.filter((o) => labelOf(o).toLowerCase().includes(q)).slice(0, 8);
  }, [options, query]);

  return (
    <div className={cx('relative', fullWidth && 'w-full', className)}>
      <TextField
        label={label}
        fullWidth={fullWidth}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (freeSolo) onChange?.(e.target.value || null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && filtered.length > 0 && (
        <Paper elevation={4} className="absolute z-30 mt-1 max-h-56 w-full overflow-auto py-1">
          {filtered.map((o) => (
            <button
              key={valueOf(o)}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-[color-mix(in_srgb,var(--mui-primary)_10%,transparent)]"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQuery(labelOf(o));
                onChange?.(valueOf(o));
                setOpen(false);
              }}
            >
              {labelOf(o)}
            </button>
          ))}
        </Paper>
      )}
    </div>
  );
}
`
);

console.log('batch1 done');
