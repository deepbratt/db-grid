import { useMemo, useState, type ReactNode } from 'react';
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
