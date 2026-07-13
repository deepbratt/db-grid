import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';

export interface RichSelectEditorProps {
  value: any;
  values: any[];
  onChange: (v: any) => void;
  onCommit: () => void;
  onCancel: () => void;
}

export function RichSelectEditor({
  value,
  values,
  onChange,
  onCommit,
  onCancel,
}: RichSelectEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(true);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return values;
    return values.filter((v) => String(v).toLowerCase().includes(q));
  }, [values, query]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered.length === 1) {
          onChange(filtered[0]);
          onCommit();
        } else {
          onCommit();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [filtered, onChange, onCommit, onCancel]
  );

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    border: '2px solid var(--agx-accent, #0f766e)',
    font: 'inherit',
    padding: '2px 4px',
    background: 'var(--agx-surface, #fff)',
  };

  const listStyle: CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 10,
    maxHeight: 180,
    overflowY: 'auto',
    background: 'var(--agx-surface, #fff)',
    border: '1px solid var(--agx-line, #ccc)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  };

  return (
    <div className="agx-rich-select-editor" style={containerStyle}>
      <input
        ref={inputRef}
        type="text"
        value={query || (value == null ? '' : String(value))}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        placeholder="Search..."
        style={inputStyle}
      />
      {open && filtered.length > 0 && (
        <div className="agx-rich-select-list" style={listStyle}>
          {filtered.map((v) => {
            const label = String(v);
            const selected = value != null && String(value) === label;
            return (
              <button
                key={label}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(v);
                  setQuery('');
                  onCommit();
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 8px',
                  border: 'none',
                  background: selected ? 'var(--agx-accent-soft, #e6f4f1)' : 'transparent',
                  cursor: 'pointer',
                  font: 'inherit',
                  fontSize: 13,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
