import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import { LargeTextEditor } from './LargeTextEditor';
import { RichSelectEditor } from './RichSelectEditor';

export type CellEditorType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'richSelect'
  | 'largeText';

export interface CellEditorProps {
  type: CellEditorType;
  value: any;
  values?: any[];
  onChange: (v: any) => void;
  onCommit: () => void;
  onCancel: () => void;
}

export function CellEditor({
  type,
  value,
  values,
  onChange,
  onCommit,
  onCancel,
}: CellEditorProps) {
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (inputRef.current instanceof HTMLInputElement) inputRef.current.select();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onCommit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [onCommit, onCancel]
  );

  const commonStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    border: '2px solid var(--agx-accent, #0f766e)',
    font: 'inherit',
    padding: '2px 4px',
    background: 'var(--agx-surface, #fff)',
  };

  switch (type) {
    case 'number':
      return (
        <input
          ref={inputRef as RefObject<HTMLInputElement>}
          type="number"
          value={value == null ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          onKeyDown={handleKeyDown}
          onBlur={onCommit}
          style={commonStyle}
        />
      );
    case 'date': {
      const dateVal =
        value instanceof Date
          ? value.toISOString().slice(0, 10)
          : value == null
            ? ''
            : String(value).slice(0, 10);
      return (
        <input
          ref={inputRef as RefObject<HTMLInputElement>}
          type="date"
          value={dateVal}
          onChange={(e) => onChange(e.target.value || null)}
          onKeyDown={handleKeyDown}
          onBlur={onCommit}
          style={commonStyle}
        />
      );
    }
    case 'boolean':
      return (
        <select
          ref={inputRef as RefObject<HTMLSelectElement>}
          value={value == null ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === 'true')}
          onKeyDown={handleKeyDown}
          onBlur={onCommit}
          style={commonStyle}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    case 'select':
      return (
        <select
          ref={inputRef as RefObject<HTMLSelectElement>}
          value={value == null ? '' : String(value)}
          onChange={(e) => {
            const raw = e.target.value;
            const match = values?.find((v) => String(v) === raw);
            onChange(match ?? raw);
          }}
          onKeyDown={handleKeyDown}
          onBlur={onCommit}
          style={commonStyle}
        >
          {(values ?? []).map((v) => (
            <option key={String(v)} value={String(v)}>
              {String(v)}
            </option>
          ))}
        </select>
      );
    case 'richSelect':
      return (
        <RichSelectEditor
          value={value}
          values={values ?? []}
          onChange={onChange}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
    case 'largeText':
      return (
        <LargeTextEditor
          value={value}
          onChange={onChange}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
    default:
      return (
        <input
          ref={inputRef as RefObject<HTMLInputElement>}
          type="text"
          value={value == null ? '' : String(value)}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onCommit}
          style={commonStyle}
        />
      );
  }
}
