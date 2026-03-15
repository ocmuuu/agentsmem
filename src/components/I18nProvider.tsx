'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { getMessages, type Locale, type TranslationKey } from '@/i18n/translations';

const defaultLocale: Locale = 'en';
const defaultMessages = getMessages(defaultLocale);

const I18nContext = createContext<{ locale: Locale; t: (key: string) => string }>({
  locale: defaultLocale,
  t: (key: string) => defaultMessages[key as TranslationKey] ?? key,
});

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const dict = getMessages(locale);
  const t = (key: string) => dict[key as TranslationKey] ?? defaultMessages[key as TranslationKey] ?? key;
  return (
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations() {
  return useContext(I18nContext);
}
