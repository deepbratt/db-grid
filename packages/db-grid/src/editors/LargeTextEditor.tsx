import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';

export interface LargeTextEditorProps {
  value: any;
  onChange: (v: any) => void;
  onCommit: () => void;
  onCancel: () => void;
}

export function LargeTextEditor({ value, onChange, onCommit, onCancel }: LargeTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [onCancel]
  );

  const popupStyle: CSSProperties = {
    position: 'absolute',
    zIndex: 20,
    minWidth: 280,
    minHeight: 120,
    padding: 8,
    background: 'var(--agx-surface, #fff)',
    border: '1px solid var(--agx-line, #ccc)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  const textareaStyle: CSSProperties = {
    flex: 1,
    minHeight: 100,
    resize: 'vertical',
    font: 'inherit',
    padding: 6,
    boxSizing: 'border-box',
    border: '1px solid var(--agx-line, #ccc)',
  };

  return (
    <div className="agx-large-text-editor" style={popupStyle} onKeyDown={handleKeyDown}>
      <textarea
        ref={textareaRef}
        value={value == null ? '' : String(value)}
        onChange={(e) => onChange(e.target.value)}
        style={textareaStyle}
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" onClick={onCommit}>
          Commit
        </button>
      </div>
    </div>
  );
}
