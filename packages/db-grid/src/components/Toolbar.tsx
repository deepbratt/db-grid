import type { LocaleText } from '../i18n/locale';
import { translate } from '../i18n/locale';

export interface ToolbarItem {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface ToolbarProps {
  items: ToolbarItem[];
  locale?: LocaleText;
}

export function Toolbar({ items, locale }: ToolbarProps) {
  return (
    <div className="agx-toolbar" role="toolbar" aria-label={translate(locale, 'toolbar', 'Toolbar')}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="agx-toolbar-btn"
          disabled={item.disabled}
          onClick={item.onClick}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
