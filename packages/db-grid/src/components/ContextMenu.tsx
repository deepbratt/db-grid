import { useEffect, useState } from 'react';
import type { ContextMenuItem } from '../types';

interface Props {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: Props) {
  const [submenu, setSubmenu] = useState<ContextMenuItem[] | null>(null);
  const [subPos, setSubPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [onClose]);

  const renderItems = (list: ContextMenuItem[], ox: number, oy: number) => (
    <ul className="agx-context-menu" style={{ left: ox, top: oy }} onClick={(e) => e.stopPropagation()}>
      {list.map((item, i) =>
        item.separator ? (
          <li key={i} className="agx-sep" />
        ) : (
          <li
            key={i}
            className={item.disabled ? 'disabled' : ''}
            onMouseEnter={(e) => {
              if (item.subMenu) {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setSubmenu(item.subMenu);
                setSubPos({ x: rect.right, y: rect.top });
              } else setSubmenu(null);
            }}
            onClick={() => {
              if (item.disabled || item.subMenu) return;
              item.action?.();
              onClose();
            }}
          >
            <span>{item.name}</span>
            {item.shortcut && <kbd>{item.shortcut}</kbd>}
            {item.subMenu && <span className="agx-more">›</span>}
          </li>
        )
      )}
    </ul>
  );

  return (
    <>
      {renderItems(items, x, y)}
      {submenu && renderItems(submenu, subPos.x, subPos.y)}
    </>
  );
}
