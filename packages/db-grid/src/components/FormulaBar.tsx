import { useCallback, type KeyboardEvent } from 'react';

export interface FormulaBarProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FormulaBar({
  value,
  onChange,
  onCommit,
  placeholder = 'Enter formula…',
  disabled = false,
  className,
}: FormulaBarProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onCommit();
      }
    },
    [onCommit]
  );

  return (
    <div
      className={['agx-formula-bar', className].filter(Boolean).join(' ')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        borderBottom: '1px solid var(--agx-line, #ccc)',
        background: 'var(--agx-header-bg, #f8f8f8)',
      }}
    >
      <span
        className="agx-formula-bar-label"
        style={{ fontSize: 12, fontWeight: 600, color: 'var(--agx-muted, #666)', userSelect: 'none' }}
      >
        fx
      </span>
      <input
        type="text"
        className="agx-formula-bar-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCommit}
        placeholder={placeholder}
        disabled={disabled}
        spellCheck={false}
        style={{
          flex: 1,
          border: '1px solid var(--agx-line, #ccc)',
          borderRadius: 2,
          padding: '4px 8px',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 13,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
