import { useMemo } from 'react';
import { translate, type LocaleText } from '../i18n/locale';

export function useLocale(localeText?: LocaleText): (key: string) => string {
  return useMemo(() => (key: string) => translate(localeText, key), [localeText]);
}

export type { LocaleText };
